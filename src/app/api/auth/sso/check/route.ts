/**
 * SSO Domain Check API
 * POST /api/auth/sso/check - Check if email domain has SSO configured
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/sso'
import { prisma } from '@/lib/prisma'

// POST - Check if email has SSO
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const { email } = body

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({
                success: true,
                data: { hasSso: false },
            })
        }

        // Find SSO connection by email domain
        const connection = await ssoService.findConnectionByEmailDomain(email)

        if (!connection) {
            return NextResponse.json({
                success: true,
                data: { hasSso: false },
            })
        }

        // Get tenant info for SSO URL
        const tenant = await prisma.tenant.findUnique({
            where: { id: connection.tenantId },
            select: { slug: true, name: true },
        })

        if (!tenant) {
            return NextResponse.json({
                success: true,
                data: { hasSso: false },
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                hasSso: true,
                provider: connection.provider,
                providerName: connection.name,
                tenantSlug: tenant.slug,
                tenantName: tenant.name,
                ssoUrl: `/api/auth/sso/saml/${tenant.slug}`,
            },
        })
    } catch (error) {
        console.error('SSO check error:', error)
        return NextResponse.json({
            success: true,
            data: { hasSso: false },
        })
    }
}
