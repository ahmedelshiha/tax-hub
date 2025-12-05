/**
 * Admin API Key Management - Single Key Operations
 * DELETE /api/admin/api-keys/[id] - Revoke key
 * GET /api/admin/api-keys/[id] - Get key details
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { apiKeyService } from '@/lib/api-keys'

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> } | any

async function resolveId(ctx: any): Promise<string | undefined> {
    try {
        const p = ctx?.params
        const v = p && typeof p.then === 'function' ? await p : p
        return v?.id
    } catch { return undefined }
}

// GET - Get API key details
export async function GET(request: NextRequest, context: Ctx) {
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

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invalid key ID' },
                { status: 400 }
            )
        }

        const tenantId = user.tenantId
        const apiKey = await apiKeyService.getKey(id, tenantId) as any

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API key not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                id: apiKey?.id,
                name: apiKey?.name,
                keyPrefix: apiKey?.keyPrefix,
                scopes: apiKey?.scopes,
                isActive: apiKey?.isActive,
                expiresAt: apiKey?.expiresAt,
                lastUsedAt: apiKey?.lastUsedAt,
                lastUsedIp: apiKey?.lastUsedIp,
                createdAt: apiKey?.createdAt,
                revokedAt: apiKey?.revokedAt,
                user: apiKey?.user,
            },
        })
    } catch (error) {
        console.error('Get API key error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get API key' },
            { status: 500 }
        )
    }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest, context: Ctx) {
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

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invalid key ID' },
                { status: 400 }
            )
        }

        const tenantId = user.tenantId

        // Check if key exists
        const existing = await apiKeyService.getKey(id, tenantId)
        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'API key not found' },
                { status: 404 }
            )
        }

        // Revoke the key (soft delete)
        await apiKeyService.revokeKey(id, tenantId)

        return NextResponse.json({
            success: true,
            message: 'API key revoked successfully',
        })
    } catch (error) {
        console.error('Revoke API key error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to revoke API key' },
            { status: 500 }
        )
    }
}
