/**
 * SAML SSO Initiate
 * GET /api/auth/sso/saml/[slug] - Redirect to IdP for authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/sso'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { slug: string } } | { params: Promise<{ slug: string }> } | any

async function resolveSlug(ctx: any): Promise<string | undefined> {
    try {
        const p = ctx?.params
        const v = p && typeof p.then === 'function' ? await p : p
        return v?.slug
    } catch { return undefined }
}

// GET - Initiate SAML SSO flow
export async function GET(request: NextRequest, context: Ctx) {
    try {
        const slug = await resolveSlug(context)
        if (!slug) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 })
        }

        // Find tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true, slug: true },
        })

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        // Get SSO connection
        const connection = await ssoService.getConnection(tenant.id, 'saml') as any

        if (!connection || !connection.enabled) {
            return NextResponse.json({ error: 'SSO not configured for this tenant' }, { status: 404 })
        }

        if (!connection.ssoUrl) {
            return NextResponse.json({ error: 'SSO URL not configured' }, { status: 400 })
        }

        // Generate SAML AuthnRequest
        const samlRequest = ssoService.generateSamlAuthnRequest(connection, tenant.slug)

        // Get return URL from query params
        const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/portal'

        // Store return URL in a cookie for the callback
        const response = NextResponse.redirect(
            `${connection.ssoUrl}?SAMLRequest=${encodeURIComponent(samlRequest)}&RelayState=${encodeURIComponent(returnUrl)}`
        )

        response.cookies.set('sso_return_url', returnUrl, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300, // 5 minutes
        })

        return response
    } catch (error) {
        console.error('SAML SSO initiate error:', error)
        return NextResponse.json({ error: 'SSO initiation failed' }, { status: 500 })
    }
}
