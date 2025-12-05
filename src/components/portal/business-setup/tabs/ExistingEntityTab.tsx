'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Search, CheckCircle2 } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { UAE_DEPARTMENTS, type EconomicDepartment } from '../constants/departments'
import type { SetupFormData } from '../types/setup'
import type { Country } from '../fields/CountryFlagSelector'
import { validationService } from '../services/validationService'
import { businessSetupApi, APIError } from '../services/businessSetupApi'

export interface ExistingEntityTabProps {
    country: Country['code']
    formData: Partial<SetupFormData>
    onFormDataChange: (data: Partial<SetupFormData>) => void
    onSubmit: (data: SetupFormData) => void | Promise<void>
}

/**
 * Tab for existing businesses with license lookup
 */
export function ExistingEntityTab({
    country,
    formData,
    onFormDataChange,
    onSubmit
}: ExistingEntityTabProps) {
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [lookupSuccess, setLookupSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleLicenseLookup = async () => {
        if (!formData.licenseNumber) {
            setErrors({ licenseNumber: 'Please enter a license number' })
            return
        }

        setIsLookingUp(true)
        setErrors({})

        try {
            // Call real API
            const result = await businessSetupApi.lookupLicense(
                formData.licenseNumber,
                country as 'AE' | 'SA' | 'EG'
            )

            if (result.found && result.data) {
                onFormDataChange({
                    ...formData,
                    businessName: result.data.businessName,
                    economicDepartment: result.data.economicDepartment,
                    activities: result.data.activities,
                })
                setLookupSuccess(true)
            } else {
                setErrors({
                    licenseNumber: result.error?.message || 'License not found or invalid'
                })
            }
        } catch (error) {
            if (error instanceof APIError) {
                setErrors({ licenseNumber: error.message })
            } else {
                setErrors({ licenseNumber: 'Failed to lookup license. Please try again.' })
            }
        } finally {
            setIsLookingUp(false)
        }
    }

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

    const selectedDepartment = formData.economicDepartment
        ? UAE_DEPARTMENTS.find(d => d.id === formData.economicDepartment) ?? null
        : null

    return (
        <div className="space-y-6">
            {/* License Number Input with Lookup */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={formData.licenseNumber || ''}
                        onChange={(e) => {
                            onFormDataChange({ ...formData, licenseNumber: e.target.value })
                            setLookupSuccess(false)
                        }}
                        placeholder="Enter your license number (e.g., DMCC-123456)"
                        className={`
              flex-1 px-4 py-2.5
              bg-gray-800 border rounded-lg
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.licenseNumber ? 'border-red-500' : 'border-gray-700'}
            `}
                    />
                    <Button
                        onClick={handleLicenseLookup}
                        disabled={isLookingUp || !formData.licenseNumber}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLookingUp ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : lookupSuccess ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                        <span className="ml-2">Lookup</span>
                    </Button>
                </div>
                {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-400">{errors.licenseNumber}</p>
                )}
                {lookupSuccess && (
                    <p className="mt-1 text-sm text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        License verified successfully
                    </p>
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
                    onChange={(e) => onFormDataChange({ ...formData, businessName: e.target.value })}
                    placeholder="Business legal name"
                    disabled={!lookupSuccess}
                    className={`
            w-full px-4 py-2.5
            bg-gray-800 border rounded-lg
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
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
                    items={UAE_DEPARTMENTS}
                    value={selectedDepartment}
                    onChange={(dept) => onFormDataChange({ ...formData, economicDepartment: dept?.id })}
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
                    disabled={!lookupSuccess}
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
                    disabled={isSubmitting || !lookupSuccess || !termsAccepted}
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
