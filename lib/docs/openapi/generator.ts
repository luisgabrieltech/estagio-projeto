/**
 * OpenAPI Generator Module
 *
 * Converts Zod schemas to OpenAPI 3.0 specifications.
 * Uses @asteasolutions/zod-to-openapi for schema conversion.
 *
 * @see Requirements 4.1.3, 4.3.1
 */

import { z } from 'zod'
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z)

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Authentication requirements for endpoints
 */
export type AuthRequirement = 'required' | 'admin' | 'none'

/**
 * OpenAPI Schema Object type (simplified for our use case)
 */
export interface OpenAPISchemaObject {
  type?: string
  format?: string
  properties?: Record<string, OpenAPISchemaObject>
  items?: OpenAPISchemaObject
  required?: string[]
  enum?: (string | number | boolean)[]
  description?: string
  nullable?: boolean
  default?: unknown
  example?: unknown
  oneOf?: OpenAPISchemaObject[]
  anyOf?: OpenAPISchemaObject[]
  allOf?: OpenAPISchemaObject[]
  $ref?: string
  [key: string]: unknown
}

/**
 * OpenAPI Document type (simplified)
 */
export interface OpenAPIDocument {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, unknown>
  components?: {
    schemas?: Record<string, OpenAPISchemaObject>
    securitySchemes?: Record<string, unknown>
  }
  security?: Array<Record<string, string[]>>
  tags?: Array<{ name: string; description?: string }>
}


/**
 * Endpoint documentation configuration
 */
export interface EndpointDoc {
  /** API path (e.g., '/api/users/{id}') */
  path: string
  /** HTTP method */
  method: HttpMethod
  /** Short summary of the endpoint */
  summary: string
  /** Detailed description (optional) */
  description?: string
  /** Tags for grouping endpoints */
  tags: string[]
  /** Request body schema (optional) */
  requestBody?: z.ZodSchema
  /** Query parameters schema (optional, must be ZodObject) */
  queryParams?: z.AnyZodObject
  /** Path parameters schema (optional, must be ZodObject) */
  pathParams?: z.AnyZodObject
  /** Response schemas by status code */
  responses: {
    [statusCode: number]: {
      description: string
      schema?: z.ZodSchema
    }
  }
  /** Authentication requirement */
  auth?: AuthRequirement
}

/**
 * OpenAPI specification configuration
 */
export interface OpenAPIConfig {
  /** API title */
  title: string
  /** API version */
  version: string
  /** API description */
  description?: string
  /** Server URLs */
  servers?: Array<{
    url: string
    description?: string
  }>
}

/**
 * Converts a Zod schema to an OpenAPI schema object
 *
 * @param schema - Zod schema to convert
 * @param registry - OpenAPI registry instance
 * @returns OpenAPI schema object
 *
 * @see Requirements 4.3.1
 */
