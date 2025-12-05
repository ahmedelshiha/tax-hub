/**
 * Business Setup API Client Service
 * 
 * Frontend service for interacting with business setup API endpoints.
 * Provides type-safe methods for license lookup and entity setup.
 */

import type {
    EntitySetupRequest,
    EntitySetupResponse,
    LicenseLookupResponse,
    Country
} from '@/lib/api/contracts/business-setup'

/**
 * API error with structured details
 */
export class APIError extends Error {
    public code: string
    public field?: string
    public status: number

    constructor(message: string, code: string, status: number = 400, field?: string) {
        super(message)
        this.name = 'APIError'
        this.code = code
        this.status = status
        this.field = field
    }
}

/**
 * Lookup business license information
 */
export async function lookupLicense(
    licenseNumber: string,
    country: Country
): Promise<LicenseLookupResponse> {
    const params = new URLSearchParams({
        licenseNumber,
        country,
    })

    const response = await fetch(`/api/portal/license/lookup?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new APIError(
            error.error?.message || 'Failed to lookup license',
            error.error?.code || 'LOOKUP_ERROR',
            response.status
        )
    }

    const data = await response.json()
    return data.data || data
}

/**
 * Setup a new business entity
 */
export async function setupEntity(
    request: EntitySetupRequest
): Promise<EntitySetupResponse> {
    const response = await fetch('/api/portal/entities/setup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new APIError(
            error.error?.message || 'Failed to setup entity',
            error.error?.code || 'SETUP_ERROR',
            response.status,
            error.error?.field
        )
    }

    const data = await response.json()
    return data.data || data
}

/**
 * Business Setup API client
 */
export const businessSetupApi = {
    lookupLicense,
    setupEntity,
}

export default businessSetupApi
