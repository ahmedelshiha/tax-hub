import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Unmock prisma to use the real client
vi.unmock('@/lib/prisma')
vi.unmock('@prisma/client')
process.env.PRISMA_MOCK = 'false'

import { prisma } from '@/lib/prisma'
import { entityApprovalService } from '@/services/entities/entity-approval.service'
import { EntityApprovalStatus } from '@prisma/client'

// Mock notification manager to avoid side effects
vi.mock('@/lib/notifications/triggers', () => ({
    notificationManager: {
        notifyAdminsOfEntitySubmission: vi.fn(),
        notifyClientOfApproval: vi.fn(),
        notifyClientOfRejection: vi.fn(),
    },
}))

describe('Entity Approval Flow - Integration Test', () => {
    const TEST_TENANT_ID = 'test-tenant-approval-flow'
    const ADMIN_USER_ID = 'test-admin-user'
    const CLIENT_USER_ID = 'test-client-user'
    const ENTITY_ID = 'test-entity-id'

    // Setup: Create Tenant and Users
    beforeEach(async () => {
        // Set tenant context for the test (mocking the context that prisma-tenant-guard uses)
        if ((globalThis as any).__testTenantContext) {
            (globalThis as any).__testTenantContext.set({ tenantId: TEST_TENANT_ID, userId: ADMIN_USER_ID, isSuperAdmin: true })
        }

        // Clean up if exists
        await cleanup()

        // Create Tenant
        await prisma.tenant.create({
            data: {
                id: TEST_TENANT_ID,
                name: 'Test Tenant Approval Flow',
                slug: 'test-tenant-approval-flow',
            },
        })

        // Create Admin User
        await prisma.user.create({
            data: {
                id: ADMIN_USER_ID,
                email: 'admin@test.com',
                name: 'Admin User',
                role: 'ADMIN',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        // Create Client User
        await prisma.user.create({
            data: {
                id: CLIENT_USER_ID,
                email: 'client@test.com',
                name: 'Client User',
                role: 'CLIENT',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        // Create Entity (Draft)
        await prisma.entity.create({
            data: {
                id: ENTITY_ID,
                name: 'Test Entity',
                country: 'AE',
                legalForm: 'LLC',
                status: 'DRAFT',
                tenant: { connect: { id: TEST_TENANT_ID } },
                creator: { connect: { id: CLIENT_USER_ID } },
            },
        })
    })

    // Teardown: Delete Tenant
    afterEach(async () => {
        await cleanup()
    })

    async function cleanup() {
        try {
            // Explicitly delete related records first to avoid cascade issues or foreign key constraints
            await prisma.entityApproval.deleteMany({ where: { entity: { tenantId: TEST_TENANT_ID } } }).catch(() => { })
            await prisma.entity.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.user.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.tenant.delete({
                where: { id: TEST_TENANT_ID },
            }).catch(() => { }) // Ignore if not found
        } catch (error) {
            console.error('Cleanup failed:', error)
        }
    }

    it('should complete the full approval lifecycle', async () => {
        // 1. Submit for Approval
        const submission = await entityApprovalService.submitForApproval(
            ENTITY_ID,
            CLIENT_USER_ID,
            TEST_TENANT_ID
        )

        expect(submission).toBeDefined()
        expect(submission.status).toBe(EntityApprovalStatus.PENDING)
        expect(submission.requestedBy).toBe(CLIENT_USER_ID)

        // Verify Entity Status
        const pendingEntity = await prisma.entity.findUnique({
            where: { id: ENTITY_ID },
        })
        expect(pendingEntity?.status).toBe('PENDING_APPROVAL')

        // 2. Admin Views Pending Approvals
        const pendingList = await entityApprovalService.getPendingApprovals(TEST_TENANT_ID)
        expect(pendingList.total).toBeGreaterThan(0)
        const found = pendingList.approvals.find(a => a.entityId === ENTITY_ID)
        expect(found).toBeDefined()

        // 3. Admin Approves Entity
        const approval = await entityApprovalService.approveEntity(
            ENTITY_ID,
            ADMIN_USER_ID,
            TEST_TENANT_ID,
            { note: 'Looks good' }
        )

        expect(approval.status).toBe(EntityApprovalStatus.APPROVED)
        expect(approval.reviewedBy).toBe(ADMIN_USER_ID)

        // Verify Entity Status
        const activeEntity = await prisma.entity.findUnique({
            where: { id: ENTITY_ID },
        })
        expect(activeEntity?.status).toBe('ACTIVE')
    })

    it('should handle rejection flow', async () => {
        // 1. Submit for Approval
        await entityApprovalService.submitForApproval(
            ENTITY_ID,
            CLIENT_USER_ID,
            TEST_TENANT_ID
        )

        // 2. Admin Rejects Entity
        const rejection = await entityApprovalService.rejectEntity(
            ENTITY_ID,
            ADMIN_USER_ID,
            'Missing documents',
            TEST_TENANT_ID
        )

        expect(rejection.status).toBe(EntityApprovalStatus.REJECTED)
        expect(rejection.rejectionReason).toBe('Missing documents')

        // Verify Entity Status
        const rejectedEntity = await prisma.entity.findUnique({
            where: { id: ENTITY_ID },
        })
        expect(rejectedEntity?.status).toBe('REJECTED')
    })
})
