/**
 * Tenant Webhook Service
 * Manages webhook subscriptions and dispatches events
 */

import { createHmac, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

// Supported webhook events
export const WEBHOOK_EVENTS = {
    'entity.created': 'New entity submitted',
    'entity.approved': 'Entity approved',
    'entity.rejected': 'Entity rejected',
    'license.expiring': 'License expiring soon',
    'user.invited': 'User invited to tenant',
} as const

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS

// Define types locally until Prisma is regenerated
export interface TenantWebhookRecord {
    id: string
    tenantId: string
    url: string
    secret: string
    events: string[]
    isActive: boolean
    description: string | null
    createdAt: Date
    updatedAt: Date
}

export interface WebhookDeliveryRecord {
    id: string
    webhookId: string
    event: string
    payload: any
    status: string
    statusCode: number | null
    responseBody: string | null
    attempts: number
    nextRetryAt: Date | null
    createdAt: Date
    deliveredAt: Date | null
}

export interface WebhookPayload {
    event: WebhookEvent
    timestamp: string
    tenantId: string
    data: Record<string, any>
    signature?: string
}

export interface DispatchResult {
    webhookId: string
    deliveryId: string
    success: boolean
    statusCode?: number
    error?: string
}

class TenantWebhookService {
    private readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
    private readonly MAX_RETRIES = 3

    /**
     * Create a webhook signature using HMAC-SHA256
     */
    private signPayload(payload: Omit<WebhookPayload, 'signature'>, secret: string): string {
        const hmac = createHmac('sha256', secret)
        hmac.update(JSON.stringify(payload))
        return `sha256=${hmac.digest('hex')}`
    }

    /**
     * Register a new webhook for a tenant
     */
    async register(params: {
        tenantId: string
        url: string
        events: WebhookEvent[]
        description?: string
    }): Promise<TenantWebhookRecord> {
        // Generate random secret
        const secret = this.generateSecret()

        return (prisma as any).tenantWebhook.create({
            data: {
                tenantId: params.tenantId,
                url: params.url,
                secret,
                events: params.events,
                description: params.description,
                isActive: true,
            },
        })
    }

    /**
     * Generate a random webhook secret
     */
    private generateSecret(): string {
        return `whsec_${randomBytes(24).toString('base64url')}`
    }

    /**
     * List webhooks for a tenant
     */
    async list(tenantId: string): Promise<TenantWebhookRecord[]> {
        return (prisma as any).tenantWebhook.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Get webhook by ID
     */
    async get(id: string, tenantId: string): Promise<TenantWebhookRecord | null> {
        return (prisma as any).tenantWebhook.findFirst({
            where: { id, tenantId },
        })
    }

    /**
     * Update webhook configuration
     */
    async update(
        id: string,
        tenantId: string,
        data: Partial<{
            url: string
            events: WebhookEvent[]
            description: string
            isActive: boolean
        }>
    ): Promise<TenantWebhookRecord | null> {
        return (prisma as any).tenantWebhook.update({
            where: { id, tenantId },
            data,
        })
    }

    /**
     * Delete a webhook
     */
    async delete(id: string, tenantId: string): Promise<void> {
        await (prisma as any).tenantWebhook.delete({
            where: { id, tenantId },
        })
    }

    /**
     * Dispatch an event to all subscribed webhooks
     */
    async dispatch(
        tenantId: string,
        event: WebhookEvent,
        data: Record<string, any>
    ): Promise<DispatchResult[]> {
        // Find all active webhooks subscribed to this event
        const webhooks = await (prisma as any).tenantWebhook.findMany({
            where: {
                tenantId,
                isActive: true,
                events: { has: event },
            },
        })

        if (webhooks.length === 0) {
            return []
        }

        const results: DispatchResult[] = []

        for (const webhook of webhooks) {
            const result = await this.deliverWebhook(webhook, event, data)
            results.push(result)
        }

        return results
    }

    /**
     * Deliver a single webhook
     */
    private async deliverWebhook(
        webhook: TenantWebhookRecord,
        event: WebhookEvent,
        data: Record<string, any>,
        attempt: number = 1
    ): Promise<DispatchResult> {
        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            tenantId: webhook.tenantId,
            data,
        }

        // Add signature
        payload.signature = this.signPayload(payload, webhook.secret)

        // Create delivery record
        const delivery = await (prisma as any).webhookDelivery.create({
            data: {
                webhookId: webhook.id,
                event,
                payload: payload as any,
                status: 'pending',
                attempts: attempt,
            },
        })

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT)

            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': payload.signature,
                    'X-Webhook-Event': event,
                    'X-Webhook-Delivery': delivery.id,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            let responseBody: string | undefined
            try {
                responseBody = await response.text()
            } catch { }

            // Update delivery record
            await (prisma as any).webhookDelivery.update({
                where: { id: delivery.id },
                data: {
                    status: response.ok ? 'success' : 'failed',
                    statusCode: response.status,
                    responseBody: responseBody?.substring(0, 1000),
                    deliveredAt: response.ok ? new Date() : undefined,
                },
            })

            if (!response.ok && attempt < this.MAX_RETRIES) {
                // Schedule retry
                this.scheduleRetry(webhook, event, data, delivery.id, attempt)
            }

            return {
                webhookId: webhook.id,
                deliveryId: delivery.id,
                success: response.ok,
                statusCode: response.status,
                error: !response.ok ? `HTTP ${response.status}` : undefined,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            await (prisma as any).webhookDelivery.update({
                where: { id: delivery.id },
                data: {
                    status: 'failed',
                    responseBody: errorMessage,
                },
            })

            if (attempt < this.MAX_RETRIES) {
                this.scheduleRetry(webhook, event, data, delivery.id, attempt)
            }

            return {
                webhookId: webhook.id,
                deliveryId: delivery.id,
                success: false,
                error: errorMessage,
            }
        }
    }

    /**
     * Schedule a retry with exponential backoff
     */
    private scheduleRetry(
        webhook: TenantWebhookRecord,
        event: WebhookEvent,
        data: Record<string, any>,
        deliveryId: string,
        attempt: number
    ): void {
        const delayMs = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s...

        setTimeout(async () => {
            await (prisma as any).webhookDelivery.update({
                where: { id: deliveryId },
                data: {
                    status: 'pending',
                    attempts: attempt + 1,
                },
            })

            await this.deliverWebhook(webhook, event, data, attempt + 1)
        }, delayMs)
    }

    /**
     * Get delivery history for a webhook
     */
    async getDeliveries(
        webhookId: string,
        limit: number = 50
    ): Promise<WebhookDeliveryRecord[]> {
        return (prisma as any).webhookDelivery.findMany({
            where: { webhookId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        })
    }

    /**
     * Retry a failed delivery
     */
    async retryDelivery(deliveryId: string): Promise<DispatchResult | null> {
        const delivery = await (prisma as any).webhookDelivery.findUnique({
            where: { id: deliveryId },
            include: { webhook: true },
        })

        if (!delivery || !delivery.webhook) {
            return null
        }

        const payload = delivery.payload as WebhookPayload
        return this.deliverWebhook(
            delivery.webhook,
            payload.event as WebhookEvent,
            payload.data,
            delivery.attempts + 1
        )
    }

    /**
     * Test a webhook by sending a test event
     */
    async test(webhook: TenantWebhookRecord): Promise<DispatchResult> {
        return this.deliverWebhook(
            webhook,
            'entity.created' as WebhookEvent,
            {
                test: true,
                message: 'This is a test webhook delivery',
                timestamp: new Date().toISOString(),
            }
        )
    }
}

export const tenantWebhookService = new TenantWebhookService()
