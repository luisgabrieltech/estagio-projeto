/**
 * Property-Based Tests for Error Code Mapping
 *
 * Feature: project-evolution-roadmap, Property 10: Error Code Mapping
 * Validates: Requirements 2.3.1-5
 *
 * For any domain error type, the error SHALL map to the correct HTTP status code:
 * - ValidationError → 400
 * - NotFoundError → 404
 * - ForbiddenError → 403
 * - ConflictError → 409
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError } from '@/lib/domain/errors/validation-error'
import { NotFoundError } from '@/lib/domain/errors/not-found-error'
import { ForbiddenError } from '@/lib/domain/errors/forbidden-error'
import { ConflictError } from '@/lib/domain/errors/conflict-error'
import {
  ErrorCode,
  errorCodeToStatus,
  getStatusForErrorCode,
  getErrorCodeForStatus,
} from '@/lib/api/error-codes'

// Helper: Generate non-empty strings for error messages
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0)

// Helper: Generate valid resource names (alphanumeric)
const resourceNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,29}$/)

// Helper: Generate valid IDs (alphanumeric with dashes)
const idArb = fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/)

// Helper: Generate validation details (field -> error messages)
const validationDetailsArb = fc.dictionary(
  fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,29}$/),
  fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 })
)

// Generator for all error codes
const errorCodeArb = fc.constantFrom(
  ErrorCode.VALIDATION_ERROR,
  ErrorCode.UNAUTHORIZED,
  ErrorCode.FORBIDDEN,
  ErrorCode.NOT_FOUND,
  ErrorCode.CONFLICT,
  ErrorCode.INTERNAL_ERROR,
  ErrorCode.SERVICE_UNAVAILABLE
)

describe('Error Code Mapping Properties', () => {
  /**
   * Feature: project-evolution-roadmap, Property 10: Error Code Mapping
   * Validates: Requirements 2.3.1-5
   *
   * For any domain error type, the error SHALL map to the correct HTTP status code
   * (ValidationError→400, NotFoundError→404, ForbiddenError→403, ConflictError→409).
   */
  describe('Property 10: Error Code Mapping', () => {
    /**
     * Validates: Requirement 2.3.1
     * WHEN um recurso não é encontrado THEN the Sistema CPA SHALL retornar
     * código NOT_FOUND com status 404
     */
    it('should map NOT_FOUND error code to HTTP 404', () => {
      fc.assert(
        fc.property(fc.constant(ErrorCode.NOT_FOUND), (code) => {
          const status = getStatusForErrorCode(code)
          expect(status).toBe(404)
          expect(errorCodeToStatus[code]).toBe(404)
        }),
        { numRuns: 100 }
      )
    })

    it('should map NotFoundError to NOT_FOUND code and HTTP 404', async () => {
      await fc.assert(
        fc.asyncProperty(
          resourceNameArb,
          fc.option(idArb, { nil: undefined }),
          async (resource, id) => {
            const error = new NotFoundError(resource, id)
            const response = handleDomainError(error)
            const body = await response.json()

            expect(response.status).toBe(404)
            expect(body.error.code).toBe(ErrorCode.NOT_FOUND)
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 2.3.2
     * WHEN dados de entrada são inválidos THEN the Sistema CPA SHALL retornar
     * código VALIDATION_ERROR com status 400
     */
    it('should map VALIDATION_ERROR error code to HTTP 400', () => {
      fc.assert(
        fc.property(fc.constant(ErrorCode.VALIDATION_ERROR), (code) => {
          const status = getStatusForErrorCode(code)
          expect(status).toBe(400)
          expect(errorCodeToStatus[code]).toBe(400)
        }),
        { numRuns: 100 }
      )
    })

    it('should map ValidationError to VALIDATION_ERROR code and HTTP 400', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, validationDetailsArb, async (message, details) => {
          const error = new ValidationError(message, details)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(response.status).toBe(400)
          expect(body.error.code).toBe(ErrorCode.VALIDATION_ERROR)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 2.3.3
     * WHEN usuário não está autenticado THEN the Sistema CPA SHALL retornar
     * código UNAUTHORIZED com status 401
     */
    it('should map UNAUTHORIZED error code to HTTP 401', () => {
      fc.assert(
        fc.property(fc.constant(ErrorCode.UNAUTHORIZED), (code) => {
          const status = getStatusForErrorCode(code)
          expect(status).toBe(401)
          expect(errorCodeToStatus[code]).toBe(401)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 2.3.4
     * WHEN usuário não tem permissão THEN the Sistema CPA SHALL retornar
     * código FORBIDDEN com status 403
     */
    it('should map FORBIDDEN error code to HTTP 403', () => {
      fc.assert(
        fc.property(fc.constant(ErrorCode.FORBIDDEN), (code) => {
          const status = getStatusForErrorCode(code)
          expect(status).toBe(403)
          expect(errorCodeToStatus[code]).toBe(403)
        }),
        { numRuns: 100 }
      )
    })

    it('should map ForbiddenError to FORBIDDEN code and HTTP 403', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ForbiddenError(message)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(response.status).toBe(403)
          expect(body.error.code).toBe(ErrorCode.FORBIDDEN)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 2.3.5
     * WHEN há conflito de dados THEN the Sistema CPA SHALL retornar
     * código CONFLICT com status 409
     */
    it('should map CONFLICT error code to HTTP 409', () => {
      fc.assert(
        fc.property(fc.constant(ErrorCode.CONFLICT), (code) => {
          const status = getStatusForErrorCode(code)
          expect(status).toBe(409)
          expect(errorCodeToStatus[code]).toBe(409)
        }),
        { numRuns: 100 }
      )
    })

    it('should map ConflictError to CONFLICT code and HTTP 409', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ConflictError(message)
          const response = handleDomainError(error)
          const body = await response.json()

          expect(response.status).toBe(409)
          expect(body.error.code).toBe(ErrorCode.CONFLICT)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: All error codes have a defined HTTP status mapping
     */
    it('should have a defined HTTP status for every error code', () => {
      fc.assert(
        fc.property(errorCodeArb, (code) => {
          const status = getStatusForErrorCode(code)
          expect(typeof status).toBe('number')
          expect(status).toBeGreaterThanOrEqual(400)
          expect(status).toBeLessThan(600)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: Error code to status mapping is deterministic
     */
    it('should deterministically map error codes to status codes', () => {
      fc.assert(
        fc.property(errorCodeArb, (code) => {
          const status1 = getStatusForErrorCode(code)
          const status2 = getStatusForErrorCode(code)
          expect(status1).toBe(status2)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: Status to error code mapping is consistent with error code to status
     */
    it('should have consistent bidirectional mapping for known status codes', () => {
      const knownStatusArb = fc.constantFrom(400, 401, 403, 404, 409, 500, 503)

      fc.assert(
        fc.property(knownStatusArb, (status) => {
          const code = getErrorCodeForStatus(status)
          const mappedStatus = getStatusForErrorCode(code)
          expect(mappedStatus).toBe(status)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: All domain error types map to correct error codes and status
     */
    it('should map all domain error types to correct codes and status', async () => {
      const domainErrorArb = fc.oneof(
        fc.record({
          type: fc.constant('validation' as const),
          message: nonEmptyStringArb,
          details: validationDetailsArb,
          expectedCode: fc.constant(ErrorCode.VALIDATION_ERROR),
          expectedStatus: fc.constant(400),
        }),
        fc.record({
          type: fc.constant('notFound' as const),
          resource: resourceNameArb,
          id: fc.option(idArb, { nil: undefined }),
          expectedCode: fc.constant(ErrorCode.NOT_FOUND),
          expectedStatus: fc.constant(404),
        }),
        fc.record({
          type: fc.constant('forbidden' as const),
          message: nonEmptyStringArb,
          expectedCode: fc.constant(ErrorCode.FORBIDDEN),
          expectedStatus: fc.constant(403),
        }),
        fc.record({
          type: fc.constant('conflict' as const),
          message: nonEmptyStringArb,
          expectedCode: fc.constant(ErrorCode.CONFLICT),
          expectedStatus: fc.constant(409),
        })
      )

      await fc.assert(
        fc.asyncProperty(domainErrorArb, async (spec) => {
          let error: Error

          switch (spec.type) {
            case 'validation':
              error = new ValidationError(spec.message, spec.details)
              break
            case 'notFound':
              error = new NotFoundError(spec.resource, spec.id)
              break
            case 'forbidden':
              error = new ForbiddenError(spec.message)
              break
            case 'conflict':
              error = new ConflictError(spec.message)
              break
          }

          const response = handleDomainError(error)
          const body = await response.json()

          // Verify HTTP status matches expected
          expect(response.status).toBe(spec.expectedStatus)
          // Verify error code matches expected
          expect(body.error.code).toBe(spec.expectedCode)
          // Verify error code to status mapping is consistent
          expect(getStatusForErrorCode(spec.expectedCode)).toBe(spec.expectedStatus)
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: Unknown errors default to INTERNAL_ERROR with status 500
     */
    it('should map unknown errors to INTERNAL_ERROR code and HTTP 500', async () => {
      await fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new Error(message) // Generic Error, not DomainError
          const response = handleDomainError(error)
          const body = await response.json()

          expect(response.status).toBe(500)
          expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR)
          expect(getStatusForErrorCode(ErrorCode.INTERNAL_ERROR)).toBe(500)
        }),
        { numRuns: 100 }
      )
    })
  })
})
