/**
 * Portal Entity CSV Import API
 * POST /api/portal/entities/import-csv
 * 
 * Adapted from admin CsvImportDialog for portal users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

interface CsvRow {
    name: string
    country: string
    legalForm?: string
    economicDepartment?: string
    licenseNumber?: string
}

interface ValidationError {
    rowNumber: number
    data: CsvRow
    error: string
}

// GET - Download template
export async function GET() {
    const template = `name,country,legalForm,economicDepartment,licenseNumber
"ABC Trading LLC","AE","LLC","DMCC",""
"XYZ Services","SA","Limited","MISA","SA-12345"
"Cairo Tech","EG","JSC","GAFI",""`

    return new NextResponse(template, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="entities-template.csv"',
        },
    })
}

// POST - Import CSV
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = (session.user as any).id
        const tenantId = (session.user as any).tenantId

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            )
        }

        // Read and parse CSV
        const content = await file.text()
        let rows: CsvRow[]

        try {
            rows = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            })
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid CSV format' },
                { status: 400 }
            )
        }

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'CSV file is empty' },
                { status: 400 }
            )
        }

        // Validate rows
        const errors: ValidationError[] = []
        const validRows: CsvRow[] = []

        rows.forEach((row, index) => {
            const rowNumber = index + 2 // +2 because row 1 is header

            // Required fields
            if (!row.name?.trim()) {
                errors.push({ rowNumber, data: row, error: 'Name is required' })
                return
            }

            if (!row.country?.trim() || !['AE', 'SA', 'EG'].includes(row.country.toUpperCase())) {
                errors.push({ rowNumber, data: row, error: 'Country must be AE, SA, or EG' })
                return
            }

            validRows.push({
                ...row,
                country: row.country.toUpperCase(),
            })
        })

        // If validation only (has errors), return validation results
        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                validation: {
                    totalRows: rows.length,
                    validRows: validRows.length,
                    invalidRows: errors.length,
                    errors: errors.slice(0, 10), // Limit errors shown
                    hasMoreErrors: errors.length > 10,
                },
            })
        }

        // Import valid rows
        const imported: string[] = []
        const failed: { name: string; error: string }[] = []

        for (const row of validRows) {
            try {
                // Check for duplicate name
                const existing = await prisma.entity.findFirst({
                    where: { tenantId, name: row.name },
                })

                if (existing) {
                    failed.push({ name: row.name, error: 'Entity with this name already exists' })
                    continue
                }

                // Create entity
                const entity = await prisma.entity.create({
                    data: {
                        tenantId,
                        name: row.name,
                        country: row.country,
                        legalForm: row.legalForm || null,
                        economicDepartment: row.economicDepartment || null,
                        status: 'PENDING_APPROVAL',
                        createdBy: userId,
                    },
                })

                // Create user relationship
                await prisma.userOnEntity.create({
                    data: {
                        userId,
                        entityId: entity.id,
                        role: 'OWNER',
                    },
                })

                // Create approval request
                await prisma.entityApproval.create({
                    data: {
                        entityId: entity.id,
                        status: 'PENDING',
                        requestedBy: userId,
                        metadata: { notes: 'Imported via CSV' },
                    },
                })

                // Create license if provided
                if (row.licenseNumber?.trim()) {
                    await prisma.entityLicense.create({
                        data: {
                            entityId: entity.id,
                            country: row.country,
                            authority: row.economicDepartment || 'Unknown',
                            licenseNumber: row.licenseNumber,
                            status: 'ACTIVE',
                        },
                    })
                }

                imported.push(entity.id)
            } catch (error) {
                failed.push({ name: row.name, error: 'Database error' })
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                totalRows: rows.length,
                imported: imported.length,
                failed: failed.length,
                failedDetails: failed,
                jobId: `import-${Date.now()}`,
            },
        })
    } catch (error) {
        console.error('CSV import error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to import CSV' },
            { status: 500 }
        )
    }
}
