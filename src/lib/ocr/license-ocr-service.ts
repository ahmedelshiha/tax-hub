/**
 * License OCR Service
 * Extracts business license data from uploaded images
 */

export interface LicenseOcrResult {
    businessName: string | null
    licenseNumber: string | null
    economicDepartment: string | null
    expiryDate: string | null
    legalForm: string | null
    country: string | null
    confidence: number
    rawText?: string
}

/**
 * Mock license data extractor
 * In production, replace with Tesseract.js or cloud OCR API
 */
export class LicenseOcrService {
    /**
     * Process a license image and extract data
     */
    async processLicenseImage(file: File): Promise<LicenseOcrResult> {
        console.log(`[LicenseOCR] Processing file: ${file.name}`)

        // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock extraction based on file name patterns
        const result = this.extractMockLicenseData(file.name)

        console.log('[LicenseOCR] Extraction complete:', result)
        return result
    }

    /**
     * Mock data extraction for demo purposes
     * Replace with actual OCR logic in production
     */
    private extractMockLicenseData(fileName: string): LicenseOcrResult {
        const lowerName = fileName.toLowerCase()

        // UAE patterns
        if (lowerName.includes('dmcc') || lowerName.includes('dubai')) {
            return {
                businessName: 'ABC Trading LLC',
                licenseNumber: `DMCC-${Math.floor(100000 + Math.random() * 900000)}`,
                economicDepartment: 'DMCC - Dubai Multi Commodities Centre',
                expiryDate: this.getFutureDate(365),
                legalForm: 'LLC',
                country: 'AE',
                confidence: 0.85,
            }
        }

        if (lowerName.includes('ded') || lowerName.includes('mainland')) {
            return {
                businessName: 'XYZ Services LLC',
                licenseNumber: `DED-${Math.floor(100000 + Math.random() * 900000)}`,
                economicDepartment: 'DED - Dubai Economy',
                expiryDate: this.getFutureDate(365),
                legalForm: 'LLC',
                country: 'AE',
                confidence: 0.82,
            }
        }

        // Saudi patterns
        if (lowerName.includes('saudi') || lowerName.includes('misa')) {
            return {
                businessName: 'Saudi Tech Company',
                licenseNumber: `SA-${Math.floor(1000000 + Math.random() * 9000000)}`,
                economicDepartment: 'MISA - Ministry of Investment',
                expiryDate: this.getFutureDate(365),
                legalForm: 'Limited',
                country: 'SA',
                confidence: 0.78,
            }
        }

        // Egypt patterns
        if (lowerName.includes('egypt') || lowerName.includes('gafi')) {
            return {
                businessName: 'Cairo Business Co.',
                licenseNumber: `EG-${Math.floor(100000 + Math.random() * 900000)}`,
                economicDepartment: 'GAFI - General Authority for Investment',
                expiryDate: this.getFutureDate(365),
                legalForm: 'JSC',
                country: 'EG',
                confidence: 0.75,
            }
        }

        // Generic/unknown license
        return {
            businessName: 'Unknown Business',
            licenseNumber: `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
            economicDepartment: null,
            expiryDate: null,
            legalForm: null,
            country: null,
            confidence: 0.5,
        }
    }

    private getFutureDate(daysFromNow: number): string {
        const date = new Date()
        date.setDate(date.getDate() + daysFromNow)
        return date.toISOString().split('T')[0]
    }
}

export const licenseOcrService = new LicenseOcrService()
