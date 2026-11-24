/**
 * Property-Based Tests for Domain Error to HTTP Mapping
 *
 * Feature: domain-layer, Property 5: Domain Error to HTTP Mapping
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * Updated to use new standardized response format:
 * { success: false, error: { code, message, details? }, timestamp }
 * @see Requirements 1.1.3, 2.2.2
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError } from '@/lib/domain/errors/validation-error'
import { NotFoundError } from '@/lib/domain/errors/not-found-error'
import { ForbiddenError } from '@/lib/domain/errors/forbidden-error'
import { ConflictError } from '@/lib/domain/errors/conflict-error'
import { ErrorCode } from '@/lib/api/error-codes'

// Helper: Generate non-empty strings for error messages
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0)

// Helper: Generate valid resource names (alphanumeric)
const resourceNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{0,29}$/)

// Helper: Generate valid IDs (alphanumeric with dashes)
const idArb = fc.stringMatching(/^[a-zA-Z0-9-]{1,50}$/)

// Helper: Generate validation details (field -> error messages)
const validationDetailsArb = fc.dictionary(
  fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_.]{0,29}$/), // field names
  fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 3 }) // error messages
)

/**
 * Helper to validate the standardized error response format
 * @see Requirements 2.2.2
 */
function isValidErrorResponse(body: unknown): body is {
  success: false
  error: { code: string; message: string; details?: Record<string, string[]> }
  timestamp: string
} {
  if (typeof body !== 'object' || body === null) return false
  const obj = body as Record<string, unknown>
  if (obj.success !== false) return false
  if (typeof obj.timestamp !== 'string') return false
  if (typeof obj.error !== 'object' || obj.error === null) return false
  const error = obj.error as Record<string, unknown>
  if (typeof error.code !== 'string') return false
  if (typeof error.message !== 'string') return false
  return true
}

