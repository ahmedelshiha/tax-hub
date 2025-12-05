/**
 * Feature Flags for Business Setup
 * 
 * Controls gradual rollout and quick rollback capabilities.
 * Environment variable based for instant toggle without redeployment.
 */

/**
 * Check if the new simplified business setup is enabled
 * Set NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP=true to enable
 */
export function isNewBusinessSetupEnabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP === 'true'
}

/**
 * Check if the new business setup should be shown to this specific user
 * Can be used for gradual rollout (e.g., 10% of users)
 */
export function isNewBusinessSetupEnabledForUser(userId: string): boolean {
    // If globally disabled, return false
    if (!isNewBusinessSetupEnabled()) {
        return false
    }

    // Check for percentage-based rollout
    const rolloutPercentage = parseInt(
        process.env.NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT || '100',
        10
    )

    if (rolloutPercentage >= 100) {
        return true
    }

    if (rolloutPercentage <= 0) {
        return false
    }

    // Simple hash-based distribution for consistent user experience
    const hash = simpleHash(userId)
    return (hash % 100) < rolloutPercentage
}

/**
 * Simple hash function for percentage-based rollout
 */
function simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
}

/**
 * Feature flags configuration
 */
export const FEATURE_FLAGS = {
    // Main toggle for new business setup
    NEW_BUSINESS_SETUP: 'NEXT_PUBLIC_ENABLE_NEW_BUSINESS_SETUP',
    // Rollout percentage (0-100)
    ROLLOUT_PERCENT: 'NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT',
    // Enable audit logging
    AUDIT_LOGGING: 'NEXT_PUBLIC_ENABLE_AUDIT_LOGGING',
    // Enable rate limiting
    RATE_LIMITING: 'NEXT_PUBLIC_ENABLE_RATE_LIMITING',
} as const

/**
 * Get all feature flag states (for debugging/monitoring)
 */
export function getFeatureFlagStates(): Record<string, boolean | string> {
    return {
        newBusinessSetup: isNewBusinessSetupEnabled(),
        rolloutPercent: process.env.NEXT_PUBLIC_NEW_SETUP_ROLLOUT_PERCENT || '100',
        auditLogging: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING === 'true',
        rateLimiting: process.env.NEXT_PUBLIC_ENABLE_RATE_LIMITING !== 'false',
    }
}

export default {
    isNewBusinessSetupEnabled,
    isNewBusinessSetupEnabledForUser,
    getFeatureFlagStates,
    FEATURE_FLAGS,
}
