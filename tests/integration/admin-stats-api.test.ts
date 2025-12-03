import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Unmock prisma to use the real client
vi.unmock('@/lib/prisma')
vi.unmock('@prisma/client')
process.env.PRISMA_MOCK = 'false'

import { prisma } from '@/lib/prisma'
import { entityApprovalService } from '@/services/entities/entity-approval.service'
import { EntityApprovalStatus } from '@prisma/client'

// Mock notification manager
vi.mock('@/lib/notifications/triggers', () => ({
    notificationManager: {
        notifyAdminsOfEntitySubmission: vi.fn(),
        notifyClientOfApproval: vi.fn(),
        notifyClientOfRejection: vi.fn(),
    },
}))

describe('Admin Stats API Logic - Integration Test', () => {
    const TEST_TENANT_ID = 'test-tenant-admin-stats'
    const ADMIN_USER_ID = 'test-admin-stats'
    const CLIENT_USER_ID = 'test-client-stats'

    beforeEach(async () => {
        // Set tenant context
        if ((globalThis as any).__testTenantContext) {
            (globalThis as any).__testTenantContext.set({ tenantId: TEST_TENANT_ID, userId: ADMIN_USER_ID, isSuperAdmin: true })
        }

        await cleanup()

        // Create Tenant
        await prisma.tenant.create({
            data: {
                id: TEST_TENANT_ID,
                name: 'Test Tenant Admin Stats',
                slug: 'test-tenant-admin-stats',
            },
        })

        // Create Admin User
        await prisma.user.create({
            data: {
                id: ADMIN_USER_ID,
                email: 'admin@stats.test',
                name: 'Admin Stats',
                role: 'ADMIN',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        // Create Client User
        await prisma.user.create({
            data: {
                id: CLIENT_USER_ID,
                email: 'client@stats.test',
                name: 'Client Stats',
                role: 'CLIENT',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        // Helper to create entity with approval status
        const createEntityWithStatus = async (id: string, status: EntityApprovalStatus) => {
            const entity = await prisma.entity.create({
                data: {
                    id,
                    name: `Entity ${id}`,
                    country: 'AE',
                    status: status === 'APPROVED' ? 'ACTIVE' : (status === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL'),
                    tenant: { connect: { id: TEST_TENANT_ID } },
                    creator: { connect: { id: CLIENT_USER_ID } },
                }
            })

            await prisma.entityApproval.create({
                data: {
                    entity: { connect: { id: entity.id } },
                    requester: { connect: { id: CLIENT_USER_ID } },
                    status: status,
                    submittedAt: new Date(),
                    // Add reviewer if not pending
                    reviewer: status !== 'PENDING' ? { connect: { id: ADMIN_USER_ID } } : undefined,
                    reviewedAt: status !== 'PENDING' ? new Date() : undefined,
                }
            })
        }

        // Create Entities with different statuses
        await createEntityWithStatus('entity-pending-1', EntityApprovalStatus.PENDING)
        await createEntityWithStatus('entity-pending-2', EntityApprovalStatus.PENDING)
        await createEntityWithStatus('entity-approved-1', EntityApprovalStatus.APPROVED)
        await createEntityWithStatus('entity-rejected-1', EntityApprovalStatus.REJECTED)
        await createEntityWithStatus('entity-changes-1', EntityApprovalStatus.REQUIRES_CHANGES)
    })

    afterEach(async () => {
        await cleanup()
    })

    async function cleanup() {
        try {
            await prisma.entityApproval.deleteMany({ where: { entity: { tenantId: TEST_TENANT_ID } } }).catch(() => { })
            await prisma.entity.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.user.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.tenant.delete({ where: { id: TEST_TENANT_ID } }).catch(() => { })
        } catch (error) {
            console.error('Cleanup failed:', error)
        }
    }

    it('should return correct approval statistics', async () => {
        const stats = await entityApprovalService.getApprovalStats(TEST_TENANT_ID)

        expect(stats).toBeDefined()
        expect(stats.pending).toBe(2)
        expect(stats.approved).toBe(1)
        expect(stats.rejected).toBe(1)
        expect(stats.requiresChanges).toBe(1)
        expect(stats.total).toBe(5)
    })

    it('should return zeros for empty tenant', async () => {
        const OTHER_TENANT_ID = 'other-tenant-stats'

        // Create another tenant
        await prisma.tenant.create({
            data: {
                id: OTHER_TENANT_ID,
                name: 'Other Tenant Stats',
                slug: 'other-tenant-stats',
            }
        })

        const stats = await entityApprovalService.getApprovalStats(OTHER_TENANT_ID)

        expect(stats.pending).toBe(0)
        expect(stats.approved).toBe(0)
        expect(stats.rejected).toBe(0)
        expect(stats.total).toBe(0)

        // Cleanup other tenant
        await prisma.tenant.delete({ where: { id: OTHER_TENANT_ID } }).catch(() => { })
    })
})
