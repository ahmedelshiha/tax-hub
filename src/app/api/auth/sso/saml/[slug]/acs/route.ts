/**
 * SAML Assertion Consumer Service (ACS)
 * POST /api/auth/sso/saml/[slug]/acs - Handle SAML response from IdP
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/sso'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

type Ctx = { params: { slug: string } } | { params: Promise<{ slug: string }> } | any

async function resolveSlug(ctx: any): Promise<string | undefined> {
  try {
    const p = ctx?.params
    const v = p && typeof p.then === 'function' ? await p : p
    return v?.slug
  } catch { return undefined }
}

// POST - Handle SAML Response
export async function POST(request: NextRequest, context: Ctx) {
  try {
    const slug = await resolveSlug(context)
    if (!slug) {
      return NextResponse.redirect(new URL('/login?error=invalid_tenant', request.url))
    }

    // Find tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    })

    if (!tenant) {
      return NextResponse.redirect(new URL('/login?error=tenant_not_found', request.url))
    }

    // Get SSO connection
    const connection = await ssoService.getConnection(tenant.id, 'saml') as any

    if (!connection || !connection.enabled) {
      return NextResponse.redirect(new URL('/login?error=sso_not_enabled', request.url))
    }

    // Parse form data
    const formData = await request.formData()
    const samlResponse = formData.get('SAMLResponse') as string
    const relayState = formData.get('RelayState') as string

    if (!samlResponse) {
      return NextResponse.redirect(new URL('/login?error=missing_saml_response', request.url))
    }

    // Validate SAML assertion
    const result = await ssoService.validateSamlAssertion(connection, samlResponse)

    if (!result.success || !result.email) {
      console.error('SAML validation failed:', result.error)
      return NextResponse.redirect(new URL(`/login?error=saml_validation_failed`, request.url))
    }

    // Find or create user
    const email = result.email.toLowerCase()
    let user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    })

    if (!user) {
      // Create new user from SSO
      const name = [result.firstName, result.lastName].filter(Boolean).join(' ') || email.split('@')[0]
      
      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          password: await bcrypt.hash(crypto.randomUUID(), 12), // Random password (SSO only)
          role: 'CLIENT',
          emailVerified: new Date(), // SSO users are pre-verified
        },
      })

      // Create tenant membership
      await prisma.tenantMembership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: 'CLIENT',
          isDefault: true,
        },
      }).catch(() => {})
    }

    // Create SSO session token (simplified - in production use proper session handling)
    const ssoToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      ssoSession: true,
      exp: Date.now() + 3600000, // 1 hour
    })).toString('base64url')

    // Determine redirect URL
    const returnUrl = relayState || (await cookies()).get('sso_return_url')?.value || '/portal'
    const redirectUrl = new URL(returnUrl, request.url)
    redirectUrl.searchParams.set('sso_token', ssoToken)

    const response = NextResponse.redirect(redirectUrl)

    // Clear the return URL cookie
    response.cookies.delete('sso_return_url')

    return response
  } catch (error) {
    console.error('SAML ACS error:', error)
    return NextResponse.redirect(new URL('/login?error=sso_error', request.url))
  }
}
