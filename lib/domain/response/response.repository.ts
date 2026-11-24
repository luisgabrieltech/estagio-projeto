import type { Response, ResponseWithDetails } from '@/types/entities/response'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { ResponseItemDTO, ResponseFiltersDTO } from './response.schema'

/**
 * Response entity as stored in the database
 */
export type ResponseEntity = Response

/**
 * Data required to create a response in the repository
 */
export interface CreateResponseData extends ResponseItemDTO {
  userId: string
}

/**
 * Grouped responses by form for a user
 */
export interface UserFormResponses {
  formId: string
  formTitle: string
  responses: ResponseEntity[]
  submittedAt: Date
}

/**
 * Interface for Response repository operations
 * Abstracts data access layer from business logic
 */
export interface IResponseRepository {
  /**
   * Find a response by its unique ID
   * @param id - Response's unique identifier
   * @returns Response entity or null if not found
   */
  findById(id: string): Promise<ResponseEntity | null>

  /**
   * Find a specific response by user, form, and question
   * @param userId - User's unique identifier
   * @param formId - Form's unique identifier
   * @param questionId - Question's unique identifier
   * @returns Response entity or null if not found
   */
  findByUserFormQuestion(
    userId: string,
    formId: string,
    questionId: string
  ): Promise<ResponseEntity | null>

  /**
   * Find all responses by a user
   * @param userId - User's unique identifier
   * @returns List of responses
   */
  findByUser(userId: string): Promise<ResponseEntity[]>

  /**
   * Find all responses for a form
   * @param formId - Form's unique identifier
   * @returns List of responses
   */
  findByForm(formId: string): Promise<ResponseEntity[]>

  /**
   * Find all responses by a user for a specific form
   * @param userId - User's unique identifier
   * @param formId - Form's unique identifier
   * @returns List of responses
   */
  findByUserAndForm(userId: string, formId: string): Promise<ResponseEntity[]>

  /**
   * Find responses with details (user, form, question info)
   * @param filters - Filter and pagination options
   * @returns Paginated list of responses with details
   */
  findManyWithDetails(
    filters: ResponseFiltersDTO
  ): Promise<PaginatedResponse<ResponseWithDetails>>

  /**
   * Save multiple responses in a transaction
   * @param responses - Array of response data to save
   * @returns Created responses
   */
  saveMany(responses: CreateResponseData[]): Promise<ResponseEntity[]>

  /**
   * Check if a user has already responded to a form
   * @param userId - User's unique identifier
   * @param formId - Form's unique identifier
   * @returns True if user has responded
   */
  hasUserRespondedToForm(userId: string, formId: string): Promise<boolean>

  /**
   * Count responses matching optional filters
   * @param filters - Optional filter criteria
   * @returns Number of matching responses
   */
  count(filters?: Partial<ResponseFiltersDTO>): Promise<number>

  /**
   * Count unique users who responded to a form
   * @param formId - Form's unique identifier
   * @returns Number of unique users
   */
  countUniqueUsersByForm(formId: string): Promise<number>

  /**
   * Get form IDs that a user has responded to
   * @param userId - User's unique identifier
   * @returns Array of form IDs
   */
  getRespondedFormIds(userId: string): Promise<string[]>
}
