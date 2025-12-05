/**
 * License Expiry Checker Service
 * Checks for expiring licenses and sends notifications
 */

import { prisma } from '@/lib/prisma'

export interface ExpiringLicense {
    entityId: string
    entityName: string
    licenseNumber: string
    expiresAt: Date
    daysUntilExpiry: number
    ownerEmail?: string
    ownerName?: string
}

export class LicenseExpiryService {
    /**
     * Get all licenses expiring within the specified number of days
     */
    async getExpiringLicenses(daysThreshold: number): Promise<ExpiringLicense[]> {
        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

        const licenses = await prisma.entityLicense.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: {
                    lte: thresholdDate,
                    gte: new Date(), // Not already expired
                },
            },
            include: {
                entity: {
                    include: {
                        userOnEntities: {
                            where: { role: 'OWNER' },
                            include: {
                                user: {
                                    select: {
                                        email: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        return licenses.map((license) => {
            const daysUntilExpiry = Math.ceil(
                (license.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            const owner = license.entity.userOnEntities[0]?.user

            return {
                entityId: license.entityId,
                entityName: license.entity.name,
                licenseNumber: license.licenseNumber,
                expiresAt: license.expiresAt!,
                daysUntilExpiry,
                ownerEmail: owner?.email || undefined,
                ownerName: owner?.name || undefined,
            }
        })
    }

    /**
     * Get licenses expiring at specific thresholds (30, 14, 7, 1 days)
     */
    async getNotifiableLicenses(): Promise<{
        thirtyDays: ExpiringLicense[]
        fourteenDays: ExpiringLicense[]
        sevenDays: ExpiringLicense[]
        oneDay: ExpiringLicense[]
    }> {
        const all = await this.getExpiringLicenses(30)

        return {
            thirtyDays: all.filter((l) => l.daysUntilExpiry === 30),
            fourteenDays: all.filter((l) => l.daysUntilExpiry === 14),
            sevenDays: all.filter((l) => l.daysUntilExpiry === 7),
            oneDay: all.filter((l) => l.daysUntilExpiry === 1),
        }
    }

    /**
     * Get summary of expiring licenses for dashboard
     */
    async getExpirySummary(tenantId: string): Promise<{
        expiringIn30Days: number
        expiringIn7Days: number
        expired: number
    }> {
        const today = new Date()
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(today.getDate() + 7)

        const [expiringIn30Days, expiringIn7Days, expired] = await Promise.all([
            prisma.entityLicense.count({
                where: {
                    entity: { tenantId },
                    status: 'ACTIVE',
                    expiresAt: {
                        gte: today,
                        lte: thirtyDaysFromNow,
                    },
                },
            }),
            prisma.entityLicense.count({
                where: {
                    entity: { tenantId },
                    status: 'ACTIVE',
                    expiresAt: {
                        gte: today,
                        lte: sevenDaysFromNow,
                    },
                },
            }),
            prisma.entityLicense.count({
                where: {
                    entity: { tenantId },
                    status: 'ACTIVE',
                    expiresAt: {
                        lt: today,
                    },
                },
            }),
        ])

        return {
            expiringIn30Days,
            expiringIn7Days,
            expired,
        }
    }
}

export const licenseExpiryService = new LicenseExpiryService()
