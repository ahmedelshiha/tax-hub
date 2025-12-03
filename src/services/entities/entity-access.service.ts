
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export class EntityAccessService {
    /**
     * Get all entities a user has access to within a tenant
     */
    async getUserEntities(userId: string, tenantId: string) {
        return await prisma.userOnEntity.findMany({
            where: {
                userId,
                entity: {
                    tenantId
                }
            },
            include: {
                entity: {
                    include: {
                        licenses: true,
                        registrations: true,
                        approval: true
                    }
                }
            }
        });
    }

    /**
     * Check if a user has access to a specific entity
     */
    async checkEntityAccess(userId: string, entityId: string, tenantId: string): Promise<boolean> {
        const access = await prisma.userOnEntity.findFirst({
            where: {
                userId,
                entityId,
                entity: {
                    tenantId
                }
            }
        });

        return !!access;
    }

    /**
     * Grant a user access to an entity
     */
    async grantEntityAccess(
        userId: string,
        entityId: string,
        role: string = 'OWNER',
        performedBy?: string
    ) {
        // Check if access already exists
        const existing = await prisma.userOnEntity.findUnique({
            where: {
                userId_entityId: {
                    userId,
                    entityId
                }
            }
        });

        if (existing) {
            // Update role if changed
            if (existing.role !== role) {
                return await prisma.userOnEntity.update({
                    where: { id: existing.id },
                    data: { role }
                });
            }
            return existing;
        }

        // Create new access
        const access = await prisma.userOnEntity.create({
            data: {
                userId,
                entityId,
                role
            }
        });

        // Log audit event if performedBy is provided
        if (performedBy) {
            await prisma.entityAuditLog.create({
                data: {
                    entityId,
                    userId: performedBy,
                    action: 'ACCESS_GRANTED',
                    changes: {
                        grantedTo: userId,
                        role
                    }
                }
            });
        }

        return access;
    }

    /**
     * Revoke user access to an entity
     */
    async revokeEntityAccess(userId: string, entityId: string, performedBy?: string) {
        const access = await prisma.userOnEntity.delete({
            where: {
                userId_entityId: {
                    userId,
                    entityId
                }
            }
        });

        // Log audit event
        if (performedBy) {
            await prisma.entityAuditLog.create({
                data: {
                    entityId,
                    userId: performedBy,
                    action: 'ACCESS_REVOKED',
                    changes: {
                        revokedFrom: userId
                    }
                }
            });
        }

        return access;
    }
}

export const entityAccessService = new EntityAccessService();
