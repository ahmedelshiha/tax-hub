/**
 * Admin SSO Connection - Single Connection Operations
 * GET /api/admin/sso/[id] - Get connection details
 * PUT /api/admin/sso/[id] - Update connection
 * DELETE /api/admin/sso/[id] - Delete connection
 * POST /api/admin/sso/[id]/test - Test connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { ssoService } from '@/lib/sso'
import { prisma } from '@/lib/prisma'

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

// GET - Get SSO connection details
export async function GET(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid connection ID' }, { status: 400 })
        }

        const connection = await (prisma as any).ssoConnection.findFirst({
            where: { id, tenantId: auth.tenantId },
        })

        if (!connection) {
            return NextResponse.json({ success: false, error: 'SSO connection not found' }, { status: 404 })
        }

        // Get tenant for SP metadata
        const tenant = await prisma.tenant.findUnique({
            where: { id: auth.tenantId },
            select: { slug: true },
        })

        const spMetadata = tenant?.slug ? ssoService.getSpMetadata(tenant.slug) : null
        const spMetadataXml = tenant?.slug ? ssoService.generateSpMetadataXml(tenant.slug) : null

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
                lastTestAt: connection.lastTestAt,
                lastTestResult: connection.lastTestResult,
                createdAt: connection.createdAt,
                updatedAt: connection.updatedAt,
                hasCertificate: !!connection.certificate,
                spMetadata,
                spMetadataXml,
            },
        })
    } catch (error) {
        console.error('Get SSO connection error:', error)
        return NextResponse.json({ success: false, error: 'Failed to get SSO connection' }, { status: 500 })
    }
}

// PUT - Update SSO connection
export async function PUT(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid connection ID' }, { status: 400 })
        }

        const existing = await (prisma as any).ssoConnection.findFirst({
            where: { id, tenantId: auth.tenantId },
        })

        if (!existing) {
            return NextResponse.json({ success: false, error: 'SSO connection not found' }, { status: 404 })
        }

        const body = await request.json().catch(() => ({}))
        const { name, entityId, ssoUrl, certificate, emailDomains, enabled } = body

        const updateData: any = { updatedAt: new Date() }
        if (name !== undefined) updateData.name = name
        if (entityId !== undefined) updateData.entityId = entityId
        if (ssoUrl !== undefined) updateData.ssoUrl = ssoUrl
        if (certificate !== undefined) updateData.certificate = certificate
        if (enabled !== undefined) updateData.enabled = enabled
        if (emailDomains !== undefined && Array.isArray(emailDomains)) {
            updateData.emailDomains = emailDomains
                .map((d: string) => d.toLowerCase().trim())
                .filter((d: string) => d.length > 0)
        }

        const updated = await (prisma as any).ssoConnection.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            data: {
                id: updated.id,
                name: updated.name,
                provider: updated.provider,
                enabled: updated.enabled,
                updatedAt: updated.updatedAt,
            },
        })
    } catch (error) {
        console.error('Update SSO connection error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update SSO connection' }, { status: 500 })
    }
}

// DELETE - Delete SSO connection
export async function DELETE(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid connection ID' }, { status: 400 })
        }

        const existing = await (prisma as any).ssoConnection.findFirst({
            where: { id, tenantId: auth.tenantId },
        })

        if (!existing) {
            return NextResponse.json({ success: false, error: 'SSO connection not found' }, { status: 404 })
        }

        await ssoService.deleteConnection(id, auth.tenantId)

        return NextResponse.json({
            success: true,
            message: 'SSO connection deleted successfully',
        })
    } catch (error) {
        console.error('Delete SSO connection error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete SSO connection' }, { status: 500 })
    }
}

// POST - Test SSO connection
export async function POST(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        const auth = await requireAdmin(session)
        if ('error' in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json({ success: false, error: 'Invalid connection ID' }, { status: 400 })
        }

        const result = await ssoService.testConnection(id, auth.tenantId)

        return NextResponse.json({
            success: result.success,
            data: {
                tested: true,
                result: result.success ? 'Connection OK' : result.error,
            },
        })
    } catch (error) {
        console.error('Test SSO connection error:', error)
        return NextResponse.json({ success: false, error: 'Failed to test SSO connection' }, { status: 500 })
    }
}
