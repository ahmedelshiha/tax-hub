/**
 * License Expiry Cron Job
 * Runs daily to check for expiring licenses and send notifications
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/license-expiry",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { licenseExpiryService } from '@/lib/scheduled/license-expiry-checker'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
    try {
        // Verify authorization
        const authHeader = request.headers.get('authorization')
        if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get licenses at notification thresholds
        const notifications = await licenseExpiryService.getNotifiableLicenses()

        const results = {
            timestamp: new Date().toISOString(),
            processed: {
                thirtyDays: notifications.thirtyDays.length,
                fourteenDays: notifications.fourteenDays.length,
                sevenDays: notifications.sevenDays.length,
                oneDay: notifications.oneDay.length,
            },
            notifications: [] as string[],
        }

        // Send 30-day warnings
        for (const license of notifications.thirtyDays) {
            if (license.ownerEmail) {
                // In production, integrate with email service
                console.log(`[License Expiry] 30-day warning: ${license.entityName} (${license.licenseNumber}) -> ${license.ownerEmail}`)
                results.notifications.push(`30d: ${license.entityName}`)
            }
        }

        // Send 14-day warnings
        for (const license of notifications.fourteenDays) {
            if (license.ownerEmail) {
                console.log(`[License Expiry] 14-day warning: ${license.entityName} (${license.licenseNumber}) -> ${license.ownerEmail}`)
                results.notifications.push(`14d: ${license.entityName}`)
            }
        }

        // Send 7-day urgent warnings
        for (const license of notifications.sevenDays) {
            if (license.ownerEmail) {
                console.log(`[License Expiry] 7-day URGENT: ${license.entityName} (${license.licenseNumber}) -> ${license.ownerEmail}`)
                results.notifications.push(`7d: ${license.entityName}`)
            }
        }

        // Send 1-day critical warnings
        for (const license of notifications.oneDay) {
            if (license.ownerEmail) {
                console.log(`[License Expiry] 1-day CRITICAL: ${license.entityName} (${license.licenseNumber}) -> ${license.ownerEmail}`)
                results.notifications.push(`1d: ${license.entityName}`)
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
        })
    } catch (error) {
        console.error('[License Expiry Cron] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to process license expiry check' },
            { status: 500 }
        )
    }
}
