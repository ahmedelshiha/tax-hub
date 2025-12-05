/**
 * SAML SP Metadata
 * GET /api/auth/sso/saml/[slug]/metadata - Return SP Metadata XML
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

// GET - Return SP Metadata XML
export async function GET(request: NextRequest, context: Ctx) {
    try {
        const slug = await resolveSlug(context)
        if (!slug) {
            return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 })
        }

        // Verify tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            select: { id: true, slug: true },
        })

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        // Generate SP metadata XML
        const metadataXml = ssoService.generateSpMetadataXml(tenant.slug)

        return new NextResponse(metadataXml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Content-Disposition': `inline; filename="sp-metadata-${slug}.xml"`,
            },
        })
    } catch (error) {
        console.error('SP Metadata error:', error)
        return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
    }
}