export function zodToOpenAPISchema(
  schema: z.ZodSchema,
  registry?: OpenAPIRegistry
): OpenAPISchemaObject {
  const reg = registry ?? new OpenAPIRegistry()

  // Register the schema temporarily to extract its OpenAPI representation
  const tempName = `_temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
  reg.register(tempName, schema)

  // Generate the spec to extract the schema
  const generator = new OpenApiGeneratorV3(reg.definitions)
  const spec = generator.generateComponents()

  // Extract and return the schema
  const schemas = spec.components?.schemas ?? {}
  const result = schemas[tempName] as OpenAPISchemaObject

  return result ?? { type: 'object' }
}

/**
 * Creates a standard success response schema
 *
 * @param dataSchema - Schema for the data field
 * @returns OpenAPI schema for success response
 */
export function createSuccessResponseSchema(
  dataSchema: z.ZodSchema
): z.ZodObject<{
  success: z.ZodLiteral<true>
  data: z.ZodSchema
  timestamp: z.ZodString
}> {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime(),
  })
}

/**
 * Creates a standard error response schema
 *
 * @returns OpenAPI schema for error response
 */
export function createErrorResponseSchema(): z.ZodObject<{
  success: z.ZodLiteral<false>
  error: z.ZodObject<{
    code: z.ZodEnum<[
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'INTERNAL_ERROR',
      'SERVICE_UNAVAILABLE'
    ]>
    message: z.ZodString
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>
  }>
  timestamp: z.ZodString
}> {
  return z.object({
    success: z.literal(false),
    error: z.object({
      code: z.enum([
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'CONFLICT',
        'INTERNAL_ERROR',
        'SERVICE_UNAVAILABLE',
      ]),
      message: z.string(),
      details: z.record(z.array(z.string())).optional(),
    }),
    timestamp: z.string().datetime(),
  })
}


/**
 * Creates a standard paginated response schema
 *
 * @param itemSchema - Schema for individual items in the data array
 * @returns OpenAPI schema for paginated response
 */
export function createPaginatedResponseSchema<T extends z.ZodSchema>(
  itemSchema: T
): z.ZodObject<{
  success: z.ZodLiteral<true>
  data: z.ZodArray<T>
  pagination: z.ZodObject<{
    page: z.ZodNumber
    pageSize: z.ZodNumber
    total: z.ZodNumber
    totalPages: z.ZodNumber
  }>
  timestamp: z.ZodString
}> {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
    timestamp: z.string().datetime(),
  })
}

/**
 * OpenAPI Generator class for building complete API specifications
 */
export class OpenAPIGenerator {
  private registry: OpenAPIRegistry
  private config: OpenAPIConfig

  constructor(config: OpenAPIConfig) {
    this.registry = new OpenAPIRegistry()
    this.config = config
    this.registerSecuritySchemes()
  }

  /**
   * Registers the Bearer token security scheme
   */
  private registerSecuritySchemes(): void {
    this.registry.registerComponent('securitySchemes', 'bearerAuth', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT authentication token',
    })
  }

  /**
   * Registers a Zod schema with a name for reuse
   *
   * @param name - Schema name for reference
   * @param schema - Zod schema to register
   * @returns The registered schema with OpenAPI metadata
   */
  registerSchema<T extends z.ZodSchema>(name: string, schema: T): T {
    return this.registry.register(name, schema)
  }

  /**
   * Registers an API endpoint
   *
   * @param endpoint - Endpoint documentation configuration
   */
  registerEndpoint(endpoint: EndpointDoc): void {
    const { path, method, summary, description, tags, auth, responses } = endpoint

    // Build request body if provided
    const requestBody = endpoint.requestBody
      ? {
          content: {
            'application/json': {
              schema: endpoint.requestBody,
            },
          },
          required: true,
        }
      : undefined

    // Build responses
    const responseSpecs: Record<string, { description: string; content?: Record<string, { schema: z.ZodSchema }> }> = {}
    for (const [statusCode, response] of Object.entries(responses)) {
      responseSpecs[statusCode] = {
        description: response.description,
        ...(response.schema && {
          content: {
            'application/json': {
              schema: response.schema,
            },
          },
        }),
      }
    }

    // Build security requirements
    const security = auth === 'none' ? [] : [{ bearerAuth: [] }]

    // Register the path
    this.registry.registerPath({
      method: method.toLowerCase() as Lowercase<HttpMethod>,
      path,
      summary,
      description,
      tags,
      security,
      request: {
        body: requestBody,
        params: endpoint.pathParams,
        query: endpoint.queryParams,
      },
      responses: responseSpecs,
    })
  }


  /**
   * Generates the complete OpenAPI specification document
   *
   * @returns OpenAPI 3.0 specification document
   */
  generateSpec(): OpenAPIDocument {
    const generator = new OpenApiGeneratorV3(this.registry.definitions)

    const spec = generator.generateDocument({
      openapi: '3.0.3',
      info: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description,
      },
      servers: this.config.servers ?? [
        {
          url: '/api',
          description: 'API Server',
        },
      ],
    })

    // Cast to our simplified type
    return spec as unknown as OpenAPIDocument
  }

  /**
   * Gets the underlying registry for advanced usage
   */
  getRegistry(): OpenAPIRegistry {
    return this.registry
  }
}

/**
 * Generates an OpenAPI specification from a list of endpoint configurations
 *
 * @param config - OpenAPI configuration
 * @param endpoints - List of endpoint documentation
 * @returns Complete OpenAPI 3.0 specification document
 *
 * @see Requirements 4.1.3
 */
export function generateOpenAPISpec(
  config: OpenAPIConfig,
  endpoints: EndpointDoc[]
): OpenAPIDocument {
  const generator = new OpenAPIGenerator(config)

  for (const endpoint of endpoints) {
    generator.registerEndpoint(endpoint)
  }

  return generator.generateSpec()
}

/**
 * Creates a reusable OpenAPI generator instance
 *
 * @param config - OpenAPI configuration
 * @returns OpenAPI generator instance
 */
export function createOpenAPIGenerator(config: OpenAPIConfig): OpenAPIGenerator {
  return new OpenAPIGenerator(config)
}
