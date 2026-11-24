/**
 * Property-Based Tests for API Response Format
 *
 * Feature: api-refactoring, Properties 1-3
 * Validates: Requirements 2.1-2.5, 3.1-3.3
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError } from '@/lib/domain/errors/validation-error'
import { NotFoundError } from '@/lib/domain/errors/not-found-error'
import { ForbiddenError } from '@/lib/domain/errors/forbidden-error'
import { ConflictError } from '@/lib/domain/errors/conflict-error'
import { success, paginated, created, noContent } from '@/lib/api/server-helpers'

// Helper: Generate non-empty strings for error messages
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

// Helper: Generate valid resource names (alphanumeric)
const resourceNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,29}$/)

// Helper: Generate valid IDs (alphanumeric with dashes)
const idArb = fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/)

// Helper: Generate validation details (field -> error messages)
const validationDetailsArb = fc.dictionary(
  fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,29}$/),
  fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 })
)

// Helper: Generate arbitrary data for success responses
const dataArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.record({ id: fc.string(), name: fc.string() }),
  fc.array(fc.record({ id: fc.string() }))
)

// Helper: Generate pagination metadata
const paginationArb = fc.record({
  page: fc.integer({ min: 1, max: 1000 }),
  pageSize: fc.integer({ min: 1, max: 100 }),
  total: fc.integer({ min: 0, max: 100000 }),
  totalPages: fc.integer({ min: 0, max: 10000 }),
})

describe('API Response Format Properties', () => {
  /**
   * Feature: api-refactoring, Property 1: Error Response Format Consistency
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.2
   *
   * For any error returned by an API route, the response body SHALL contain
   * `error` object with `code` and `message` fields (new standardized format).
   */
  describe('Property 1: Error Response Format Consistency', () => {
    it('should return consistent error format for ValidationError', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, validationDetailsArb, async (message, details) => {
          const error = new ValidationError(message, details)
          const response = handleDomainError(error)
          const body = await response.json()

          // New format: error is an object with code and message
          expect(body.success).toBe(false)
          expect(typeof body.error).toBe('object')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent error format for NotFoundError', async () => {
      await fc.assert(
        fc.asyncProperty(resourceNameArb, fc.option(idArb, { nil: undefined }), async (resource, id) => {
          const error = new NotFoundError(resource, id)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(body.success).toBe(false)
          expect(typeof body.error).toBe('object')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent error format for ForbiddenError', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ForbiddenError(message)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(body.success).toBe(false)
          expect(typeof body.error).toBe('object')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent error format for ConflictError', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ConflictError(message)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(body.success).toBe(false)
          expect(typeof body.error).toBe('object')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should return consistent error format for unknown errors', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new Error(message)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(body.success).toBe(false)
          expect(typeof body.error).toBe('object')
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(body.error.code.length).toBeGreaterThan(0)
          expect(body.error.message.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: api-refactoring, Property 2: Success Response Format Consistency
   * Validates: Requirements 3.1, 3.3
   *
   * For any successful response from an API route, the response body SHALL
   * contain a `data` field, and if the response is a list, it SHALL include
   * a `pagination` field when applicable.
   */
  describe('Property 2: Success Response Format Consistency', () => {
    it('should wrap data in { data: T } for success responses', async () => {
      await fc.assert(
        fc.asyncProperty(dataArb, async (data) => {
          const response = success(data)
          const body = await response.json()

          expect(body).toHaveProperty('data')
          expect(body.data).toEqual(data)
          expect(response.status).toBe(200)
        }),
        { numRuns: 100 }
      )
    })

    it('should allow custom status codes for success responses', async () => {
      // Only use status codes that can have a JSON body (200, 201, 202, 203)
      // 204 (No Content) and 205 (Reset Content) cannot have a body
      const validStatusArb = fc.constantFrom(200, 201, 202, 203)
      
      await fc.assert(
        fc.asyncProperty(
          dataArb,
          validStatusArb,
          async (data, status) => {
            const response = success(data, status)
            const body = await response.json()

            expect(body).toHaveProperty('data')
            expect(body.data).toEqual(data)
            expect(response.status).toBe(status)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include pagination metadata for paginated responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({ id: fc.string(), name: fc.string() })),
          paginationArb,
          async (data, pagination) => {
            const response = paginated(data, pagination)
            const body = await response.json()

            expect(body).toHaveProperty('data')
            expect(body).toHaveProperty('pagination')
            expect(Array.isArray(body.data)).toBe(true)
            expect(body.data).toEqual(data)
            expect(body.pagination).toEqual(pagination)
            expect(response.status).toBe(200)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 201 status for created responses', async () => {
      await fc.assert(
        fc.asyncProperty(dataArb, async (data) => {
          const response = created(data)
          const body = await response.json()

          expect(body).toHaveProperty('data')
          expect(body.data).toEqual(data)
          expect(response.status).toBe(201)
        }),
        { numRuns: 100 }
      )
    })

    it('should return 204 status with no body for noContent responses', () => {
      const response = noContent()
      expect(response.status).toBe(204)
      expect(response.body).toBeNull()
    })
  })

  /**
   * Feature: api-refactoring, Property 3: Error Code to HTTP Status Mapping
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
   *
   * For any domain error type, the HTTP status code SHALL be deterministic:
   * ValidationError→400, NotFoundError→404, ForbiddenError→403,
   * ConflictError→409, unknown→500.
   */
  describe('Property 3: Error Code to HTTP Status Mapping', () => {
    it('should map ValidationError to HTTP 400', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ValidationError(message)
          const response = handleDomainError(error)
          expect(response.status).toBe(400)
        }),
        { numRuns: 100 }
      )
    })

    it('should map NotFoundError to HTTP 404', async () => {
      await fc.assert(
        fc.asyncProperty(resourceNameArb, async (resource) => {
          const error = new NotFoundError(resource)
          const response = handleDomainError(error)
          expect(response.status).toBe(404)
        }),
        { numRuns: 100 }
      )
    })

    it('should map ForbiddenError to HTTP 403', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ForbiddenError(message)
          const response = handleDomainError(error)
          expect(response.status).toBe(403)
        }),
        { numRuns: 100 }
      )
    })

    it('should map ConflictError to HTTP 409', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ConflictError(message)
          const response = handleDomainError(error)
          expect(response.status).toBe(409)
        }),
        { numRuns: 100 }
      )
    })

    it('should map unknown errors to HTTP 500', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new Error(message)
          const response = handleDomainError(error)
          expect(response.status).toBe(500)
        }),
        { numRuns: 100 }
      )
    })

    it('should deterministically map all error types to correct status codes', async () => {
      const errorTypeArb = fc.oneof(
        fc.record({
          type: fc.constant('validation' as const),
          message: nonEmptyStringArb,
          expectedStatus: fc.constant(400),
          expectedCode: fc.constant('VALIDATION_ERROR'),
        }),
        fc.record({
          type: fc.constant('notFound' as const),
          resource: resourceNameArb,
          expectedStatus: fc.constant(404),
          expectedCode: fc.constant('NOT_FOUND'),
        }),
        fc.record({
          type: fc.constant('forbidden' as const),
          message: nonEmptyStringArb,
          expectedStatus: fc.constant(403),
          expectedCode: fc.constant('FORBIDDEN'),
        }),
        fc.record({
          type: fc.constant('conflict' as const),
          message: nonEmptyStringArb,
          expectedStatus: fc.constant(409),
          expectedCode: fc.constant('CONFLICT'),
        }),
        fc.record({
          type: fc.constant('unknown' as const),
          message: nonEmptyStringArb,
          expectedStatus: fc.constant(500),
          expectedCode: fc.constant('INTERNAL_ERROR'),
        })
      )

      await fc.assert(
        fc.asyncProperty(errorTypeArb, async (spec) => {
          let error: Error

          switch (spec.type) {
            case 'validation':
              error = new ValidationError(spec.message)
              break
            case 'notFound':
              error = new NotFoundError(spec.resource)
              break
            case 'forbidden':
              error = new ForbiddenError(spec.message)
              break
            case 'conflict':
              error = new ConflictError(spec.message)
              break
            case 'unknown':
              error = new Error(spec.message)
              break
          }

          const response = handleDomainError(error)
          const body = await response.json()

          expect(response.status).toBe(spec.expectedStatus)
          // New format: error is an object with code property
          expect(body.error.code).toBe(spec.expectedCode)
        }),
        { numRuns: 100 }
      )
    })
  })
})


