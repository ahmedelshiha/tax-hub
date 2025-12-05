/**
 * Entity Clone API
 * Clone an existing entity with a new name
 * POST /api/portal/entities/[id]/clone
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> } | any

async function resolveId(ctx: any): Promise<string | undefined> {
    try {
        const p = ctx?.params
        const v = p && typeof p.then === 'function' ? await p : p
        return v?.id
    } catch { return undefined }
}

export async function POST(request: NextRequest, context: Ctx) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const id = await resolveId(context)
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invalid entity ID' },
                { status: 400 }
            )
        }

        const userId = (session.user as any).id
        const tenantId = (session.user as any).tenantId

        // Get the original entity
        const original = await prisma.entity.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                licenses: true,
                registrations: true,
            },
        })

        if (!original) {
            return NextResponse.json(
                { success: false, error: 'Entity not found' },
                { status: 404 }
            )
        }

        // Parse request body for new name
        const body = await request.json().catch(() => ({}))
        const newName = body?.name?.trim() || `${original.name} (copy)`

        // Check if name already exists
        const existing = await prisma.entity.findFirst({
            where: {
                tenantId,
                name: newName,
            },
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'An entity with this name already exists' },
                { status: 409 }
            )
        }

        // Create cloned entity
        const cloned = await prisma.entity.create({
            data: {
                tenantId,
                country: original.country,
                name: newName,
                legalForm: original.legalForm,
                status: 'PENDING_APPROVAL',
                economicDepartment: original.economicDepartment,
                economicDepartmentId: original.economicDepartmentId,
                parentEntityId: original.parentEntityId,
                activityCode: original.activityCode,
                metadata: original.metadata as any,
                createdBy: userId,
            },
        })

        // Create user-entity relationship
        await prisma.userOnEntity.create({
            data: {
                userId,
                entityId: cloned.id,
                role: 'OWNER',
            },
        })

        // Create approval request for cloned entity
        await prisma.entityApproval.create({
            data: {
                entityId: cloned.id,
                status: 'PENDING',
                requestedBy: userId,
                metadata: { notes: `Cloned from entity: ${original.name}` },
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                entity: {
                    id: cloned.id,
                    name: cloned.name,
                    status: cloned.status,
                    country: cloned.country,
                },
                clonedFrom: {
                    id: original.id,
                    name: original.name,
                },
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Entity clone error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to clone entity' },
            { status: 500 }
        )
    }
}
