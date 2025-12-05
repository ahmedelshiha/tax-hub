/**
 * API Key Service
 * Generates, validates, and manages API keys for programmatic access
 */

import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

// API Key prefix for identification
const KEY_PREFIX = 'txhb_live_'

// Available scopes
export const API_SCOPES = {
    'entities:read': 'Read entity information',
    'entities:write': 'Create and update entities',
    'entities:delete': 'Delete entities',
    'users:read': 'Read user information',
    'webhooks:manage': 'Manage webhooks',
    '*': 'Full access',
} as const

export type ApiScope = keyof typeof API_SCOPES

export interface GeneratedApiKey {
    key: string       // Full key (shown once)
    keyPrefix: string // Display prefix
    keyHash: string   // SHA-256 hash for storage
}

// Define ApiKey interface locally until Prisma is regenerated
export interface ApiKeyRecord {
    id: string
    tenantId: string
    userId: string
    name: string
    keyHash: string
    keyPrefix: string
    scopes: string[]
    expiresAt: Date | null
    lastUsedAt: Date | null
    lastUsedIp: string | null
    isActive: boolean
    createdAt: Date
    revokedAt: Date | null
}

export interface ApiKeyWithUser extends ApiKeyRecord {
    user?: {
        id: string
        email: string
        name: string | null
    }
}

class ApiKeyService {
    /**
     * Generate a new API key
     */
    generateKey(): GeneratedApiKey {
        // Generate 32 random bytes
        const randomPart = randomBytes(24).toString('base64url')
        const fullKey = `${KEY_PREFIX}${randomPart}`

        // Create hash for storage
        const keyHash = this.hashKey(fullKey)

        // Create prefix for display (first 12 chars + ...)
        const keyPrefix = fullKey.substring(0, 12)

        return {
            key: fullKey,
            keyPrefix,
            keyHash,
        }
    }

    /**
     * Hash an API key using SHA-256
     */
    private hashKey(key: string): string {
        return createHash('sha256').update(key).digest('hex')
    }

    /**
     * Create a new API key for a user
     */
    async createKey(params: {
        tenantId: string
        userId: string
        name: string
        scopes: ApiScope[]
        expiresInDays?: number
    }): Promise<{ apiKey: ApiKeyRecord; plainKey: string }> {
        const { tenantId, userId, name, scopes, expiresInDays } = params

        const generated = this.generateKey()

        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : null

        const apiKey = await (prisma as any).apiKey.create({
            data: {
                tenantId,
                userId,
                name,
                keyHash: generated.keyHash,
                keyPrefix: generated.keyPrefix,
                scopes,
                expiresAt,
                isActive: true,
            },
        })

        return {
            apiKey,
            plainKey: generated.key,
        }
    }

    /**
     * Validate an API key and return the key record if valid
     */
    async validateKey(key: string): Promise<ApiKeyWithUser | null> {
        // Quick format check
        if (!key.startsWith(KEY_PREFIX)) {
            return null
        }

        const keyHash = this.hashKey(key)

        const apiKey = await (prisma as any).apiKey.findUnique({
            where: { keyHash },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        })

        if (!apiKey) {
            return null
        }

        // Check if active
        if (!apiKey.isActive) {
            return null
        }

        // Check expiration
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return null
        }

        // Update last used
        await (prisma as any).apiKey.update({
            where: { id: apiKey.id },
            data: {
                lastUsedAt: new Date(),
            },
        }).catch(() => { }) // Non-blocking update

        return apiKey
    }

    /**
     * Check if a key has a specific scope
     */
    hasScope(apiKey: ApiKeyRecord, requiredScope: ApiScope): boolean {
        // Full access scope grants all permissions
        if (apiKey.scopes.includes('*')) {
            return true
        }

        return apiKey.scopes.includes(requiredScope)
    }

    /**
     * List all API keys for a tenant
     */
    async listKeys(tenantId: string): Promise<ApiKeyWithUser[]> {
        return (prisma as any).apiKey.findMany({
            where: { tenantId },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Revoke an API key
     */
    async revokeKey(id: string, tenantId: string): Promise<ApiKeyRecord | null> {
        return (prisma as any).apiKey.update({
            where: { id, tenantId },
            data: {
                isActive: false,
                revokedAt: new Date(),
            },
        })
    }

    /**
     * Delete an API key permanently
     */
    async deleteKey(id: string, tenantId: string): Promise<void> {
        await (prisma as any).apiKey.delete({
            where: { id, tenantId },
        })
    }

    /**
     * Get API key by ID
     */
    async getKey(id: string, tenantId: string): Promise<ApiKeyWithUser | null> {
        return (prisma as any).apiKey.findFirst({
            where: { id, tenantId },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        })
    }
}

export const apiKeyService = new ApiKeyService()