// Import new standardized response format functions
import {
  formatSuccess,
  formatError,
  formatPaginated,
  formatCreated,
  type SuccessResponse,
  type ErrorResponse,
  type PaginatedResponse,
} from '@/lib/api/response-format'
import { ErrorCode } from '@/lib/api/error-codes'

describe('Standardized API Response Format Properties', () => {
  /**
   * Feature: project-evolution-roadmap, Property 7: API Response Format Consistency
   * Validates: Requirements 2.2.1
   *
   * For any successful API response, the response body SHALL contain
   * { success: true, data: ..., timestamp: ... } structure.
   */
  describe('Property 7: API Response Format Consistency', () => {
    it('should return { success: true, data, timestamp } for all success responses', async () => {
      await fc.assert(
        fc.asyncProperty(dataArb, async (data) => {
          const response = formatSuccess(data)
          const body: SuccessResponse<typeof data> = await response.json()

          // Must have success: true
          expect(body.success).toBe(true)
          // Must have data field
          expect(body).toHaveProperty('data')
          expect(body.data).toEqual(data)
          // Must have timestamp in ISO format
          expect(body).toHaveProperty('timestamp')
          expect(typeof body.timestamp).toBe('string')
          expect(() => new Date(body.timestamp)).not.toThrow()
          // Timestamp should be valid ISO date
          expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
        }),
        { numRuns: 100 }
      )
    })

    it('should return { success: true, data, timestamp } for created responses', async () => {
      await fc.assert(
        fc.asyncProperty(dataArb, async (data) => {
          const response = formatCreated(data)
          const body: SuccessResponse<typeof data> = await response.json()

          expect(body.success).toBe(true)
          expect(body).toHaveProperty('data')
          expect(body.data).toEqual(data)
          expect(body).toHaveProperty('timestamp')
          expect(typeof body.timestamp).toBe('string')
          expect(response.status).toBe(201)
        }),
        { numRuns: 100 }
      )
    })

    it('should allow custom status codes while maintaining format', async () => {
      const validStatusArb = fc.constantFrom(200, 201, 202, 203)

      await fc.assert(
        fc.asyncProperty(dataArb, validStatusArb, async (data, status) => {
          const response = formatSuccess(data, status)
          const body: SuccessResponse<typeof data> = await response.json()

          expect(body.success).toBe(true)
          expect(body).toHaveProperty('data')
          expect(body).toHaveProperty('timestamp')
          expect(response.status).toBe(status)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: project-evolution-roadmap, Property 8: API Error Format Consistency
   * Validates: Requirements 2.2.2
   *
   * For any failed API response, the response body SHALL contain
   * { success: false, error: { code, message }, timestamp: ... } structure.
   */
  describe('Property 8: API Error Format Consistency', () => {
    // Generator for error codes
    const errorCodeArb = fc.constantFrom(
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.UNAUTHORIZED,
      ErrorCode.FORBIDDEN,
      ErrorCode.NOT_FOUND,
      ErrorCode.CONFLICT,
      ErrorCode.INTERNAL_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE
    )

    it('should return { success: false, error: { code, message }, timestamp } for all error responses', async () => {
      await fc.assert(
        fc.asyncProperty(errorCodeArb, nonEmptyStringArb, async (code, message) => {
          const response = formatError(code, message)
          const body: ErrorResponse = await response.json()

          // Must have success: false
          expect(body.success).toBe(false)
          // Must have error object with code and message
          expect(body).toHaveProperty('error')
          expect(body.error).toHaveProperty('code')
          expect(body.error).toHaveProperty('message')
          expect(body.error.code).toBe(code)
          expect(body.error.message).toBe(message)
          // Must have timestamp
          expect(body).toHaveProperty('timestamp')
          expect(typeof body.timestamp).toBe('string')
          expect(() => new Date(body.timestamp)).not.toThrow()
        }),
        { numRuns: 100 }
      )
    })

    it('should include details when provided', async () => {
      await fc.assert(
        fc.asyncProperty(errorCodeArb, nonEmptyStringArb, validationDetailsArb, async (code, message, details) => {
          const response = formatError(code, message, details)
          const body: ErrorResponse = await response.json()

          expect(body.success).toBe(false)
          expect(body.error.code).toBe(code)
          expect(body.error.message).toBe(message)

          // Details should be included if non-empty
          if (Object.keys(details).length > 0) {
            expect(body.error.details).toEqual(details)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should not include details field when empty or undefined', async () => {
      await fc.assert(
        fc.asyncProperty(errorCodeArb, nonEmptyStringArb, async (code, message) => {
          const response = formatError(code, message)
          const body: ErrorResponse = await response.json()

          expect(body.error).not.toHaveProperty('details')
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: project-evolution-roadmap, Property 9: Paginated Response Format
   * Validates: Requirements 2.2.3
   *
   * For any paginated API response, the response body SHALL contain
   * pagination metadata with page, pageSize, total, and totalPages fields.
   */
  describe('Property 9: Paginated Response Format', () => {
    it('should include pagination metadata with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({ id: fc.string(), name: fc.string() })),
          paginationArb,
          async (data, pagination) => {
            const response = formatPaginated(data, pagination)
            const body: PaginatedResponse<typeof data[0]> = await response.json()

            // Must have success: true
            expect(body.success).toBe(true)
            // Must have data array
            expect(body).toHaveProperty('data')
            expect(Array.isArray(body.data)).toBe(true)
            expect(body.data).toEqual(data)
            // Must have pagination object with all required fields
            expect(body).toHaveProperty('pagination')
            expect(body.pagination).toHaveProperty('page')
            expect(body.pagination).toHaveProperty('pageSize')
            expect(body.pagination).toHaveProperty('total')
            expect(body.pagination).toHaveProperty('totalPages')
            // Pagination values should match input
            expect(body.pagination.page).toBe(pagination.page)
            expect(body.pagination.pageSize).toBe(pagination.pageSize)
            expect(body.pagination.total).toBe(pagination.total)
            expect(body.pagination.totalPages).toBe(pagination.totalPages)
            // Must have timestamp
            expect(body).toHaveProperty('timestamp')
            expect(typeof body.timestamp).toBe('string')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty data arrays', async () => {
      await fc.assert(
        fc.asyncProperty(paginationArb, async (pagination) => {
          const response = formatPaginated([], pagination)
          const body: PaginatedResponse<unknown> = await response.json()

          expect(body.success).toBe(true)
          expect(body.data).toEqual([])
          expect(body.pagination).toEqual(pagination)
          expect(body).toHaveProperty('timestamp')
        }),
        { numRuns: 100 }
      )
    })

    it('should allow custom status codes for paginated responses', async () => {
      const validStatusArb = fc.constantFrom(200, 201, 202, 203)

      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({ id: fc.string() })),
          paginationArb,
          validStatusArb,
          async (data, pagination, status) => {
            const response = formatPaginated(data, pagination, status)
            const body: PaginatedResponse<typeof data[0]> = await response.json()

            expect(body.success).toBe(true)
            expect(body).toHaveProperty('pagination')
            expect(response.status).toBe(status)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
