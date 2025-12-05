/**
 * Admin SSO Connections Management API
 * GET /api/admin/sso - List SSO connections
 * POST /api/admin/sso - Create/update SSO connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { ssoService, SSO_PROVIDERS, type SsoProvider } from '@/lib/sso'
import { prisma } from '@/lib/prisma'

// GET - List SSO connections
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

        // Get tenant slug for SP metadata
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { slug: true },
        })

        const connections = await ssoService.listConnections(tenantId)
        const spMetadata = tenant?.slug ? ssoService.getSpMetadata(tenant.slug) : null

        // Mask sensitive fields
        const safeConnections = connections.map((conn: any) => ({
            id: conn.id,
            name: conn.name,
            provider: conn.provider,
            enabled: conn.enabled,
            entityId: conn.entityId,
            ssoUrl: conn.ssoUrl,
            emailDomains: conn.emailDomains,
            lastTestAt: conn.lastTestAt,
            lastTestResult: conn.lastTestResult,
            createdAt: conn.createdAt,
            updatedAt: conn.updatedAt,
            hasCertificate: !!conn.certificate,
            hasClientSecret: !!conn.clientSecret,
        }))

        return NextResponse.json({
            success: true,
            data: {
                connections: safeConnections,
                providers: SSO_PROVIDERS,
                spMetadata,
            },
        })
    } catch (error) {
        console.error('List SSO connections error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to list SSO connections' },
            { status: 500 }
        )
    }
}

// POST - Create or update SSO connection
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
        const {
            name,
            provider,
            entityId,
            ssoUrl,
            certificate,
            clientId,
            clientSecret,
            discoveryUrl,
            emailDomains,
            enabled,
        } = body

        // Validate provider
        if (!provider || !Object.keys(SSO_PROVIDERS).includes(provider)) {
            return NextResponse.json(
                { success: false, error: `Invalid provider. Must be: ${Object.keys(SSO_PROVIDERS).join(', ')}` },
                { status: 400 }
            )
        }

        // Validate name
        if (!name || typeof name !== 'string' || name.length < 2) {
            return NextResponse.json(
                { success: false, error: 'Name must be at least 2 characters' },
                { status: 400 }
            )
        }

        // Validate SAML config
        if (provider === 'saml' && enabled) {
            if (!ssoUrl || !certificate) {
                return NextResponse.json(
                    { success: false, error: 'SAML requires SSO URL and certificate' },
                    { status: 400 }
                )
            }
        }

        // Validate email domains if provided
        let validEmailDomains: string[] = []
        if (emailDomains && Array.isArray(emailDomains)) {
            validEmailDomains = emailDomains
                .map((d: string) => d.toLowerCase().trim())
                .filter((d: string) => d.length > 0 && d.includes('.'))
        }

        const connection = await ssoService.upsertConnection({
            tenantId,
            name,
            provider: provider as SsoProvider,
            entityId,
            ssoUrl,
            certificate,
            clientId,
            clientSecret,
            discoveryUrl,
            emailDomains: validEmailDomains,
            enabled: enabled ?? false,
        })

        return NextResponse.json({
            success: true,
            data: {
                id: connection.id,
                name: connection.name,
                provider: connection.provider,
                enabled: connection.enabled,
                entityId: connection.entityId,
                ssoUrl: connection.ssoUrl,
                emailDomains: connection.emailDomains,
                createdAt: connection.createdAt,
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Create SSO connection error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create SSO connection' },
            { status: 500 }
        )
    }
}
