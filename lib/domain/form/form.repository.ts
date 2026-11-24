import type { Form, Question, FormWithStats } from '@/types/entities/form'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { CreateFormDTO, UpdateFormDTO, FormFiltersDTO } from './form.schema'
import type { QuestionDataDTO } from './question.schema'

/**
 * Form entity with questions as stored in the database
 */
export interface FormEntity extends Form {
  questions: Question[]
}

/**
 * Question with response count for preservation logic
 */
export interface QuestionWithResponseCount extends Question {
  _count?: {
    responses: number
  }
}

/**
 * Form with questions and response counts
 */
export interface FormWithQuestionResponses extends Form {
  questions: QuestionWithResponseCount[]
}

/**
 * Data required to create a form in the repository
 */
export interface CreateFormData {
  title: string
  description: string
  category: CreateFormDTO['category']
  createdById: string
  deadline?: Date | null
  estimatedTime?: string | null
  generatesCertificate?: boolean
  certificateHours?: string | null
  visibleToRoles?: string[]
  visibleToUserIds?: string[]
  questions?: QuestionDataDTO[]
}

/**
 * Data for updating questions with optional ID (for existing questions)
 */
export interface UpdateQuestionData extends QuestionDataDTO {
  id?: string
}

/**
 * Data required to update a form in the repository
 */
export interface UpdateFormData extends Omit<UpdateFormDTO, 'questions'> {
  questions?: UpdateQuestionData[]
}

/**
 * Interface for Form repository operations
 * Abstracts data access layer from business logic
 */
export interface IFormRepository {
  /**
   * Find a form by its unique ID
   * @param id - Form's unique identifier
   * @returns Form entity or null if not found
   */
  findById(id: string): Promise<FormEntity | null>

  /**
   * Find a form by ID with questions and their response counts
   * Used for update operations to check which questions can be modified
   * @param id - Form's unique identifier
   * @returns Form with questions and response counts or null
   */
  findWithQuestionResponses(id: string): Promise<FormWithQuestionResponses | null>

  /**
   * Find multiple forms with filtering and pagination
   * @param filters - Filter and pagination options
   * @returns Paginated list of forms
   */
  findMany(filters: FormFiltersDTO): Promise<PaginatedResponse<Form>>

  /**
   * Find forms by status
   * @param status - Form status to filter by
   * @returns List of forms with the specified status
   */
  findByStatus(status: Form['status']): Promise<Form[]>

  /**
   * Find forms by external status
   * @param externalStatus - External status to filter by
   * @returns List of forms with the specified external status
   */
  findByExternalStatus(externalStatus: Form['externalStatus']): Promise<Form[]>

  /**
   * Create a new form with optional questions
   * @param data - Form creation data
   * @returns Created form with questions
   */
  create(data: CreateFormData): Promise<FormEntity>

  /**
   * Update an existing form
   * @param id - Form's unique identifier
   * @param data - Fields to update
   * @returns Updated form
   */
  update(id: string, data: UpdateFormData): Promise<Form>

  /**
   * Update a form with questions
   * Handles question creation, update, and deletion
   * @param id - Form's unique identifier
   * @param data - Form and questions data
   * @returns Updated form with questions
   */
  updateWithQuestions(id: string, data: UpdateFormData): Promise<FormEntity>

  /**
   * Delete a form by ID
   * @param id - Form's unique identifier
   */
  delete(id: string): Promise<void>

  /**
   * Count forms matching optional filters
   * @param filters - Optional filter criteria
   * @returns Number of matching forms
   */
  count(filters?: Partial<FormFiltersDTO>): Promise<number>

  /**
   * Check if a form has any responses
   * @param id - Form's unique identifier
   * @returns True if form has responses
   */
  hasResponses(id: string): Promise<boolean>

  /**
   * Get question IDs that have responses
   * @param formId - Form's unique identifier
   * @returns Array of question IDs with responses
   */
  getQuestionIdsWithResponses(formId: string): Promise<string[]>

  /**
   * Get all forms with response statistics
   * @returns List of forms with stats (totalResponses, totalQuestions, responseRate, lastResponse)
   */
  findAllWithStats(): Promise<FormWithStats[]>
}
