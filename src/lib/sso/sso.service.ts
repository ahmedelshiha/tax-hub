/**
 * SSO Service
 * Manages SSO configurations and SAML/OIDC authentication
 */

import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

// SSO Provider Types
export const SSO_PROVIDERS = {
    saml: 'SAML 2.0',
    oidc: 'OpenID Connect',
} as const

export type SsoProvider = keyof typeof SSO_PROVIDERS

// SSO Connection interface (until Prisma regenerated)
export interface SsoConnectionRecord {
    id: string
    tenantId: string
    name: string
    provider: string
    enabled: boolean
    entityId: string | null
    ssoUrl: string | null
    certificate: string | null
    clientId: string | null
    clientSecret: string | null
    discoveryUrl: string | null
    emailDomains: string[]
    metadata: any
    lastTestAt: Date | null
    lastTestResult: string | null
    createdAt: Date
    updatedAt: Date
}

// SAML Assertion result
export interface SamlAssertionResult {
    success: boolean
    email?: string
    firstName?: string
    lastName?: string
    nameId?: string
    sessionIndex?: string
    attributes?: Record<string, string | string[]>
    error?: string
}

// SP Metadata
export interface SpMetadata {
    entityId: string
    acsUrl: string
    sloUrl: string
    certificate?: string
}

class SsoService {
    /**
     * Get base URL for SSO callbacks
     */
    private getBaseUrl(): string {
        return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }

    /**
     * Generate SP Entity ID
     */
    getSpEntityId(tenantSlug: string): string {
        return `${this.getBaseUrl()}/api/auth/sso/saml/${tenantSlug}`
    }

    /**
     * Generate ACS URL (Assertion Consumer Service)
     */
    getAcsUrl(tenantSlug: string): string {
        return `${this.getBaseUrl()}/api/auth/sso/saml/${tenantSlug}/acs`
    }

    /**
     * Generate SLO URL (Single Logout)
     */
    getSloUrl(tenantSlug: string): string {
        return `${this.getBaseUrl()}/api/auth/sso/saml/${tenantSlug}/slo`
    }

    /**
     * Get SP Metadata for a tenant
     */
    getSpMetadata(tenantSlug: string): SpMetadata {
        return {
            entityId: this.getSpEntityId(tenantSlug),
            acsUrl: this.getAcsUrl(tenantSlug),
            sloUrl: this.getSloUrl(tenantSlug),
        }
    }

