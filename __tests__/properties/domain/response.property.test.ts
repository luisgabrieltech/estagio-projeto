/**
 * Property-Based Tests for Response Domain
 *
 * Feature: domain-layer, Property 1: Schema Validation Consistency (response)
 * Feature: domain-layer, Property 6: Repository CRUD Consistency
 * Validates: Requirements 2.3, 4.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import {
  responseItemSchema,
  createResponsesSchema,
  responseFiltersSchema,
} from '@/lib/domain/response/response.schema'
import { ResponseService } from '@/lib/domain/response/response.service'
import type { IResponseRepository, ResponseEntity, CreateResponseData } from '@/lib/domain/response/response.repository'
import type { IFormRepository, FormEntity } from '@/lib/domain/form/form.repository'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/domain/errors'
import { QuestionType, ExternalStatus, FormStatus, Category } from '@prisma/client'

const respondent = (id: string) => ({ id, role: 'USER', active: true, functionalRoles: [] })

// Helper: Generate valid UUID
const validUuidArb = fc.uuid()

// Helper: Generate valid response value (non-empty string)
const validResponseValueArb = fc.string({ minLength: 1, maxLength: 500 })

// Helper: Generate valid response item
const validResponseItemArb = fc.record({
  formId: validUuidArb,
  questionId: validUuidArb,
  value: validResponseValueArb,
})

// Helper: Generate valid responses array (at least 1 response)
const validResponsesArrayArb = fc.array(validResponseItemArb, { minLength: 1, maxLength: 10 })

// Helper: Generate valid page number
const validPageArb = fc.integer({ min: 1, max: 1000 })

// Helper: Generate valid page size (1-100)
const validPageSizeArb = fc.integer({ min: 1, max: 100 })

// Helper: Generate valid completion status
const validCompletionStatusArb = fc.constantFrom('complete', 'partial', 'all')

// Helper: Generate valid date range with constrained dates
const validDateArb = fc
  .date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  })
  .filter((d) => !isNaN(d.getTime()))

const validDateRangeArb = fc
  .tuple(validDateArb, validDateArb)
  .map(([d1, d2]) => {
    // Ensure from is before to
    const [from, to] = d1 < d2 ? [d1, d2] : [d2, d1]
    return { from, to }
  })

// Helper: Create a mock form entity
const createMockFormEntity = (
  id: string,
  questions: Array<{
    id: string
    text: string
    type: QuestionType
    required: boolean
  }>,
  externalStatus: ExternalStatus = 'AVAILABLE'
): FormEntity => ({
  id,
  title: 'Test Form',
  description: 'Test Description',
  category: 'AVALIACAO_DOCENTE' as Category,
  status: 'PUBLISHED' as FormStatus,
  externalStatus,
  deadline: null,
  estimatedTime: null,
  generatesCertificate: false,
  certificateHours: null,
  visibleToRoles: [],
  visibleToUserIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'user-123',
  questions: questions.map((q, index) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    options: [],
    required: q.required,
    order: index,
    rows: [],
    columns: [],
    conditional: null,
    customId: null,
    formId: id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
})

// Helper: Create a mock response entity
const createMockResponseEntity = (
  id: string,
  userId: string,
  formId: string,
  questionId: string,
  value: string
): ResponseEntity => ({
  id,
  userId,
  formId,
  questionId,
  value,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('Response Domain Properties', () => {
  /**
   * Feature: domain-layer, Property 1: Schema Validation Consistency (response)
   * Validates: Requirements 2.3
   *
   * For any response data that conforms to the entity's constraints
   * (required fields present, correct types, valid ranges), the corresponding
   * Zod schema SHALL accept the data; otherwise, the schema SHALL reject
   * with appropriate error messages.
   */
  describe('Property 1: Schema Validation Consistency', () => {
    describe('Response Item Schema', () => {
      it('should accept all valid response item data', () => {
        fc.assert(
          fc.property(validResponseItemArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should reject response item with empty formId', () => {
        const invalidResponseArb = fc.record({
          formId: fc.constant(''), // Empty formId
          questionId: validUuidArb,
          value: validResponseValueArb,
        })

        fc.assert(
          fc.property(invalidResponseArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject response item with empty questionId', () => {
        const invalidResponseArb = fc.record({
          formId: validUuidArb,
          questionId: fc.constant(''), // Empty questionId
          value: validResponseValueArb,
        })

        fc.assert(
          fc.property(invalidResponseArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject response item with missing formId', () => {
        const invalidResponseArb = fc.record({
          questionId: validUuidArb,
          value: validResponseValueArb,
        })

        fc.assert(
          fc.property(invalidResponseArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject response item with missing questionId', () => {
        const invalidResponseArb = fc.record({
          formId: validUuidArb,
          value: validResponseValueArb,
        })

        fc.assert(
          fc.property(invalidResponseArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject response item with missing value', () => {
        const invalidResponseArb = fc.record({
          formId: validUuidArb,
          questionId: validUuidArb,
        })

        fc.assert(
          fc.property(invalidResponseArb, (data) => {
            const result = responseItemSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })
    })

    describe('Create Responses Schema', () => {
      it('should accept valid responses array with same formId', () => {
        // Generate responses where all have the same formId
        const sameFormResponsesArb = fc.tuple(validUuidArb, fc.array(validUuidArb, { minLength: 1, maxLength: 5 }))
          .map(([formId, questionIds]) => ({
            responses: questionIds.map((questionId) => ({
              formId,
              questionId,
              value: 'Test response value',
            })),
          }))

        fc.assert(
          fc.property(sameFormResponsesArb, (data) => {
            const result = createResponsesSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should reject empty responses array', () => {
        const emptyResponsesArb = fc.constant({ responses: [] })

        fc.assert(
          fc.property(emptyResponsesArb, (data) => {
            const result = createResponsesSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 10 }
        )
      })

      it('should reject missing responses field', () => {
        const missingResponsesArb = fc.constant({})

        fc.assert(
          fc.property(missingResponsesArb, (data) => {
            const result = createResponsesSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 10 }
        )
      })

      it('should provide Portuguese error messages for validation failures', () => {
        // Test empty responses array
        const resultEmpty = createResponsesSchema.safeParse({ responses: [] })
        expect(resultEmpty.success).toBe(false)
        if (!resultEmpty.success) {
          const responsesError = resultEmpty.error.errors.find((e) => e.path.includes('responses'))
          expect(responsesError?.message).toContain('Pelo menos uma resposta')
        }

        // Test missing formId
        const resultMissingFormId = responseItemSchema.safeParse({
          questionId: 'test-id',
          value: 'test',
        })
        expect(resultMissingFormId.success).toBe(false)
        if (!resultMissingFormId.success) {
          const formIdError = resultMissingFormId.error.errors.find((e) => e.path.includes('formId'))
          expect(formIdError?.message).toContain('formulário')
        }

        // Test missing questionId
        const resultMissingQuestionId = responseItemSchema.safeParse({
          formId: 'test-id',
          value: 'test',
        })
        expect(resultMissingQuestionId.success).toBe(false)
        if (!resultMissingQuestionId.success) {
          const questionIdError = resultMissingQuestionId.error.errors.find((e) => e.path.includes('questionId'))
          expect(questionIdError?.message).toContain('questão')
        }
      })
    })

    describe('Response Filters Schema', () => {
      it('should accept all valid filter combinations', () => {
        const validFiltersArb = fc.record({
          formId: fc.option(validUuidArb, { nil: undefined }),
          userId: fc.option(validUuidArb, { nil: undefined }),
          questionId: fc.option(validUuidArb, { nil: undefined }),
          campus: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
          course: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
          userRole: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
          completionStatus: fc.option(validCompletionStatusArb, { nil: undefined }),
          searchTerm: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          page: fc.option(validPageArb, { nil: undefined }),
          pageSize: fc.option(validPageSizeArb, { nil: undefined }),
        })

        fc.assert(
          fc.property(validFiltersArb, (data) => {
            const result = responseFiltersSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should accept empty object for filters (all fields optional)', () => {
        const result = responseFiltersSchema.safeParse({})
        expect(result.success).toBe(true)
      })

      it('should reject pageSize greater than 100', () => {
        const invalidFiltersArb = fc.record({
          page: fc.option(validPageArb, { nil: undefined }),
          pageSize: fc.integer({ min: 101, max: 500 }), // Invalid: > 100
        })

        fc.assert(
          fc.property(invalidFiltersArb, (data) => {
            const result = responseFiltersSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject page less than 1', () => {
        const invalidFiltersArb = fc.record({
          page: fc.integer({ min: -100, max: 0 }), // Invalid: < 1
          pageSize: fc.option(validPageSizeArb, { nil: undefined }),
        })

        fc.assert(
          fc.property(invalidFiltersArb, (data) => {
            const result = responseFiltersSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject pageSize less than 1', () => {
        const invalidFiltersArb = fc.record({
          page: fc.option(validPageArb, { nil: undefined }),
          pageSize: fc.integer({ min: -100, max: 0 }), // Invalid: < 1
        })

        fc.assert(
          fc.property(invalidFiltersArb, (data) => {
            const result = responseFiltersSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should apply default values for page and pageSize', () => {
        const result = responseFiltersSchema.safeParse({})
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.page).toBe(1)
          expect(result.data.pageSize).toBe(10)
        }
      })

      it('should accept valid date range filter', () => {
        fc.assert(
          fc.property(validDateRangeArb, (dateRange) => {
            const result = responseFiltersSchema.safeParse({
              responseDate: dateRange,
            })
            return result.success === true
          }),
          { numRuns: 50 }
        )
      })

      it('should reject invalid completion status', () => {
        const invalidFiltersArb = fc.record({
          completionStatus: fc.string().filter((s) => !['complete', 'partial', 'all'].includes(s)),
        })

        fc.assert(
          fc.property(invalidFiltersArb, (data) => {
            const result = responseFiltersSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })
    })
  })

  /**
   * Feature: domain-layer, Property 6: Repository CRUD Consistency
   * Validates: Requirements 4.3
   *
   * For any entity created through a repository, immediately querying by the
   * returned ID SHALL return the same entity data. Similarly, after an update,
   * querying SHALL return the updated data.
   */
  describe('Property 6: Repository CRUD Consistency', () => {
    let responseService: ResponseService
    let mockResponseRepository: IResponseRepository
    let mockFormRepository: IFormRepository

    beforeEach(() => {
      mockResponseRepository = {
        findById: vi.fn(),
        findByUserFormQuestion: vi.fn(),
        findByUser: vi.fn(),
        findByForm: vi.fn(),
        findByUserAndForm: vi.fn(),
        findManyWithDetails: vi.fn(),
        saveMany: vi.fn(),
        hasUserRespondedToForm: vi.fn(),
        count: vi.fn(),
        countUniqueUsersByForm: vi.fn(),
        getRespondedFormIds: vi.fn(),
      }

      mockFormRepository = {
        findById: vi.fn(),
        findWithQuestionResponses: vi.fn(),
        findMany: vi.fn(),
        findByStatus: vi.fn(),
        findByExternalStatus: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateWithQuestions: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        hasResponses: vi.fn(),
        getQuestionIdsWithResponses: vi.fn(),
        findAllWithStats: vi.fn(),
      }

      responseService = new ResponseService(mockResponseRepository, mockFormRepository)
    })

    it('recusa gravação de uma resposta fora do público da avaliação', async () => {
      vi.mocked(mockFormRepository.findById).mockResolvedValue({
        ...createMockFormEntity('form-1', []),
        visibleToRoles: ['DOCENTE'],
      })
      await expect(responseService.saveResponses(respondent('user-1'), {
        responses: [{ formId: 'form-1', questionId: 'question-1', value: 'Resposta' }],
      })).rejects.toThrow(ForbiddenError)
      expect(mockResponseRepository.saveMany).not.toHaveBeenCalled()
    })

    const conditionalForm = () => {
      const form = createMockFormEntity('conditional-form', [
        { id: 'choice', text: 'Pergunta inicial', type: QuestionType.DROPDOWN, required: true },
        { id: 'details', text: 'Detalhes', type: QuestionType.TEXT, required: true },
      ])
      form.questions[0].customId = 'initial-choice'
      form.questions[1].conditional = {
        dependsOn: 'initial-choice',
        operator: 'AND',
        conditions: [{ type: 'equals', value: 'Sim' }],
      }
      return form
    }

    it('permite omitir pergunta obrigatória quando sua condição é falsa', async () => {
      vi.mocked(mockFormRepository.findById).mockResolvedValue(conditionalForm())
      const response = { formId: 'conditional-form', questionId: 'choice', value: 'Não' }

      await responseService.saveResponses(respondent('user-1'), { responses: [response] })

      expect(mockResponseRepository.saveMany).toHaveBeenCalledWith([{ ...response, userId: 'user-1' }])
    })

    it('descarta uma resposta que ficou oculta antes do envio', async () => {
      vi.mocked(mockFormRepository.findById).mockResolvedValue(conditionalForm())
      const response = { formId: 'conditional-form', questionId: 'choice', value: 'Não' }
      const hidden = { ...response, questionId: 'details', value: 'Resposta anterior' }

      await responseService.saveResponses(respondent('user-1'), { responses: [response, hidden] })

      expect(mockResponseRepository.saveMany).toHaveBeenCalledWith([{ ...response, userId: 'user-1' }])
    })

    it('exige a pergunta dependente quando sua condição é verdadeira', async () => {
      vi.mocked(mockFormRepository.findById).mockResolvedValue(conditionalForm())

      await expect(responseService.saveResponses(respondent('user-1'), {
        responses: [{ formId: 'conditional-form', questionId: 'choice', value: 'Sim' }],
      })).rejects.toThrow(ValidationError)
      expect(mockResponseRepository.saveMany).not.toHaveBeenCalled()
    })

    it('should return saved responses after saveMany operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          fc.array(validUuidArb, { minLength: 1, maxLength: 5 }), // questionIds
          async (userId, formId, questionIds) => {
            // Create mock form with questions
            const mockForm = createMockFormEntity(
              formId,
              questionIds.map((qId) => ({
                id: qId,
                text: 'Test Question',
                type: QuestionType.TEXT,
                required: false,
              })),
              'AVAILABLE'
            )

            // Setup mocks
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)
            vi.mocked(mockResponseRepository.hasUserRespondedToForm).mockResolvedValue(false)

            // Create expected saved responses
            const savedResponses = questionIds.map((qId, index) =>
              createMockResponseEntity(`response-${index}`, userId, formId, qId, 'Test value')
            )
            vi.mocked(mockResponseRepository.saveMany).mockResolvedValue(savedResponses)

            // Save responses
            const responses = questionIds.map((questionId) => ({
              formId,
              questionId,
              value: 'Test value',
            }))

            const result = await responseService.saveResponses(respondent(userId), { responses })

            // Verify all responses were returned
            return (
              result.length === questionIds.length &&
              result.every((r) => r.formId === formId && r.userId === userId)
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw NotFoundError when form does not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          validUuidArb, // questionId
          async (userId, formId, questionId) => {
            // Setup mock to return null (form not found)
            vi.mocked(mockFormRepository.findById).mockResolvedValue(null)

            try {
              await responseService.saveResponses(respondent(userId), {
                responses: [{ formId, questionId, value: 'Test' }],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof NotFoundError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw ForbiddenError when form is not available', async () => {
      // Use statuses that are NOT 'AVAILABLE' - these should prevent responses
      const unavailableStatusArb = fc.constantFrom(
        ExternalStatus.HIDDEN,
        ExternalStatus.FROZEN,
        ExternalStatus.SCHEDULED
      )

      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          validUuidArb, // questionId
          unavailableStatusArb,
          async (userId, formId, questionId, externalStatus) => {
            // Create mock form with unavailable status
            const mockForm = createMockFormEntity(
              formId,
              [{ id: questionId, text: 'Test', type: QuestionType.TEXT, required: false }],
              externalStatus
            )

            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

            try {
              await responseService.saveResponses(respondent(userId), {
                responses: [{ formId, questionId, value: 'Test' }],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof ForbiddenError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw ConflictError when user has already responded', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          validUuidArb, // questionId
          async (userId, formId, questionId) => {
            // Create mock form
            const mockForm = createMockFormEntity(
              formId,
              [{ id: questionId, text: 'Test', type: QuestionType.TEXT, required: false }],
              'AVAILABLE'
            )

            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)
            vi.mocked(mockResponseRepository.hasUserRespondedToForm).mockResolvedValue(true) // Already responded

            try {
              await responseService.saveResponses(respondent(userId), {
                responses: [{ formId, questionId, value: 'Test' }],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof ConflictError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw ValidationError when required questions are not answered', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          validUuidArb, // requiredQuestionId
          validUuidArb, // answeredQuestionId
          async (userId, formId, requiredQuestionId, answeredQuestionId) => {
            // Skip if IDs are the same
            if (requiredQuestionId === answeredQuestionId) return true

            // Create mock form with required question
            const mockForm = createMockFormEntity(
              formId,
              [
                { id: requiredQuestionId, text: 'Required Question', type: QuestionType.TEXT, required: true },
                { id: answeredQuestionId, text: 'Optional Question', type: QuestionType.TEXT, required: false },
              ],
              'AVAILABLE'
            )

            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)
            vi.mocked(mockResponseRepository.hasUserRespondedToForm).mockResolvedValue(false)

            try {
              // Only answer the optional question, not the required one
              await responseService.saveResponses(respondent(userId), {
                responses: [{ formId, questionId: answeredQuestionId, value: 'Test' }],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof ValidationError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw ValidationError when responses are for different forms', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId1
          validUuidArb, // formId2
          validUuidArb, // questionId1
          validUuidArb, // questionId2
          async (userId, formId1, formId2, questionId1, questionId2) => {
            // Skip if form IDs are the same
            if (formId1 === formId2) return true

            try {
              await responseService.saveResponses(respondent(userId), {
                responses: [
                  { formId: formId1, questionId: questionId1, value: 'Test 1' },
                  { formId: formId2, questionId: questionId2, value: 'Test 2' },
                ],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof ValidationError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw ValidationError when question does not belong to form', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          validUuidArb, // validQuestionId
          validUuidArb, // invalidQuestionId
          async (userId, formId, validQuestionId, invalidQuestionId) => {
            // Skip if question IDs are the same
            if (validQuestionId === invalidQuestionId) return true

            // Create mock form with only one question
            const mockForm = createMockFormEntity(
              formId,
              [{ id: validQuestionId, text: 'Valid Question', type: QuestionType.TEXT, required: false }],
              'AVAILABLE'
            )

            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)
            vi.mocked(mockResponseRepository.hasUserRespondedToForm).mockResolvedValue(false)

            try {
              // Try to answer a question that doesn't belong to the form
              await responseService.saveResponses(respondent(userId), {
                responses: [{ formId, questionId: invalidQuestionId, value: 'Test' }],
              })
              return false // Should have thrown
            } catch (error) {
              return error instanceof ValidationError
            }
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should successfully save responses when all validations pass', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          validUuidArb, // formId
          fc.array(validUuidArb, { minLength: 1, maxLength: 3 }), // questionIds
          fc.array(validResponseValueArb, { minLength: 1, maxLength: 3 }), // values
          async (userId, formId, questionIds, values) => {
            // Ensure we have matching lengths
            const minLength = Math.min(questionIds.length, values.length)
            const trimmedQuestionIds = questionIds.slice(0, minLength)
            const trimmedValues = values.slice(0, minLength)

            // Create mock form with all questions as optional
            const mockForm = createMockFormEntity(
              formId,
              trimmedQuestionIds.map((qId) => ({
                id: qId,
                text: 'Test Question',
                type: QuestionType.TEXT,
                required: false,
              })),
              'AVAILABLE'
            )

            // Setup mocks
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)
            vi.mocked(mockResponseRepository.hasUserRespondedToForm).mockResolvedValue(false)

            const savedResponses = trimmedQuestionIds.map((qId, index) =>
              createMockResponseEntity(`response-${index}`, userId, formId, qId, trimmedValues[index])
            )
            vi.mocked(mockResponseRepository.saveMany).mockResolvedValue(savedResponses)

            // Create responses
            const responses = trimmedQuestionIds.map((questionId, index) => ({
              formId,
              questionId,
              value: trimmedValues[index],
            }))

            const result = await responseService.saveResponses(respondent(userId), { responses })

            // Verify responses were saved correctly
            return (
              result.length === trimmedQuestionIds.length &&
              result.every((r, i) => 
                r.formId === formId &&
                r.userId === userId &&
                r.questionId === trimmedQuestionIds[i] &&
                r.value === trimmedValues[i]
              )
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should return responses when querying by user', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // userId
          fc.array(
            fc.record({
              formId: validUuidArb,
              questionId: validUuidArb,
              value: validResponseValueArb,
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (userId, responseData) => {
            // Create mock responses
            const mockResponses = responseData.map((r, index) =>
              createMockResponseEntity(`response-${index}`, userId, r.formId, r.questionId, r.value)
            )

            vi.mocked(mockResponseRepository.findByUser).mockResolvedValue(mockResponses)

            const result = await responseService.getResponsesByUser(userId)

            // Verify all responses belong to the user
            return (
              result.length === mockResponses.length &&
              result.every((r) => r.userId === userId)
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should return responses when querying by form', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // formId
          fc.array(
            fc.record({
              userId: validUuidArb,
              questionId: validUuidArb,
              value: validResponseValueArb,
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (formId, responseData) => {
            // Create mock form
            const mockForm = createMockFormEntity(formId, [], 'AVAILABLE')
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

            // Create mock responses
            const mockResponses = responseData.map((r, index) =>
              createMockResponseEntity(`response-${index}`, r.userId, formId, r.questionId, r.value)
            )

            vi.mocked(mockResponseRepository.findByForm).mockResolvedValue(mockResponses)

            const result = await responseService.getResponsesByForm(formId)

            // Verify all responses belong to the form
            return (
              result.length === mockResponses.length &&
              result.every((r) => r.formId === formId)
            )
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should throw NotFoundError when querying responses for non-existent form', async () => {
      await fc.assert(
        fc.asyncProperty(validUuidArb, async (formId) => {
          vi.mocked(mockFormRepository.findById).mockResolvedValue(null)

          try {
            await responseService.getResponsesByForm(formId)
            return false // Should have thrown
          } catch (error) {
            return error instanceof NotFoundError
          }
        }),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Feature: project-evolution-roadmap, Property 6: Response Filtering Consistency
   * Validates: Requirements 1.4.1
   *
   * For any form ID, querying responses for that form SHALL return only
   * responses belonging to that specific form.
   */
  describe('Property 6: Response Filtering Consistency', () => {
    let responseService: ResponseService
    let mockResponseRepository: IResponseRepository
    let mockFormRepository: IFormRepository

    beforeEach(() => {
      mockResponseRepository = {
        findById: vi.fn(),
        findByUserFormQuestion: vi.fn(),
        findByUser: vi.fn(),
        findByForm: vi.fn(),
        findByUserAndForm: vi.fn(),
        findManyWithDetails: vi.fn(),
        saveMany: vi.fn(),
        hasUserRespondedToForm: vi.fn(),
        count: vi.fn(),
        countUniqueUsersByForm: vi.fn(),
        getRespondedFormIds: vi.fn(),
      }

      mockFormRepository = {
        findById: vi.fn(),
        findWithQuestionResponses: vi.fn(),
        findMany: vi.fn(),
        findByStatus: vi.fn(),
        findByExternalStatus: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateWithQuestions: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        hasResponses: vi.fn(),
        getQuestionIdsWithResponses: vi.fn(),
        findAllWithStats: vi.fn(),
      }

      responseService = new ResponseService(mockResponseRepository, mockFormRepository)
    })

    it('should return only responses belonging to the queried form', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // targetFormId - the form we're querying
          validUuidArb, // otherFormId - a different form
          fc.array(validUuidArb, { minLength: 1, maxLength: 5 }), // userIds
          fc.array(validUuidArb, { minLength: 1, maxLength: 5 }), // questionIds
          async (targetFormId, otherFormId, userIds, questionIds) => {
            // Skip if form IDs are the same
            if (targetFormId === otherFormId) return true

            // Create mock form
            const mockForm = createMockFormEntity(targetFormId, [], 'AVAILABLE')
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

            // Create mock responses - all should belong to targetFormId
            const mockResponses = userIds.flatMap((userId, userIndex) =>
              questionIds.map((questionId, qIndex) =>
                createMockResponseEntity(
                  `response-${userIndex}-${qIndex}`,
                  userId,
                  targetFormId, // All responses belong to target form
                  questionId,
                  `Value ${userIndex}-${qIndex}`
                )
              )
            )

            vi.mocked(mockResponseRepository.findByForm).mockResolvedValue(mockResponses)

            const result = await responseService.getResponsesByForm(targetFormId)

            // Property: ALL returned responses must belong to the queried form
            return result.every((response) => response.formId === targetFormId)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array when form has no responses', async () => {
      await fc.assert(
        fc.asyncProperty(validUuidArb, async (formId) => {
          // Create mock form
          const mockForm = createMockFormEntity(formId, [], 'AVAILABLE')
          vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

          // No responses for this form
          vi.mocked(mockResponseRepository.findByForm).mockResolvedValue([])

          const result = await responseService.getResponsesByForm(formId)

          // Property: Empty result is valid and should not contain any responses
          return result.length === 0
        }),
        { numRuns: 100 }
      )
    })

    it('should filter responses by formId in getResponsesWithDetails', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // targetFormId
          validPageArb, // page
          validPageSizeArb, // pageSize
          fc.array(validUuidArb, { minLength: 1, maxLength: 5 }), // userIds
          async (targetFormId, page, pageSize, userIds) => {
            // Create mock paginated response with details
            const mockResponsesWithDetails = userIds.map((userId, index) => ({
              id: `response-${index}`,
              value: `Test value ${index}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              user: {
                id: userId,
                name: `User ${index}`,
                email: `user${index}@test.com`,
                functionalRoles: [] as string[],
              },
              form: {
                id: targetFormId, // All responses belong to target form
                title: 'Test Form',
                category: 'AVALIACAO_DOCENTE' as const,
              },
              question: {
                id: `question-${index}`,
                text: `Question ${index}`,
                type: QuestionType.TEXT,
                required: false,
              },
            }))

            vi.mocked(mockResponseRepository.findManyWithDetails).mockResolvedValue({
              data: mockResponsesWithDetails,
              pagination: {
                page,
                pageSize,
                total: mockResponsesWithDetails.length,
                totalPages: Math.ceil(mockResponsesWithDetails.length / pageSize),
              },
            })

            const result = await responseService.getResponsesWithDetails({
              formId: targetFormId,
              page,
              pageSize,
            })

            // Property: ALL returned responses must belong to the queried form
            return result.data.every((response) => response.form.id === targetFormId)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should pass formId filter to repository correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // formId
          validPageArb, // page
          validPageSizeArb, // pageSize
          async (formId, page, pageSize) => {
            // Clear mock before each iteration
            vi.mocked(mockResponseRepository.findManyWithDetails).mockClear()
            vi.mocked(mockResponseRepository.findManyWithDetails).mockResolvedValue({
              data: [],
              pagination: { page, pageSize, total: 0, totalPages: 0 },
            })

            await responseService.getResponsesWithDetails({
              formId,
              page,
              pageSize,
            })

            // Get the last call arguments
            const calls = vi.mocked(mockResponseRepository.findManyWithDetails).mock.calls
            const callArgs = calls[calls.length - 1][0]
            
            // The formId should be passed through to the repository
            return callArgs.formId === formId
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not return responses from other forms when filtering by formId', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // targetFormId
          validUuidArb, // otherFormId
          async (targetFormId, otherFormId) => {
            // Skip if form IDs are the same
            if (targetFormId === otherFormId) return true

            // Create mock form
            const mockForm = createMockFormEntity(targetFormId, [], 'AVAILABLE')
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

            // Repository returns only responses for the target form (simulating correct filtering)
            const mockResponses = [
              createMockResponseEntity('response-1', 'user-1', targetFormId, 'q-1', 'Value 1'),
              createMockResponseEntity('response-2', 'user-2', targetFormId, 'q-2', 'Value 2'),
            ]
            vi.mocked(mockResponseRepository.findByForm).mockResolvedValue(mockResponses)

            const result = await responseService.getResponsesByForm(targetFormId)

            // Property: No response should belong to the other form
            return result.every((response) => response.formId !== otherFormId)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain response count consistency when filtering by form', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUuidArb, // formId
          fc.integer({ min: 0, max: 50 }), // expectedCount
          async (formId, expectedCount) => {
            // Create mock form
            const mockForm = createMockFormEntity(formId, [], 'AVAILABLE')
            vi.mocked(mockFormRepository.findById).mockResolvedValue(mockForm)

            // Create exactly expectedCount responses
            const mockResponses = Array.from({ length: expectedCount }, (_, index) =>
              createMockResponseEntity(
                `response-${index}`,
                `user-${index}`,
                formId,
                `question-${index}`,
                `Value ${index}`
              )
            )
            vi.mocked(mockResponseRepository.findByForm).mockResolvedValue(mockResponses)

            const result = await responseService.getResponsesByForm(formId)

            // Property: Returned count should match the number of responses for that form
            return result.length === expectedCount
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
