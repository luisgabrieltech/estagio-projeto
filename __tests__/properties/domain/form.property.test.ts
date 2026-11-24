/**
 * Property-Based Tests for Form Domain
 *
 * Feature: domain-layer, Property 1: Schema Validation Consistency (form)
 * Feature: domain-layer, Property 3: Form Question Preservation
 * Validates: Requirements 2.2, 5.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { Category, FormStatus, ExternalStatus, QuestionType } from '@prisma/client'
import {
  createFormSchema,
  updateFormSchema,
  formFiltersSchema,
} from '@/lib/domain/form/form.schema'
import {
  questionDataSchema,
  createQuestionSchema,
  validateQuestionOptions,
} from '@/lib/domain/form/question.schema'
import { FormService } from '@/lib/domain/form/form.service'
import type { IFormRepository, FormEntity, FormWithQuestionResponses } from '@/lib/domain/form/form.repository'
import { ConflictError } from '@/lib/domain/errors'

// Helper: Generate valid non-whitespace strings
const nonEmptyStringArb = (minLength: number, maxLength: number) =>
  fc.string({ minLength, maxLength }).filter((s) => s.trim().length >= minLength)

// Helper: Generate valid title (3-200 chars)
const validTitleArb = fc
  .string({ minLength: 3, maxLength: 200 })
  .filter((s) => s.trim().length >= 3)
  .map((s) => s.trim())

// Helper: Generate valid description (10-2000 chars)
const validDescriptionArb = fc
  .string({ minLength: 10, maxLength: 500 })
  .filter((s) => s.trim().length >= 10)
  .map((s) => s.trim())

// Helper: Generate valid category
const validCategoryArb = fc.constantFrom(...Object.values(Category))

// Helper: Generate valid form status
const validFormStatusArb = fc.constantFrom(...Object.values(FormStatus))

// Helper: Generate valid external status
const validExternalStatusArb = fc.constantFrom(...Object.values(ExternalStatus))

// Helper: Generate valid dates that can be converted to ISO string
const validDateArb = fc
  .date({
    min: new Date('2000-01-01'),
    max: new Date('2100-12-31'),
  })
  .filter((d) => !isNaN(d.getTime()))

// Helper: Generate valid question type
const validQuestionTypeArb = fc.constantFrom(...Object.values(QuestionType))

// Helper: Generate valid question text (1-1000 chars)
const validQuestionTextArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length >= 1)

// Helper: Generate valid options array (for multiple choice, checkbox, dropdown)
const validOptionsArb = fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 10 })

// Helper: Generate valid rows/columns for grid questions
const validRowsColumnsArb = fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 })

// Helper: Generate a valid question based on type
const validQuestionArb = fc.record({
  text: validQuestionTextArb,
  type: validQuestionTypeArb,
  required: fc.boolean(),
  order: fc.integer({ min: 0, max: 100 }),
  options: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  rows: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  columns: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  customId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  conditional: fc.constant(null),
}).filter((q) => {
  // Ensure questions that require options have them
  const typesRequiringOptions: QuestionType[] = ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN']
  if (typesRequiringOptions.includes(q.type) && q.options.length < 2) {
    return false
  }
  if (q.type === 'GRID' && (q.rows.length < 1 || q.columns.length < 1)) {
    return false
  }
  return true
})

describe('Form Domain Properties', () => {
  /**
   * Feature: domain-layer, Property 1: Schema Validation Consistency (form)
   * Validates: Requirements 2.2
   *
   * For any form data that conforms to the entity's constraints
   * (required fields present, correct types, valid ranges), the corresponding
   * Zod schema SHALL accept the data; otherwise, the schema SHALL reject
   * with appropriate error messages.
   */
  describe('Property 1: Schema Validation Consistency', () => {
    describe('Form Schema', () => {
      it('should accept all valid form creation data', () => {
        const validFormArb = fc.record({
          title: validTitleArb,
          description: validDescriptionArb,
          category: validCategoryArb,
          createdById: fc.uuid(),
          deadline: fc.option(validDateArb, { nil: undefined }),
          estimatedTime: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          generatesCertificate: fc.boolean(),
          certificateHours: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          visibleToRoles: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
          visibleToUserIds: fc.array(fc.uuid(), { maxLength: 5 }),
          questions: fc.array(validQuestionArb, { maxLength: 5 }),
        })

        fc.assert(
          fc.property(validFormArb, (data) => {
            const result = createFormSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should reject form creation data with title shorter than 3 characters', () => {
        const invalidFormArb = fc.record({
          title: fc.string({ maxLength: 2 }), // Too short
          description: validDescriptionArb,
          category: validCategoryArb,
          createdById: fc.uuid(),
        })

        fc.assert(
          fc.property(invalidFormArb, (data) => {
            const result = createFormSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject form creation data with title longer than 200 characters', () => {
        const invalidFormArb = fc.record({
          title: fc.string({ minLength: 201, maxLength: 300 }), // Too long
          description: validDescriptionArb,
          category: validCategoryArb,
          createdById: fc.uuid(),
        })

        fc.assert(
          fc.property(invalidFormArb, (data) => {
            const result = createFormSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject form creation data with description shorter than 10 characters', () => {
        const invalidFormArb = fc.record({
          title: validTitleArb,
          description: fc.string({ maxLength: 9 }), // Too short
          category: validCategoryArb,
          createdById: fc.uuid(),
        })

        fc.assert(
          fc.property(invalidFormArb, (data) => {
            const result = createFormSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject form creation data with missing createdById', () => {
        const invalidFormArb = fc.record({
          title: validTitleArb,
          description: validDescriptionArb,
          category: validCategoryArb,
          // Missing createdById
        })

        fc.assert(
          fc.property(invalidFormArb, (data) => {
            const result = createFormSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should accept all valid form update data (partial fields)', () => {
        const validUpdateArb = fc.record({
          title: fc.option(validTitleArb, { nil: undefined }),
          description: fc.option(validDescriptionArb, { nil: undefined }),
          category: fc.option(validCategoryArb, { nil: undefined }),
          status: fc.option(validFormStatusArb, { nil: undefined }),
          externalStatus: fc.option(validExternalStatusArb, { nil: undefined }),
          deadline: fc.option(validDateArb, { nil: undefined }),
          estimatedTime: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
          certificateHours: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        })

        fc.assert(
          fc.property(validUpdateArb, (data) => {
            const result = updateFormSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should accept empty object for form update (all fields optional)', () => {
        const result = updateFormSchema.safeParse({})
        expect(result.success).toBe(true)
      })

      it('should accept all valid form filter data', () => {
        const validFiltersArb = fc.record({
          search: fc.option(fc.string(), { nil: undefined }),
          status: fc.option(validFormStatusArb, { nil: undefined }),
          externalStatus: fc.option(validExternalStatusArb, { nil: undefined }),
          category: fc.option(validCategoryArb, { nil: undefined }),
          generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
          createdById: fc.option(fc.uuid(), { nil: undefined }),
          dateFrom: fc.option(validDateArb, { nil: undefined }),
          dateTo: fc.option(validDateArb, { nil: undefined }),
          page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
          pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
        })

        fc.assert(
          fc.property(validFiltersArb, (data) => {
            const result = formFiltersSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should reject form filter data with pageSize greater than 100', () => {
        const invalidFiltersArb = fc.record({
          page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
          pageSize: fc.integer({ min: 101, max: 500 }), // Invalid: > 100
        })

        fc.assert(
          fc.property(invalidFiltersArb, (data) => {
            const result = formFiltersSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should provide Portuguese error messages for validation failures', () => {
        // Test missing required fields
        const resultMissingTitle = createFormSchema.safeParse({
          description: 'Valid description here',
          category: 'AVALIACAO_DOCENTE',
          createdById: 'user-123',
        })
        expect(resultMissingTitle.success).toBe(false)
        if (!resultMissingTitle.success) {
          const titleError = resultMissingTitle.error.errors.find((e) => e.path.includes('title'))
          expect(titleError?.message).toContain('Título')
        }

        // Test short title
        const resultShortTitle = createFormSchema.safeParse({
          title: 'AB',
          description: 'Valid description here',
          category: 'AVALIACAO_DOCENTE',
          createdById: 'user-123',
        })
        expect(resultShortTitle.success).toBe(false)
        if (!resultShortTitle.success) {
          const titleError = resultShortTitle.error.errors.find((e) => e.path.includes('title'))
          expect(titleError?.message).toContain('Título')
        }

        // Test short description
        const resultShortDesc = createFormSchema.safeParse({
          title: 'Valid Title',
          description: 'Short',
          category: 'AVALIACAO_DOCENTE',
          createdById: 'user-123',
        })
        expect(resultShortDesc.success).toBe(false)
        if (!resultShortDesc.success) {
          const descError = resultShortDesc.error.errors.find((e) => e.path.includes('description'))
          expect(descError?.message).toContain('Descrição')
        }
      })
    })

    describe('Question Schema', () => {
      it('should accept all valid question data', () => {
        fc.assert(
          fc.property(validQuestionArb, (data) => {
            const result = questionDataSchema.safeParse(data)
            return result.success === true
          }),
          { numRuns: 100 }
        )
      })

      it('should reject question data with empty text', () => {
        const invalidQuestionArb = fc.record({
          text: fc.constant(''), // Empty text
          type: validQuestionTypeArb,
          required: fc.boolean(),
          order: fc.integer({ min: 0, max: 100 }),
          options: fc.constant([]),
          rows: fc.constant([]),
          columns: fc.constant([]),
        })

        fc.assert(
          fc.property(invalidQuestionArb, (data) => {
            const result = questionDataSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should reject question data with negative order', () => {
        const invalidQuestionArb = fc.record({
          text: validQuestionTextArb,
          type: fc.constantFrom(QuestionType.TEXT, QuestionType.SCALE),
          required: fc.boolean(),
          order: fc.integer({ min: -100, max: -1 }), // Negative order
          options: fc.constant([]),
          rows: fc.constant([]),
          columns: fc.constant([]),
        })

        fc.assert(
          fc.property(invalidQuestionArb, (data) => {
            const result = questionDataSchema.safeParse(data)
            return result.success === false
          }),
          { numRuns: 100 }
        )
      })

      it('should validate question options based on type using validateQuestionOptions', () => {
        // Multiple choice without enough options should fail
        const multipleChoiceNoOptions = {
          text: 'Test question',
          type: QuestionType.MULTIPLE_CHOICE,
          required: false,
          order: 0,
          options: ['Only one'],
          rows: [],
          columns: [],
        }
        expect(validateQuestionOptions(multipleChoiceNoOptions)).toBe(false)

        // Multiple choice with enough options should pass
        const multipleChoiceWithOptions = {
          text: 'Test question',
          type: QuestionType.MULTIPLE_CHOICE,
          required: false,
          order: 0,
          options: ['Option 1', 'Option 2'],
          rows: [],
          columns: [],
        }
        expect(validateQuestionOptions(multipleChoiceWithOptions)).toBe(true)

        // Grid without rows/columns should fail
        const gridNoRowsCols = {
          text: 'Test question',
          type: QuestionType.GRID,
          required: false,
          order: 0,
          options: [],
          rows: [],
          columns: [],
        }
        expect(validateQuestionOptions(gridNoRowsCols)).toBe(false)

        // Grid with rows and columns should pass
        const gridWithRowsCols = {
          text: 'Test question',
          type: QuestionType.GRID,
          required: false,
          order: 0,
          options: [],
          rows: ['Row 1'],
          columns: ['Col 1'],
        }
        expect(validateQuestionOptions(gridWithRowsCols)).toBe(true)
      })
    })
  })


  /**
   * Feature: domain-layer, Property 3: Form Question Preservation
   * Validates: Requirements 5.3
   *
   * For any form update operation, questions that have associated responses
   * SHALL remain unchanged in their structural properties (type, options, required),
   * while questions without responses MAY be fully modified or deleted.
   */
  describe('Property 3: Form Question Preservation', () => {
    let formService: FormService
    let mockRepository: IFormRepository

    // Helper to create a mock form entity
    const createMockFormEntity = (
      id: string,
      questions: Array<{
        id: string
        text: string
        type: QuestionType
        options: string[]
        required: boolean
        order: number
        responseCount: number
      }>
    ): FormWithQuestionResponses => ({
      id,
      title: 'Test Form',
      description: 'Test Description',
      category: 'AVALIACAO_DOCENTE' as Category,
      status: 'DRAFT' as FormStatus,
      externalStatus: 'INTERNO' as ExternalStatus,
      deadline: null,
      estimatedTime: null,
      generatesCertificate: false,
      certificateHours: null,
      visibleToRoles: [],
      visibleToUserIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'user-123',
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        required: q.required,
        order: q.order,
        rows: [],
        columns: [],
        conditional: null,
        formId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { responses: q.responseCount },
      })),
    })

    beforeEach(() => {
      mockRepository = {
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
      formService = new FormService(mockRepository)
    })

    it('should throw ConflictError when trying to delete a question with responses', async () => {
      // Generate arbitrary question data
      const questionArb = fc.record({
        id: fc.uuid(),
        text: validQuestionTextArb,
        type: fc.constantFrom('TEXT', 'TEXTAREA', 'MULTIPLE_CHOICE') as fc.Arbitrary<QuestionType>,
        options: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
        required: fc.boolean(),
        order: fc.integer({ min: 0, max: 10 }),
        responseCount: fc.integer({ min: 1, max: 100 }), // Has responses
      })

      await fc.assert(
        fc.asyncProperty(fc.uuid(), questionArb, async (formId, question) => {
          // Setup mock to return form with question that has responses
          const mockForm = createMockFormEntity(formId, [question])
          vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)

          // Try to update form without the question (deletion attempt)
          try {
            await formService.updateForm(formId, {
              questions: [], // Empty array = trying to delete all questions
            })
            return false // Should have thrown
          } catch (error) {
            return error instanceof ConflictError
          }
        }),
        { numRuns: 50 }
      )
    })

    it('should throw ConflictError when trying to change type of question with responses', async () => {
      // Generate pairs of different question types using actual enum values
      const questionTypeArb = fc.constantFrom(
        QuestionType.TEXT,
        QuestionType.SCALE,
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.CHECKBOX
      )
      const differentTypePairArb = fc
        .tuple(questionTypeArb, questionTypeArb)
        .filter(([t1, t2]) => t1 !== t2)

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          validQuestionTextArb,
          differentTypePairArb,
          async (formId, questionId, questionText, [originalType, newType]) => {
            // Setup mock to return form with question that has responses
            const mockForm = createMockFormEntity(formId, [
              {
                id: questionId,
                text: questionText,
                type: originalType,
                options: originalType === QuestionType.MULTIPLE_CHOICE || originalType === QuestionType.CHECKBOX 
                  ? ['Option 1', 'Option 2'] 
                  : [],
                required: false,
                order: 0,
                responseCount: 5, // Has responses
              },
            ])
            vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)

            // Try to update question type
            try {
              await formService.updateForm(formId, {
                questions: [
                  {
                    id: questionId,
                    text: questionText,
                    type: newType, // Different type
                    required: false,
                    order: 0,
                    options: newType === QuestionType.MULTIPLE_CHOICE || newType === QuestionType.CHECKBOX
                      ? ['Option 1', 'Option 2']
                      : [],
                    rows: [],
                    columns: [],
                  },
                ],
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

    it('should throw ConflictError when trying to change options of question with responses', async () => {
      // Generate different option arrays
      const optionsArb = fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 })
      const differentOptionsPairArb = fc
        .tuple(optionsArb, optionsArb)
        .filter(([o1, o2]) => JSON.stringify(o1) !== JSON.stringify(o2))

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          validQuestionTextArb,
          differentOptionsPairArb,
          async (formId, questionId, questionText, [originalOptions, newOptions]) => {
            // Setup mock to return form with multiple choice question that has responses
            const mockForm = createMockFormEntity(formId, [
              {
                id: questionId,
                text: questionText,
                type: 'MULTIPLE_CHOICE' as QuestionType,
                options: originalOptions,
                required: false,
                order: 0,
                responseCount: 3, // Has responses
              },
            ])
            vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)

            // Try to update question options
            try {
              await formService.updateForm(formId, {
                questions: [
                  {
                    id: questionId,
                    text: questionText,
                    type: 'MULTIPLE_CHOICE' as QuestionType,
                    required: false,
                    order: 0,
                    options: newOptions, // Different options
                    rows: [],
                    columns: [],
                  },
                ],
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

    it('should allow updating non-structural properties of questions with responses', async () => {
      // Generate arbitrary text changes
      const textPairArb = fc
        .tuple(validQuestionTextArb, validQuestionTextArb)
        .filter(([t1, t2]) => t1 !== t2)

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          textPairArb,
          fc.integer({ min: 0, max: 10 }),
          async (formId, questionId, [originalText, newText], newOrder) => {
            // Setup mock to return form with question that has responses
            const mockForm = createMockFormEntity(formId, [
              {
                id: questionId,
                text: originalText,
                type: QuestionType.TEXT,
                options: [],
                required: false,
                order: 0,
                responseCount: 5, // Has responses
              },
            ])
            vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)
            vi.mocked(mockRepository.updateWithQuestions).mockResolvedValue({
              ...mockForm,
              questions: mockForm.questions.map((q) => ({
                ...q,
                text: newText,
                order: newOrder,
              })),
            } as FormEntity)

            // Should succeed when only changing text and order (non-structural)
            const result = await formService.updateForm(formId, {
              questions: [
                {
                  id: questionId,
                  text: newText, // Changed text (allowed)
                  type: QuestionType.TEXT, // Same type
                  required: false, // Same required
                  order: newOrder, // Changed order (allowed)
                  options: [], // Same options
                  rows: [],
                  columns: [],
                },
              ],
            })

            return result !== null
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should allow full modification of questions without responses', async () => {
      // Generate arbitrary question modifications using actual enum values
      const questionTypeArb = fc.constantFrom(
        QuestionType.TEXT,
        QuestionType.SCALE,
        QuestionType.MULTIPLE_CHOICE
      )

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          validQuestionTextArb,
          validQuestionTextArb,
          questionTypeArb,
          questionTypeArb,
          async (formId, questionId, originalText, newText, originalType, newType) => {
            // Setup mock to return form with question that has NO responses
            const mockForm = createMockFormEntity(formId, [
              {
                id: questionId,
                text: originalText,
                type: originalType,
                options: originalType === QuestionType.MULTIPLE_CHOICE ? ['Option 1', 'Option 2'] : [],
                required: false,
                order: 0,
                responseCount: 0, // NO responses
              },
            ])
            vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)
            vi.mocked(mockRepository.updateWithQuestions).mockResolvedValue({
              ...mockForm,
              questions: mockForm.questions.map((q) => ({
                ...q,
                text: newText,
                type: newType,
                options: newType === QuestionType.MULTIPLE_CHOICE ? ['New Option 1', 'New Option 2'] : [],
              })),
            } as FormEntity)

            // Should succeed when question has no responses
            const result = await formService.updateForm(formId, {
              questions: [
                {
                  id: questionId,
                  text: newText,
                  type: newType, // Can change type
                  required: true, // Can change required
                  order: 5, // Can change order
                  options: newType === QuestionType.MULTIPLE_CHOICE ? ['New Option 1', 'New Option 2'] : [],
                  rows: [],
                  columns: [],
                },
              ],
            })

            return result !== null
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should allow deleting questions without responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          validQuestionTextArb,
          async (formId, questionId, questionText) => {
            // Setup mock to return form with question that has NO responses
            const mockForm = createMockFormEntity(formId, [
              {
                id: questionId,
                text: questionText,
                type: QuestionType.TEXT,
                options: [],
                required: false,
                order: 0,
                responseCount: 0, // NO responses
              },
            ])
            vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(mockForm)
            vi.mocked(mockRepository.updateWithQuestions).mockResolvedValue({
              ...mockForm,
              questions: [],
            } as FormEntity)

            // Should succeed when deleting question with no responses
            const result = await formService.updateForm(formId, {
              questions: [], // Delete all questions
            })

            return result !== null
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