    /**
     * Generate SP Metadata XML
     */
    generateSpMetadataXml(tenantSlug: string): string {
        const metadata = this.getSpMetadata(tenantSlug)

        return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${metadata.entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false"
                      WantAssertionsSigned="true"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="${metadata.acsUrl}"
                                 index="0"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="${metadata.sloUrl}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`
    }

    /**
     * Create or update SSO connection
     */
    async upsertConnection(params: {
        tenantId: string
        name: string
        provider: SsoProvider
        entityId?: string
        ssoUrl?: string
        certificate?: string
        clientId?: string
        clientSecret?: string
        discoveryUrl?: string
        emailDomains?: string[]
        enabled?: boolean
    }): Promise<SsoConnectionRecord> {
        const { tenantId, provider, ...data } = params

        return (prisma as any).ssoConnection.upsert({
            where: {
                tenantId_provider: { tenantId, provider },
            },
            update: {
                ...data,
                updatedAt: new Date(),
            },
            create: {
                tenantId,
                provider,
                ...data,
                enabled: data.enabled ?? false,
            },
        })
    }

    /**
     * Get SSO connection for a tenant
     */
    async getConnection(tenantId: string, provider?: SsoProvider): Promise<SsoConnectionRecord | null> {
        const where: any = { tenantId }
        if (provider) {
            where.provider = provider
        } else {
            where.enabled = true
        }

        return (prisma as any).ssoConnection.findFirst({
            where,
        })
    }

    /**
     * Get all SSO connections for a tenant
     */
    async listConnections(tenantId: string): Promise<SsoConnectionRecord[]> {
        return (prisma as any).ssoConnection.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Delete SSO connection
     */
    async deleteConnection(id: string, tenantId: string): Promise<void> {
        await (prisma as any).ssoConnection.delete({
            where: { id, tenantId },
        })
    }

    /**
     * Check if email domain has SSO configured
     */
    async findConnectionByEmailDomain(email: string): Promise<SsoConnectionRecord | null> {
        const domain = email.split('@')[1]?.toLowerCase()
        if (!domain) return null

        // Find any enabled SSO connection with this email domain
        const connections = await (prisma as any).ssoConnection.findMany({
            where: {
                enabled: true,
                emailDomains: { has: domain },
            },
        })

        return connections[0] || null
    }

    /**
     * Parse and validate SAML assertion (mock implementation)
     * In production, use @node-saml/node-saml or similar
     */
    async validateSamlAssertion(
        connection: SsoConnectionRecord,
        samlResponse: string
    ): Promise<SamlAssertionResult> {
        try {
            // Mock SAML validation - in production use proper SAML library
            // This demonstrates the interface structure

            // Decode base64 SAML response
            const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8')

            // Extract email from NameID (simplified)
            const emailMatch = decoded.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/)
            const email = emailMatch?.[1]

            if (!email) {
                return {
                    success: false,
                    error: 'Could not extract email from SAML assertion',
                }
            }

            // Extract attributes (simplified)
            const firstNameMatch = decoded.match(/FirstName[^>]*>([^<]+)</)
            const lastNameMatch = decoded.match(/LastName[^>]*>([^<]+)</)

            return {
                success: true,
                email: email.toLowerCase(),
                firstName: firstNameMatch?.[1],
                lastName: lastNameMatch?.[1],
                nameId: email,
                attributes: {},
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'SAML validation failed',
            }
        }
    }

    /**
     * Generate SAML AuthnRequest (simplified)
     */
    generateSamlAuthnRequest(connection: SsoConnectionRecord, tenantSlug: string): string {
        const id = `_${createHash('sha256').update(Date.now().toString()).digest('hex').substring(0, 32)}`
        const issueInstant = new Date().toISOString()
        const spEntityId = this.getSpEntityId(tenantSlug)
        const acsUrl = this.getAcsUrl(tenantSlug)

        const authnRequest = `<samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
      ID="${id}"
      Version="2.0"
      IssueInstant="${issueInstant}"
      Destination="${connection.ssoUrl}"
      AssertionConsumerServiceURL="${acsUrl}"
      ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
      <saml:Issuer>${spEntityId}</saml:Issuer>
      <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
    </samlp:AuthnRequest>`

        return Buffer.from(authnRequest).toString('base64')
    }

    /**
     * Test SSO connection
     */
    async testConnection(id: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
        const connection = await (prisma as any).ssoConnection.findFirst({
            where: { id, tenantId },
        })

        if (!connection) {
            return { success: false, error: 'Connection not found' }
        }

        // Validate configuration
        if (connection.provider === 'saml') {
            if (!connection.ssoUrl || !connection.certificate) {
                return { success: false, error: 'Missing SSO URL or certificate' }
            }

            // Try to fetch IdP metadata
            try {
                const response = await fetch(connection.ssoUrl, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000),
                })

                await (prisma as any).ssoConnection.update({
                    where: { id },
                    data: {
                        lastTestAt: new Date(),
                        lastTestResult: response.ok ? 'success' : 'failed',
                    },
                })

                return { success: response.ok }
            } catch (error) {
                await (prisma as any).ssoConnection.update({
                    where: { id },
                    data: {
                        lastTestAt: new Date(),
                        lastTestResult: 'failed',
                    },
                })

                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Connection test failed',
                }
            }
        }

        return { success: false, error: 'Provider not supported yet' }
    }
}

export const ssoService = new SsoService()
