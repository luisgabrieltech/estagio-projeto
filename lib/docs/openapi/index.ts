/**
 * OpenAPI Documentation Module
 *
 * Exports utilities for generating OpenAPI specifications from Zod schemas.
 *
 * @see Requirements 4.1.3, 4.3.1
 */

export {
  // Types
  type HttpMethod,
  type AuthRequirement,
  type EndpointDoc,
  type OpenAPIConfig,
  type OpenAPISchemaObject,
  type OpenAPIDocument,

  // Functions
  zodToOpenAPISchema,
  createSuccessResponseSchema,
  createErrorResponseSchema,
  createPaginatedResponseSchema,
  generateOpenAPISpec,
  createOpenAPIGenerator,

  // Class
  OpenAPIGenerator,
} from './generator'

// Consolidated API Specification
export {
  generateAPISpec,
  getAPISpec,
  clearSpecCache,
  createAPIGenerator,
  userEndpoints,
  formEndpoints,
  responseEndpoints,
  certificateEndpoints,
} from './spec'
