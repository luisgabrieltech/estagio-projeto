import { brand } from '@/lib/config/brand'
/**
 * Consolidated OpenAPI Specification
 *
 * Combines all endpoint specifications into a single OpenAPI document.
 * This file serves as the main entry point for the API documentation.
 *
 * @see Requirements 4.1.1
 */

import {
  OpenAPIGenerator,
  OpenAPIDocument,
  createOpenAPIGenerator,
} from './generator'

// Import endpoint definitions from individual specs
import { userEndpoints } from './specs/user'
import { formEndpoints } from './specs/form'
import { responseEndpoints } from './specs/response'
import { certificateEndpoints } from './specs/certificate'

/**
 * API configuration
 */
const API_CONFIG = {
  title: `API · ${brand.name}`,
  version: '1.0.0',
  description: `
API para gestão de formulários, avaliações e certificados.

## Autenticação

A maioria dos endpoints requer autenticação via Bearer token JWT. 
Obtenha um token através do endpoint de login e inclua-o no header Authorization:

\`\`\`
Authorization: Bearer <seu_token>
\`\`\`

## Níveis de Acesso

- **none**: Endpoint público, não requer autenticação
- **required**: Requer usuário autenticado
- **admin**: Requer usuário com role ADMIN ou CSA

## Formato de Resposta

Todas as respostas seguem um formato padronizado:

### Sucesso
\`\`\`json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

### Erro
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

### Paginação
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

## Códigos de Erro

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| VALIDATION_ERROR | 400 | Dados de entrada inválidos |
| UNAUTHORIZED | 401 | Não autenticado |
| FORBIDDEN | 403 | Sem permissão |
| NOT_FOUND | 404 | Recurso não encontrado |
| CONFLICT | 409 | Conflito de dados |
| INTERNAL_ERROR | 500 | Erro interno do servidor |
`.trim(),
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
    {
      url: '/api/v1',
      description: 'API v1 (versioned)',
    },
  ],
}

/**
 * All endpoint definitions combined
 */
const allEndpoints = [
  ...userEndpoints,
  ...formEndpoints,
  ...responseEndpoints,
  ...certificateEndpoints,
]

/**
 * API tags for grouping endpoints in documentation
 */
const API_TAGS = [
  { name: 'Authentication', description: 'User authentication and registration' },
  { name: 'User Profile', description: 'Current user profile management' },
  { name: 'Users', description: 'User listing' },
  { name: 'Admin - Users', description: 'User management (admin only)' },
  { name: 'Forms', description: 'Form operations' },
  { name: 'Admin - Forms', description: 'Form management (admin only)' },
  { name: 'Responses', description: 'Form response operations' },
  { name: 'Admin - Responses', description: 'Response management and analytics (admin only)' },
  { name: 'Certificates', description: 'Certificate operations' },
]

/**
 * Creates and returns the OpenAPI generator instance
 * Use this for advanced customization or to register additional schemas
 */
export function createAPIGenerator(): OpenAPIGenerator {
  const generator = createOpenAPIGenerator(API_CONFIG)

  // Register all endpoints
  for (const endpoint of allEndpoints) {
    generator.registerEndpoint(endpoint)
  }

  return generator
}

/**
 * Generates the complete OpenAPI specification document
 * This is the main function to use for generating the API documentation
 */
export function generateAPISpec(): OpenAPIDocument {
  const generator = createAPIGenerator()
  const spec = generator.generateSpec()

  // Add tags to the spec
  spec.tags = API_TAGS

  return spec
}

/**
 * Pre-generated OpenAPI specification
 * Use this for static access to the spec without regenerating
 */
let cachedSpec: OpenAPIDocument | null = null

/**
 * Gets the OpenAPI specification, using cache if available
 */
export function getAPISpec(): OpenAPIDocument {
  if (!cachedSpec) {
    cachedSpec = generateAPISpec()
  }
  return cachedSpec
}

/**
 * Clears the cached specification
 * Call this if you need to regenerate the spec after changes
 */
export function clearSpecCache(): void {
  cachedSpec = null
}

// Re-export types and utilities from generator
export type { OpenAPIDocument, EndpointDoc, HttpMethod, AuthRequirement } from './generator'
export {
  zodToOpenAPISchema,
  createSuccessResponseSchema,
  createErrorResponseSchema,
  createPaginatedResponseSchema,
} from './generator'

// Re-export individual endpoint arrays for selective use
export { userEndpoints } from './specs/user'
export { formEndpoints } from './specs/form'
export { responseEndpoints } from './specs/response'
export { certificateEndpoints } from './specs/certificate'
