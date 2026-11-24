/**
 * Form Factory
 * 
 * Factory functions for creating test form and question data
 * 
 * @module __tests__/utils/factories/form.factory
 * Requirements: 3.3
 */
import { Category, FormStatus, ExternalStatus, QuestionType } from '@prisma/client'
import type { Form, Question, FormCreateData, FormWithStats } from '@/types/entities/form'

let formIdCounter = 0
let questionIdCounter = 0

/**
 * Creates a test form with default values
 * 
 * @param overrides - Partial form data to override defaults
 * @returns Complete Form object
 */
export function createForm(overrides: Partial<Form> = {}): Form {
  formIdCounter++
  const now = new Date()
  
  return {
    id: `form-${formIdCounter}`,
    title: `Test Form ${formIdCounter}`,
    description: `Description for test form ${formIdCounter}`,
    category: 'DOCENTES' as Category,
    status: 'DRAFT' as FormStatus,
    externalStatus: 'HIDDEN' as ExternalStatus,
    deadline: null,
    estimatedTime: '15 minutos',
    generatesCertificate: false,
    certificateHours: null,
    visibleToRoles: [],
    visibleToUserIds: [],
    createdAt: now,
    updatedAt: now,
    createdById: 'creator-1',
    questions: [],
    ...overrides,
  }
}

/**
 * Creates a published form
 * 
 * @param overrides - Partial form data to override defaults
 * @returns Complete Form object with PUBLISHED status
 */
export function createPublishedForm(overrides: Partial<Form> = {}): Form {
  return createForm({
    status: 'PUBLISHED' as FormStatus,
    externalStatus: 'OPEN' as ExternalStatus,
    ...overrides,
  })
}

/**
 * Creates multiple test forms
 * 
 * @param count - Number of forms to create
 * @param overrides - Partial form data to apply to all forms
 * @returns Array of Form objects
 */
export function createForms(count: number, overrides: Partial<Form> = {}): Form[] {
  return Array.from({ length: count }, () => createForm(overrides))
}

/**
 * Creates a test question with default values
 * 
 * @param formId - ID of the form this question belongs to
 * @param overrides - Partial question data to override defaults
 * @returns Complete Question object
 */
export function createQuestion(formId: string, overrides: Partial<Question> = {}): Question {
  questionIdCounter++
  const now = new Date()
  
  return {
    id: `question-${questionIdCounter}`,
    customId: null,
    type: 'TEXT' as QuestionType,
    text: `Test Question ${questionIdCounter}`,
    description: '',
    required: false,
    order: questionIdCounter,
    options: [],
    rows: [],
    columns: [],
    conditional: null,
    formId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Creates a multiple choice question
 * 
 * @param formId - ID of the form this question belongs to
 * @param options - Array of option strings
 * @param overrides - Partial question data to override defaults
 * @returns Complete Question object with MULTIPLE_CHOICE type
 */
export function createMultipleChoiceQuestion(
  formId: string,
  options: string[] = ['Option A', 'Option B', 'Option C'],
  overrides: Partial<Question> = {}
): Question {
  return createQuestion(formId, {
    type: 'MULTIPLE_CHOICE' as QuestionType,
    options,
    ...overrides,
  })
}

/**
 * Creates a scale question
 * 
 * @param formId - ID of the form this question belongs to
 * @param overrides - Partial question data to override defaults
 * @returns Complete Question object with SCALE type
 */
export function createScaleQuestion(formId: string, overrides: Partial<Question> = {}): Question {
  return createQuestion(formId, {
    type: 'SCALE' as QuestionType,
    ...overrides,
  })
}

/**
 * Creates form creation data for API calls
 * 
 * @param overrides - Partial data to override defaults
 * @returns FormCreateData object
 */
export function createFormCreateData(overrides: Partial<FormCreateData> = {}): FormCreateData {
  formIdCounter++
  
  return {
    title: `New Form ${formIdCounter}`,
    description: `Description for new form ${formIdCounter}`,
    category: 'DOCENTES' as Category,
    generatesCertificate: false,
    visibleToRoles: [],
    visibleToUserIds: [],
    questions: [],
    ...overrides,
  }
}

/**
 * Creates a form with statistics
 * 
 * @param overrides - Partial data to override defaults
 * @returns FormWithStats object
 */
export function createFormWithStats(overrides: Partial<FormWithStats> = {}): FormWithStats {
  const form = createForm()
  
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    category: form.category,
    status: form.status,
    externalStatus: form.externalStatus,
    deadline: form.deadline,
    estimatedTime: form.estimatedTime,
    generatesCertificate: form.generatesCertificate,
    totalResponses: 0,
    totalQuestions: 0,
    responseRate: 0,
    respondentCount: 0,
    lastResponse: null,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    createdBy: {
      name: 'Test Creator',
      email: 'creator@test.com',
    },
    ...overrides,
  }
}

/**
 * Resets the form and question ID counters
 * Useful for test isolation
 */
export function resetFormFactory(): void {
  formIdCounter = 0
  questionIdCounter = 0
}
