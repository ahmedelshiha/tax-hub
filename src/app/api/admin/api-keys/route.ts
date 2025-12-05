/**
 * Admin API Keys Management API
 * GET /api/admin/api-keys - List all keys
 * POST /api/admin/api-keys - Create new key
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { apiKeyService, API_SCOPES, type ApiScope } from '@/lib/api-keys'

// GET - List API keys
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

        // Only admins can manage API keys
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

        const keys = await apiKeyService.listKeys(tenantId) as any[]

        // Don't expose the hash, return masked keys
        const safeKeys = keys.map((key: any) => ({
            id: key.id,
            name: key.name,
            keyPrefix: key.keyPrefix,
            scopes: key.scopes,
            isActive: key.isActive,
            expiresAt: key.expiresAt,
            lastUsedAt: key.lastUsedAt,
            lastUsedIp: key.lastUsedIp,
            createdAt: key.createdAt,
            revokedAt: key.revokedAt,
            user: key.user,
        }))

        return NextResponse.json({
            success: true,
            data: {
                keys: safeKeys,
                availableScopes: API_SCOPES,
            },
        })
    } catch (error) {
        console.error('List API keys error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to list API keys' },
            { status: 500 }
        )
    }
}

// POST - Create new API key
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
        const { name, scopes, expiresInDays } = body

        // Validate name
        if (!name || typeof name !== 'string' || name.length < 3) {
            return NextResponse.json(
                { success: false, error: 'Name must be at least 3 characters' },
                { status: 400 }
            )
        }

        // Validate scopes
        if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one scope is required' },
                { status: 400 }
            )
        }

        const validScopes = Object.keys(API_SCOPES)
        const invalidScopes = scopes.filter((s: string) => !validScopes.includes(s))
        if (invalidScopes.length > 0) {
            return NextResponse.json(
                { success: false, error: `Invalid scopes: ${invalidScopes.join(', ')}` },
                { status: 400 }
            )
        }

        // Create the API key
        const { apiKey, plainKey } = await apiKeyService.createKey({
            tenantId,
            userId: user.id,
            name,
            scopes: scopes as ApiScope[],
            expiresInDays: expiresInDays || 90, // Default 90 days
        })

        return NextResponse.json({
            success: true,
            data: {
                id: apiKey.id,
                name: apiKey.name,
                key: plainKey, // Only returned once!
                keyPrefix: apiKey.keyPrefix,
                scopes: apiKey.scopes,
                expiresAt: apiKey.expiresAt,
                createdAt: apiKey.createdAt,
                warning: 'This key will only be shown once. Store it securely.',
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Create API key error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create API key' },
            { status: 500 }
        )
    }
}
