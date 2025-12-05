/**
 * Admin Webhook Management - Single Webhook Operations
 * GET /api/admin/webhooks/[id] - Get webhook details
 * PUT /api/admin/webhooks/[id] - Update webhook
 * DELETE /api/admin/webhooks/[id] - Delete webhook
 * POST /api/admin/webhooks/[id]/test - Test webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { tenantWebhookService, WEBHOOK_EVENTS, type WebhookEvent } from '@/lib/webhooks'

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> } | any

async function resolveId(ctx: any): Promise<string | undefined> {
    try {
        const p = ctx?.params
        const v = p && typeof p.then === 'function' ? await p : p
        return v?.id
    } catch { return undefined }
}

async function requireAdmin(session: any) {
    if (!session?.user) return { error: 'Unauthorized', status: 401 }
    const user = session.user as any
    const role = String(user.role || '').toUpperCase()
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return { error: 'Forbidden', status: 403 }
    if (!user.tenantId) return { error: 'Tenant required', status: 400 }
    return { user, tenantId: user.tenantId }
}

// GET - Get webhook details with deliveries
export async function GET(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid webhook ID' }, { status: 400 })
        }

        const webhook = await tenantWebhookService.get(id, auth.tenantId)
        if (!webhook) {
            return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 })
        }

        // Get recent deliveries
        const deliveries = await tenantWebhookService.getDeliveries(id, 20)

        return NextResponse.json({
            success: true,
            data: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
                description: webhook.description,
                isActive: webhook.isActive,
                createdAt: webhook.createdAt,
                updatedAt: webhook.updatedAt,
                secretMasked: webhook.secret.substring(0, 12) + '...',
                recentDeliveries: deliveries.map(d => ({
                    id: d.id,
                    event: d.event,
                    status: d.status,
                    statusCode: d.statusCode,
                    attempts: d.attempts,
                    createdAt: d.createdAt,
                    deliveredAt: d.deliveredAt,
                })),
            },
        })
    } catch (error) {
        console.error('Get webhook error:', error)
        return NextResponse.json({ success: false, error: 'Failed to get webhook' }, { status: 500 })
    }
}

// PUT - Update webhook
export async function PUT(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid webhook ID' }, { status: 400 })
        }

        const existing = await tenantWebhookService.get(id, auth.tenantId)
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 })
        }

        const body = await request.json().catch(() => ({}))
        const { url, events, description, isActive } = body

        // Validate URL if provided
        if (url) {
            try {
                const parsed = new URL(url)
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    throw new Error('Invalid protocol')
                }
            } catch {
                return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 })
            }
        }

        // Validate events if provided
        if (events) {
            const validEvents = Object.keys(WEBHOOK_EVENTS)
            const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
            if (invalidEvents.length > 0) {
                return NextResponse.json(
                    { success: false, error: `Invalid events: ${invalidEvents.join(', ')}` },
                    { status: 400 }
                )
            }
        }

        const updated = await tenantWebhookService.update(id, auth.tenantId, {
            url,
            events: events as WebhookEvent[],
            description,
            isActive,
        })

        return NextResponse.json({
            success: true,
            data: {
                id: updated?.id,
                url: updated?.url,
                events: updated?.events,
                description: updated?.description,
                isActive: updated?.isActive,
                updatedAt: updated?.updatedAt,
            },
        })
    } catch (error) {
        console.error('Update webhook error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update webhook' }, { status: 500 })
    }
}

// DELETE - Delete webhook
export async function DELETE(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid webhook ID' }, { status: 400 })
        }

        const existing = await tenantWebhookService.get(id, auth.tenantId)
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 })
        }

        await tenantWebhookService.delete(id, auth.tenantId)

        return NextResponse.json({
            success: true,
            message: 'Webhook deleted successfully',
        })
    } catch (error) {
        console.error('Delete webhook error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete webhook' }, { status: 500 })
    }
}

// POST - Test webhook (special action)
export async function POST(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid webhook ID' }, { status: 400 })
        }

        const webhook = await tenantWebhookService.get(id, auth.tenantId)
        if (!webhook) {
            return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 })
        }

        // Send test webhook
        const result = await tenantWebhookService.test(webhook)

        return NextResponse.json({
            success: result.success,
            data: {
                deliveryId: result.deliveryId,
                statusCode: result.statusCode,
                error: result.error,
            },
        })
    } catch (error) {
        console.error('Test webhook error:', error)
        return NextResponse.json({ success: false, error: 'Failed to test webhook' }, { status: 500 })
    }
}
