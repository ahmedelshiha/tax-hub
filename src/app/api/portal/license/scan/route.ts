/**
 * License Scan API
 * POST /api/portal/license/scan
 * 
 * Processes uploaded license image and extracts business data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { licenseOcrService, type LicenseOcrResult } from '@/lib/ocr/license-ocr-service'

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Please upload JPG, PNG, or PDF' },
                { status: 400 }
            )
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File too large. Maximum size is 10MB' },
                { status: 400 }
            )
        }

        // Process with OCR
        const result: LicenseOcrResult = await licenseOcrService.processLicenseImage(file)

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('License scan error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to process license' },
            { status: 500 }
        )
    }
}
