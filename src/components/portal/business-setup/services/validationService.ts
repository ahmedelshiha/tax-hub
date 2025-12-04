import { SetupFormData, ValidationResult } from '../types/setup'

export const validationService = {
    /**
     * Validate a specific step (for multi-step wizard - Option B/C)
     * @deprecated Use validateForm() for single-step modal (Option A)
     */
    validateStep(step: number, data: SetupFormData): ValidationResult[] {
        const errors: ValidationResult[] = []

        switch (step) {
            case 1: // Country
                if (!data.country) {
                    errors.push({ field: 'country', message: 'Please select a country' })
                }
                break

            case 2: // Business Type
                if (!data.businessType) {
                    errors.push({ field: 'businessType', message: 'Please select a business type' })
                }
                break

            case 3: // License
                if (data.businessType === 'existing') {
                    if (!data.licenseNumber) {
                        errors.push({ field: 'licenseNumber', message: 'License number is required' })
                    }
                    if (!data.businessName) {
                        errors.push({ field: 'businessName', message: 'Business name is required' })
                    }
                } else if (data.businessType === 'new' || data.businessType === 'individual') {
                    if (!data.businessName) {
                        errors.push({ field: 'businessName', message: 'Business name is required' })
                    }
                }
                break

            case 4: // Details
                // Economic Department validation
                if (!data.economicDepartment) {
                    errors.push({ field: 'economicDepartment', message: 'Please select an economic department' })
                }

                // Optional fields format validation
                if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    errors.push({ field: 'email', message: 'Invalid email format' })
                }
                break

            case 6: // Review
                if (!data.termsAccepted) {
                    errors.push({ field: 'termsAccepted', message: 'You must accept the terms and conditions' })
                }
                break
        }

        return errors
    },

    /**
     * Validate all steps (for multi-step wizard)
     * @deprecated Use validateForm() for single-step modal (Option A)
     */
    validateAll(data: SetupFormData): ValidationResult[] {
        let errors: ValidationResult[] = []
        for (let i = 1; i <= 6; i++) {
            errors = [...errors, ...this.validateStep(i, data)]
        }
        return errors
    },

    /**
     * Validate form for single-step modal (Option A)
     * Use this for simplified business setup
     */
    validateForm(data: SetupFormData): ValidationResult[] {
        const errors: ValidationResult[] = []

        // Country is required
        if (!data.country) {
            errors.push({ field: 'country', message: 'Please select a country' })
        }

        // Business type is required
        if (!data.businessType) {
            errors.push({ field: 'businessType', message: 'Please select a business type' })
        }

        // License number required for existing businesses
        if (data.businessType === 'existing' && !data.licenseNumber) {
            errors.push({ field: 'licenseNumber', message: 'License number is required for existing businesses' })
        }

        // Business name is always required
        if (!data.businessName || data.businessName.trim().length === 0) {
            errors.push({ field: 'businessName', message: 'Business name is required' })
        }

        // Economic department is required
        if (!data.economicDepartment) {
            errors.push({ field: 'economicDepartment', message: 'Please select an economic department or free zone' })
        }

        // Email format validation (if provided)
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push({ field: 'email', message: 'Invalid email format' })
        }

        // Terms must be accepted
        if (!data.termsAccepted) {
            errors.push({ field: 'termsAccepted', message: 'You must accept the terms and conditions to continue' })
        }

        return errors
    }
}