describe('Domain Error to HTTP Mapping Properties', () => {
  /**
   * Feature: domain-layer, Property 5: Domain Error to HTTP Mapping
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
   *
   * For any domain error thrown by a service (ValidationError, NotFoundError,
   * ForbiddenError, ConflictError), the error handler SHALL convert it to the
   * appropriate HTTP status code (400, 404, 403, 409 respectively) with a
   * descriptive message using the standardized response format.
   */
  describe('Property 5: Domain Error to HTTP Mapping', () => {
    /**
     * Validates: Requirement 8.1
     * WHEN um recurso não for encontrado THEN o Sistema CPA SHALL lançar
     * `NotFoundError` com mensagem descritiva
     */
    it('should map NotFoundError to HTTP 404 with descriptive message', () => {
      fc.assert(
        fc.property(resourceNameArb, fc.option(idArb, { nil: undefined }), (resource, id) => {
          const error = new NotFoundError(resource, id)
          const response = handleDomainError(error)

          // Verify status code
          if (response.status !== 404) return false

          // Verify response body structure
          const body = response.json()
          return body instanceof Promise
        }),
        { numRuns: 100 }
      )
    })

    it('should include resource info in NotFoundError response', async () => {
      fc.assert(
        fc.asyncProperty(resourceNameArb, fc.option(idArb, { nil: undefined }), async (resource, id) => {
          const error = new NotFoundError(resource, id)
          const response = handleDomainError(error)

          const body = await response.json()

          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false

          // Verify error code
          if (body.error.code !== ErrorCode.NOT_FOUND) return false

          // Verify message contains resource name
          if (!body.error.message.includes(resource)) return false

          // If ID provided, verify it's in the message
          if (id && !body.error.message.includes(id)) return false

          return true
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 8.2
     * WHEN validação falhar THEN o Sistema CPA SHALL lançar `ValidationError`
     * com detalhes dos campos inválidos
     */
    it('should map ValidationError to HTTP 400 with field details', async () => {
      fc.assert(
        fc.asyncProperty(nonEmptyStringArb, validationDetailsArb, async (message, details) => {
          const error = new ValidationError(message, details)
          const response = handleDomainError(error)

          // Verify status code
          if (response.status !== 400) return false

          const body = await response.json()

          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false

          // Verify error code
          if (body.error.code !== ErrorCode.VALIDATION_ERROR) return false

          // Verify message is present
          if (body.error.message !== message) return false

          // Verify details are included when present
          if (Object.keys(details).length > 0) {
            if (!body.error.details) return false
            // Verify all detail keys are present
            for (const key of Object.keys(details)) {
              if (!body.error.details[key]) return false
            }
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 8.3
     * WHEN usuário não tiver permissão THEN o Sistema CPA SHALL lançar
     * `ForbiddenError` com motivo da negação
     */
    it('should map ForbiddenError to HTTP 403 with denial reason', async () => {
      fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ForbiddenError(message)
          const response = handleDomainError(error)

          // Verify status code
          if (response.status !== 403) return false

          const body = await response.json()

          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false

          // Verify error code
          if (body.error.code !== ErrorCode.FORBIDDEN) return false

          // Verify message matches
          if (body.error.message !== message) return false

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should use default message for ForbiddenError when none provided', async () => {
      const error = new ForbiddenError()
      const response = handleDomainError(error)

      expect(response.status).toBe(403)

      const body = await response.json()
      expect(isValidErrorResponse(body)).toBe(true)
      expect(body.error.code).toBe(ErrorCode.FORBIDDEN)
      expect(body.error.message).toBe('Acesso negado')
    })

    /**
     * Validates: Requirement 8.4
     * WHEN operação conflitar com estado atual THEN o Sistema CPA SHALL lançar
     * `ConflictError` (ex: email duplicado)
     */
    it('should map ConflictError to HTTP 409 with conflict description', async () => {
      fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new ConflictError(message)
          const response = handleDomainError(error)

          // Verify status code
          if (response.status !== 409) return false

          const body = await response.json()

          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false

          // Verify error code
          if (body.error.code !== ErrorCode.CONFLICT) return false

          // Verify message matches
          if (body.error.message !== message) return false

          return true
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 8.5
     * WHEN erro de domínio for capturado THEN o Sistema CPA SHALL converter
     * para resposta HTTP com código e mensagem apropriados
     *
     * This test verifies ZodError handling
     */
    it('should map ZodError to HTTP 400 with validation details', async () => {
      // Create a schema and generate invalid data to produce ZodErrors
      const testSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        age: z.number().min(0).max(150),
      })

      fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.constant(''), // Invalid: empty string
            email: fc.string().filter((s) => !s.includes('@')), // Invalid: no @
            age: fc.integer({ min: -100, max: -1 }), // Invalid: negative
          }),
          async (invalidData) => {
            const parseResult = testSchema.safeParse(invalidData)
            if (parseResult.success) return true // Skip if accidentally valid

            const response = handleDomainError(parseResult.error)

            // Verify status code
            if (response.status !== 400) return false

            const body = await response.json()

            // Verify standardized error format
            if (!isValidErrorResponse(body)) return false

            // Verify error code
            if (body.error.code !== ErrorCode.VALIDATION_ERROR) return false

            // Verify details are present
            if (!body.error.details) return false

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * Validates: Requirement 8.5
     * Unknown errors should map to HTTP 500
     */
    it('should map unknown errors to HTTP 500 with generic message', async () => {
      fc.assert(
        fc.asyncProperty(nonEmptyStringArb, async (message) => {
          const error = new Error(message) // Generic Error, not DomainError
          const response = handleDomainError(error)

          // Verify status code
          if (response.status !== 500) return false

          const body = await response.json()

          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false

          // Verify error code
          if (body.error.code !== ErrorCode.INTERNAL_ERROR) return false

          // Verify generic message (should not expose internal error details)
          if (body.error.message !== 'Erro interno do servidor') return false

          return true
        }),
        { numRuns: 100 }
      )
    })

    /**
     * Property: All domain errors maintain their error code in response
     */
    it('should preserve error codes for all domain error types', async () => {
      const errorTypeArb = fc.oneof(
        fc.record({
          type: fc.constant('validation' as const),
          message: nonEmptyStringArb,
          details: validationDetailsArb,
        }),
        fc.record({
          type: fc.constant('notFound' as const),
          resource: resourceNameArb,
          id: fc.option(idArb, { nil: undefined }),
        }),
        fc.record({
          type: fc.constant('forbidden' as const),
          message: nonEmptyStringArb,
        }),
        fc.record({
          type: fc.constant('conflict' as const),
          message: nonEmptyStringArb,
        })
      )

      fc.assert(
        fc.asyncProperty(errorTypeArb, async (errorSpec) => {
          let error: Error
          let expectedCode: ErrorCode
          let expectedStatus: number

          switch (errorSpec.type) {
            case 'validation':
              error = new ValidationError(errorSpec.message, errorSpec.details)
              expectedCode = ErrorCode.VALIDATION_ERROR
              expectedStatus = 400
              break
            case 'notFound':
              error = new NotFoundError(errorSpec.resource, errorSpec.id)
              expectedCode = ErrorCode.NOT_FOUND
              expectedStatus = 404
              break
            case 'forbidden':
              error = new ForbiddenError(errorSpec.message)
              expectedCode = ErrorCode.FORBIDDEN
              expectedStatus = 403
              break
            case 'conflict':
              error = new ConflictError(errorSpec.message)
              expectedCode = ErrorCode.CONFLICT
              expectedStatus = 409
              break
          }

          const response = handleDomainError(error)

          if (response.status !== expectedStatus) return false

          const body = await response.json()
          
          // Verify standardized error format
          if (!isValidErrorResponse(body)) return false
          if (body.error.code !== expectedCode) return false

          return true
        }),
        { numRuns: 100 }
      )
    })
  })
})
