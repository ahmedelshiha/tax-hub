'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { getDepartmentsByCountry, type EconomicDepartment } from '../constants/departments'
import type { SetupFormData } from '../types/setup'
import type { Country } from '../fields/CountryFlagSelector'
import { validationService } from '../services/validationService'

export interface ExistingEntityTabProps {
    country: Country['code']
    formData: Partial<SetupFormData>
    onFormDataChange: (data: Partial<SetupFormData>) => void
    onSubmit: (data: SetupFormData) => void | Promise<void>
}

/**
 * Tab for existing businesses
 * Users manually enter their license number and business details
 */
export function ExistingEntityTab({
    country,
    formData,
    onFormDataChange,
    onSubmit
}: ExistingEntityTabProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleSubmit = async () => {
        const validationErrors = validationService.validateForm({
            ...formData,
            businessType: 'existing',
            termsAccepted
        } as SetupFormData)

        if (validationErrors.length > 0) {
            const errorMap: Record<string, string> = {}
            validationErrors.forEach(err => {
                errorMap[err.field] = err.message
            })
            setErrors(errorMap)
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit({
                ...formData,
                businessType: 'existing',
                termsAccepted
            } as SetupFormData)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Get country-specific departments
    const departments = getDepartmentsByCountry(country as 'AE' | 'SA' | 'EG')

    const selectedDepartment = formData.economicDepartment
        ? departments.find(d => d.id === formData.economicDepartment) ?? null
        : null

    return (
        <div className="space-y-6">
            {/* License Number Input - Manual Entry */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trade License Number <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => {
                        onFormDataChange({ ...formData, licenseNumber: e.target.value })
                        if (errors.licenseNumber) {
                            setErrors({ ...errors, licenseNumber: '' })
                        }
                    }}
                    placeholder="Enter your trade license number"
                    className={`
                        w-full px-4 py-2.5
                        bg-gray-800 border rounded-lg
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${errors.licenseNumber ? 'border-red-500' : 'border-gray-700'}
                    `}
                />
                {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.licenseNumber}</p>
                )}
            </div>

            {/* Business Name */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => {
                        onFormDataChange({ ...formData, businessName: e.target.value })
                        if (errors.businessName) {
                            setErrors({ ...errors, businessName: '' })
                        }
                    }}
                    placeholder="Enter your business legal name"
                    className={`
                        w-full px-4 py-2.5
                        bg-gray-800 border rounded-lg
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${errors.businessName ? 'border-red-500' : 'border-gray-700'}
                    `}
                />
                {errors.businessName && (
                    <p className="mt-1 text-sm text-red-400">{errors.businessName}</p>
                )}
            </div>

            {/* Economic Department Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Economic Department / Free Zone <span className="text-red-400">*</span>
                </label>
                <SearchableSelect<EconomicDepartment>
                    items={departments}
                    value={selectedDepartment}
                    onChange={(dept) => {
                        onFormDataChange({ ...formData, economicDepartment: dept?.id })
                        if (errors.economicDepartment) {
                            setErrors({ ...errors, economicDepartment: '' })
                        }
                    }}
                    searchKeys={['name', 'shortName', 'keywords']}
                    renderItem={(dept) => (
                        <div>
                            <div className="font-medium text-gray-100">{dept.name}</div>
                            {dept.shortName && (
                                <div className="text-xs text-gray-400">{dept.shortName}</div>
                            )}
                        </div>
                    )}
                    placeholder="Search departments..."
                    className="w-full"
                />
                {errors.economicDepartment && (
                    <p className="mt-1 text-sm text-red-400">{errors.economicDepartment}</p>
                )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-4 border-t border-gray-800">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">
                        I confirm that the information provided is accurate and I accept the{' '}
                        <a href="/terms" target="_blank" className="text-blue-400 hover:underline">
                            Terms and Conditions
                        </a>
                    </span>
                </label>
                {errors.termsAccepted && (
                    <p className="mt-1 ml-7 text-sm text-red-400">{errors.termsAccepted}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !termsAccepted}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Setting up...
                        </>
                    ) : (
                        'Complete Setup'
                    )}
                </Button>
            </div>
        </div>
    )
}
