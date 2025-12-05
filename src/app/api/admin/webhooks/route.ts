/**
 * Admin Webhooks Management API
 * GET /api/admin/webhooks - List webhooks
 * POST /api/admin/webhooks - Create webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { tenantWebhookService, WEBHOOK_EVENTS, type WebhookEvent } from '@/lib/webhooks'

// GET - List webhooks
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = session.user as any
        const role = String(user.role || '').toUpperCase()

        if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const tenantId = user.tenantId
        if (!tenantId) {
            return NextResponse.json(
                { success: false, error: 'Tenant required' },
                { status: 400 }
            )
        }

        const webhooks = await tenantWebhookService.list(tenantId)

        // Mask secrets for display
        const safeWebhooks = webhooks.map(webhook => ({
            id: webhook.id,
            url: webhook.url,
            events: webhook.events,
            description: webhook.description,
            isActive: webhook.isActive,
            createdAt: webhook.createdAt,
            updatedAt: webhook.updatedAt,
            secretMasked: webhook.secret.substring(0, 12) + '...',
        }))

        return NextResponse.json({
            success: true,
            data: {
                webhooks: safeWebhooks,
                availableEvents: WEBHOOK_EVENTS,
            },
        })
    } catch (error) {
        console.error('List webhooks error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to list webhooks' },
            { status: 500 }
        )
    }
}

// POST - Create webhook
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = session.user as any
        const role = String(user.role || '').toUpperCase()

        if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            )
        }

        const tenantId = user.tenantId
        if (!tenantId) {
            return NextResponse.json(
                { success: false, error: 'Tenant required' },
                { status: 400 }
            )
        }

        const body = await request.json().catch(() => ({}))
        const { url, events, description } = body

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            )
        }

        try {
            const parsed = new URL(url)
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new Error('Invalid protocol')
            }
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            )
        }

        // Validate events
        if (!events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one event is required' },
                { status: 400 }
            )
        }

        const validEvents = Object.keys(WEBHOOK_EVENTS)
        const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
        if (invalidEvents.length > 0) {
            return NextResponse.json(
                { success: false, error: `Invalid events: ${invalidEvents.join(', ')}` },
                { status: 400 }
            )
        }

        // Create webhook
        const webhook = await tenantWebhookService.register({
            tenantId,
            url,
            events: events as WebhookEvent[],
            description,
        })

        return NextResponse.json({
            success: true,
            data: {
                id: webhook.id,
                url: webhook.url,
                events: webhook.events,
                description: webhook.description,
                secret: webhook.secret, // Only shown once!
                isActive: webhook.isActive,
                createdAt: webhook.createdAt,
                warning: 'The secret will only be shown once. Store it securely for signature verification.',
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Create webhook error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create webhook' },
            { status: 500 }
        )
    }
}
