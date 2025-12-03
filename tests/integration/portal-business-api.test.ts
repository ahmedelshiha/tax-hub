import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Unmock prisma to use the real client
vi.unmock('@/lib/prisma')
vi.unmock('@prisma/client')
process.env.PRISMA_MOCK = 'false'

import { prisma } from '@/lib/prisma'
import { entityAccessService } from '@/services/entities/entity-access.service'

describe('Portal Business API Logic - Integration Test', () => {
    const TEST_TENANT_ID = 'test-tenant-portal-api'
    const USER_ID = 'test-user-portal'
    const OTHER_USER_ID = 'test-user-other'

    const ENTITY_1_ID = 'entity-1' // Assigned to USER_ID
    const ENTITY_2_ID = 'entity-2' // Assigned to USER_ID
    const ENTITY_3_ID = 'entity-3' // Not assigned
    const ENTITY_OTHER_TENANT_ID = 'entity-other-tenant'

    beforeEach(async () => {
        // Set tenant context
        if ((globalThis as any).__testTenantContext) {
            (globalThis as any).__testTenantContext.set({ tenantId: TEST_TENANT_ID, userId: USER_ID })
        }

        await cleanup()

        // Create Tenant
        await prisma.tenant.create({
            data: {
                id: TEST_TENANT_ID,
                name: 'Test Tenant Portal API',
                slug: 'test-tenant-portal-api',
            },
        })

        // Create Users
        await prisma.user.create({
            data: {
                id: USER_ID,
                email: 'user@portal.test',
                name: 'Portal User',
                role: 'CLIENT',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        await prisma.user.create({
            data: {
                id: OTHER_USER_ID,
                email: 'other@portal.test',
                name: 'Other User',
                role: 'CLIENT',
                tenant: { connect: { id: TEST_TENANT_ID } },
            },
        })

        // Create Entities
        // Entity 1: Assigned to USER_ID
        await prisma.entity.create({
            data: {
                id: ENTITY_1_ID,
                name: 'Entity 1',
                country: 'AE',
                status: 'ACTIVE',
                tenant: { connect: { id: TEST_TENANT_ID } },
                creator: { connect: { id: USER_ID } },
                userOnEntities: {
                    create: {
                        userId: USER_ID,
                        role: 'OWNER'
                    }
                }
            },
        })

        // Entity 2: Assigned to USER_ID
        await prisma.entity.create({
            data: {
                id: ENTITY_2_ID,
                name: 'Entity 2',
                country: 'US',
                status: 'PENDING_APPROVAL',
                tenant: { connect: { id: TEST_TENANT_ID } },
                creator: { connect: { id: USER_ID } },
                userOnEntities: {
                    create: {
                        userId: USER_ID,
                        role: 'ADMIN'
                    }
                }
            },
        })

        // Entity 3: Not assigned to USER_ID (assigned to OTHER_USER_ID)
        await prisma.entity.create({
            data: {
                id: ENTITY_3_ID,
                name: 'Entity 3',
                country: 'UK',
                status: 'ACTIVE',
                tenant: { connect: { id: TEST_TENANT_ID } },
                creator: { connect: { id: OTHER_USER_ID } },
                userOnEntities: {
                    create: {
                        userId: OTHER_USER_ID,
                        role: 'OWNER'
                    }
                }
            },
        })
    })

    afterEach(async () => {
        await cleanup()
    })

    async function cleanup() {
        try {
            await prisma.userOnEntity.deleteMany({ where: { entity: { tenantId: TEST_TENANT_ID } } }).catch(() => { })
            await prisma.entity.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.user.deleteMany({ where: { tenantId: TEST_TENANT_ID } }).catch(() => { })
            await prisma.tenant.delete({ where: { id: TEST_TENANT_ID } }).catch(() => { })
        } catch (error) {
            console.error('Cleanup failed:', error)
        }
    }

    it('should return only entities assigned to the user', async () => {
        const result = await entityAccessService.getUserEntities(USER_ID, TEST_TENANT_ID)

        expect(result).toHaveLength(2)
        const entityIds = result.map(r => r.entityId).sort()
        expect(entityIds).toEqual([ENTITY_1_ID, ENTITY_2_ID].sort())
    })

    it('should return empty list for user with no entities', async () => {
        // Create a new user with no entities
        const EMPTY_USER_ID = 'empty-user'
        await prisma.user.create({
            data: {
                id: EMPTY_USER_ID,
                email: 'empty@test.com',
                name: 'Empty User',
                role: 'CLIENT',
                tenant: { connect: { id: TEST_TENANT_ID } }
            }
        })

        const result = await entityAccessService.getUserEntities(EMPTY_USER_ID, TEST_TENANT_ID)
        expect(result).toHaveLength(0)
    })

    it('should include entity details in the result', async () => {
        const result = await entityAccessService.getUserEntities(USER_ID, TEST_TENANT_ID)
        const entity1 = result.find(r => r.entityId === ENTITY_1_ID)

        expect(entity1).toBeDefined()
        expect(entity1?.entity).toBeDefined()
        expect(entity1?.entity.name).toBe('Entity 1')
        expect(entity1?.entity.country).toBe('AE')
    })
})
