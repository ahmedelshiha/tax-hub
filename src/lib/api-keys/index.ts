/**
 * API Keys barrel export
 */

export {
    apiKeyService,
    API_SCOPES,
    type ApiScope,
    type ApiKeyWithUser,
    type ApiKeyRecord,
    type GeneratedApiKey,
} from './api-key.service'

export {
    authenticateApiKey,
    withApiKeyAuth,
    authenticateRequest,
    extractApiKey,
    requireScope,
    type ApiKeyContext,
} from './api-key-middleware'
