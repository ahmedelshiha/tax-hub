'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { UAE_DEPARTMENTS, type EconomicDepartment } from '../constants/departments'
import type { SetupFormData } from '../types/setup'
import type { Country } from '../fields/CountryFlagSelector'
import { validationService } from '../services/validationService'
import { businessSetupApi, APIError } from '../services/businessSetupApi'

export interface NewEntityTabProps {
    country: Country['code']
    formData: Partial<SetupFormData>
    onFormDataChange: (data: Partial<SetupFormData>) => void
    onSubmit: (data: SetupFormData) => void | Promise<void>
}

/**
 * Tab for new businesses without existing license
 */
export function NewEntityTab({
    country,
    formData,
    onFormDataChange,
    onSubmit
}: NewEntityTabProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const handleSubmit = async () => {
        setSubmitError(null)

        const validationErrors = validationService.validateForm({
            ...formData,
            businessType: 'new',
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
            // Call the real API
            await businessSetupApi.setupEntity({
                country: country as 'AE' | 'SA' | 'EG',
                businessType: 'new',
                businessName: formData.businessName!,
                economicDepartment: formData.economicDepartment!,
                termsAccepted: true,
            })

            // Call the parent onSubmit for any additional handling (e.g., closing modal)
            await onSubmit({
                ...formData,
                businessType: 'new',
                termsAccepted
            } as SetupFormData)
        } catch (error) {
            if (error instanceof APIError) {
                if (error.field) {
                    setErrors({ [error.field]: error.message })
                } else {
                    setSubmitError(error.message)
                }
            } else {
                setSubmitError('Failed to complete setup. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedDepartment = formData.economicDepartment
        ? UAE_DEPARTMENTS.find(d => d.id === formData.economicDepartment) ?? null
        : null

    return (
        <div className="space-y-6">
            {/* Submit Error */}
            {submitError && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-400">{submitError}</p>
                </div>
            )}

            {/* Proposed Business Name */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proposed Business Name <span className="text-red-400">*</span>
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
                    placeholder="Enter your proposed business name"
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
                <p className="mt-1.5 text-xs text-gray-400">
                    Your proposed name will be checked for availability during the approval process
                </p>
            </div>

            {/* Economic Department Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Economic Department / Free Zone <span className="text-red-400">*</span>
                </label>
                <SearchableSelect<EconomicDepartment>
                    items={UAE_DEPARTMENTS}
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
                <p className="mt-1.5 text-xs text-gray-400">
                    Select where you plan to register your business
                </p>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-4 border-t border-gray-800">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                            setTermsAccepted(e.target.checked)
                            if (errors.termsAccepted) {
                                setErrors({ ...errors, termsAccepted: '' })
                            }
                        }}
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

            {/* Info Note */}
            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <p className="text-sm text-blue-200">
                    <strong className="font-medium">Next steps:</strong> Your application will be reviewed by
                    our team. You&apos;ll receive a verification email within 24-48 hours with further instructions
                    for document submission and license registration.
                </p>
            </div>
        </div>
    )
}
