import { z } from 'zod'

/**
 * Business Setup API Contract Definitions
 * 
 * This file defines the Zod schemas for all business setup-related API endpoints.
 * These schemas are used for both request validation and TypeScript type generation.
 * 
 * @module business-setup/api-contracts
 * @version 1.0.0
 */

// =============================================================================
// SHARED TYPES & ENUMS
// =============================================================================

export const CountrySchema = z.enum(['AE', 'SA', 'EG'])
export type Country = z.infer<typeof CountrySchema>

export const BusinessTypeSchema = z.enum(['existing', 'new', 'individual'])
export type BusinessType = z.infer<typeof BusinessTypeSchema>

export const EntityStatusSchema = z.enum([
    'PENDING_VERIFICATION',
    'APPROVED',
    'REJECTED',
    'ADDITIONAL_INFO_REQUIRED'
])
export type EntityStatus = z.infer<typeof EntityStatusSchema>

// =============================================================================
// ENTITY SETUP API - POST /api/portal/entities/setup
// =============================================================================

/**
 * Request schema for creating a new business entity
 */
export const EntitySetupRequestSchema = z.object({
    // Basic Info
    country: CountrySchema,
    businessType: BusinessTypeSchema,

    // Existing Business Fields
    licenseNumber: z.string().min(1).max(50).optional(),

    // Business Details
    businessName: z.string().min(2).max(200),
    economicDepartment: z.string().min(1).max(100),

    // Optional Fields
    taxId: z.string().max(50).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),

    // Terms & Conditions
    termsAccepted: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions'
    }),

    // Metadata
    idempotencyKey: z.string().uuid().optional()
}).refine(
    (data) => {
        // If businessType is 'existing', licenseNumber is required
        if (data.businessType === 'existing' && !data.licenseNumber) {
            return false
        }
        return true
    },
    {
        message: 'License number is required for existing businesses',
        path: ['licenseNumber']
    }
)

export type EntitySetupRequest = z.infer<typeof EntitySetupRequestSchema>

/**
 * Response schema for entity setup endpoint
 */
export const EntitySetupResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        entityId: z.string().uuid(),
        setupJobId: z.string().uuid(),
        status: EntityStatusSchema,
        verificationEstimate: z.string(), // e.g., "~5 minutes"
        createdAt: z.string().datetime()
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        field: z.string().optional()
    }).optional()
})

export type EntitySetupResponse = z.infer<typeof EntitySetupResponseSchema>

// =============================================================================
// LICENSE LOOKUP API - POST /api/portal/license/lookup
// =============================================================================

/**
 * Request schema for license verification lookup
 */
export const LicenseLookupRequestSchema = z.object({
    licenseNumber: z.string().min(1).max(50),
    country: CountrySchema,
    department: z.string().optional() // Optional hint for faster lookup
})

export type LicenseLookupRequest = z.infer<typeof LicenseLookupRequestSchema>

/**
 * Response schema for license lookup
 */
export const LicenseLookupResponseSchema = z.object({
    found: z.boolean(),
    data: z.object({
        businessName: z.string(),
        licenseNumber: z.string(),
        expiryDate: z.string(), // ISO date string
        activities: z.array(z.string()),
        legalForm: z.string().optional(),
        economicDepartment: z.string(),
        status: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED'])
    }).optional(),
    error: z.object({
        code: z.string(),
        message: z.string()
    }).optional()
})

export type LicenseLookupResponse = z.infer<typeof LicenseLookupResponseSchema>

// =============================================================================
// NAME AVAILABILITY CHECK - POST /api/portal/entities/check-name
// =============================================================================

/**
 * Request schema for business name availability check
 */
export const NameAvailabilityRequestSchema = z.object({
    businessName: z.string().min(2).max(200),
    country: CountrySchema
})

export type NameAvailabilityRequest = z.infer<typeof NameAvailabilityRequestSchema>

/**
 * Response schema for name availability
 */
export const NameAvailabilityResponseSchema = z.object({
    available: z.boolean(),
    suggestions: z.array(z.string()).optional(),
    message: z.string().optional()
})

export type NameAvailabilityResponse = z.infer<typeof NameAvailabilityResponseSchema>

// =============================================================================
// ERROR RESPONSE SCHEMA (Standard across all endpoints)
// =============================================================================

/**
 * Standard error response for all API endpoints
 */
export const APIErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(), // e.g., 'VALIDATION_ERROR', 'LICENSE_NOT_FOUND'
        message: z.string(), // User-friendly error message
        field: z.string().optional(), // Field name if validation error
        details: z.record(z.any()).optional() // Additional error details
    }),
    timestamp: z.string().datetime()
})

export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>

// =============================================================================
// HTTP STATUS CODES MAPPING
// =============================================================================

export const API_STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500
} as const

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',

    // Business Logic Errors
    LICENSE_NOT_FOUND: 'LICENSE_NOT_FOUND',
    LICENSE_EXPIRED: 'LICENSE_EXPIRED',
    BUSINESS_NAME_TAKEN: 'BUSINESS_NAME_TAKEN',
    DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',

    // Authentication/Authorization
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // Rate Limiting
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates and parses entity setup request
 * @throws ZodError if validation fails
 */
export const validateEntitySetupRequest = (data: unknown) => {
    return EntitySetupRequestSchema.parse(data)
}

/**
 * Validates and parses license lookup request
 * @throws ZodError if validation fails
 */
export const validateLicenseLookupRequest = (data: unknown) => {
    return LicenseLookupRequestSchema.parse(data)
}

/**
 * Safely validates data and returns result with errors
 */
export const safeValidateEntitySetup = (data: unknown) => {
    return EntitySetupRequestSchema.safeParse(data)
}
