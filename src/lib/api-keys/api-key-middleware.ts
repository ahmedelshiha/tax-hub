/**
 * API Key Authentication Middleware
 * Authenticates API requests using X-API-KEY header
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService, type ApiScope, type ApiKeyWithUser, type ApiKeyRecord } from './api-key.service'
import { prisma } from '@/lib/prisma'

const API_KEY_HEADER = 'x-api-key'

export interface ApiKeyContext {
    apiKey: ApiKeyWithUser
    userId: string
    tenantId: string
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
    return request.headers.get(API_KEY_HEADER)
}

/**
 * Authenticate request using API key
 * Returns the validated API key context or null if invalid
 */
export async function authenticateApiKey(
    request: NextRequest
): Promise<ApiKeyContext | null> {
    const key = extractApiKey(request)

    if (!key) {
        return null
    }

    const apiKey = await apiKeyService.validateKey(key)

    if (!apiKey) {
        return null
    }

    return {
        apiKey,
        userId: apiKey.userId,
        tenantId: apiKey.tenantId,
    }
}

/**
 * Check if the authenticated key has required scope
 */
export function requireScope(
    context: ApiKeyContext,
    scope: ApiScope
): boolean {
    return apiKeyService.hasScope(context.apiKey as ApiKeyRecord, scope)
}

/**
 * Middleware wrapper for API key protected routes
 */
export function withApiKeyAuth(
    handler: (
        request: NextRequest,
        context: ApiKeyContext
    ) => Promise<NextResponse>,
    requiredScope?: ApiScope
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const keyContext = await authenticateApiKey(request)

        if (!keyContext) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid or missing API key',
                    code: 'UNAUTHORIZED',
                },
                { status: 401 }
            )
        }

        // Check scope if required
        if (requiredScope && !requireScope(keyContext, requiredScope)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Insufficient permissions. Required scope: ${requiredScope}`,
                    code: 'FORBIDDEN',
                },
                { status: 403 }
            )
        }

        // Update last used IP
        try {
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown'
            await (prisma as any).apiKey.update({
                where: { id: keyContext.apiKey.id },
                data: { lastUsedIp: ip.substring(0, 45) },
            }).catch(() => { })
        } catch { }

        return handler(request, keyContext)
    }
}

/**
 * Combined auth: Try API key first, fall back to session
 * Useful for endpoints that support both auth methods
 */
export async function authenticateRequest(
    request: NextRequest
): Promise<{ type: 'apiKey' | 'session'; context: any } | null> {
    // Try API key first
    const apiKeyContext = await authenticateApiKey(request)
    if (apiKeyContext) {
        return { type: 'apiKey', context: apiKeyContext }
    }

    // Fall back to session auth
    const { getSessionOrBypass } = await import('@/lib/auth')
    const session = await getSessionOrBypass()
    if (session?.user) {
        return {
            type: 'session',
            context: {
                userId: (session.user as any).id,
                tenantId: (session.user as any).tenantId,
                user: session.user,
            },
        }
    }

    return null
}
