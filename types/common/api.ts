/**
 * API response types
 * 
 * Standard types for API responses to ensure consistency across the application
 */

import { PaginatedResponse } from './pagination'

/**
 * Standard API success response
 * 
 * @example
 * ```typescript
 * const response: ApiResponse<User> = {
 *   data: user,
 *   message: 'User created successfully'
 * }
 * ```
 */
export interface ApiResponse<T> {
  /** Response data */
  data?: T
  /** Success or informational message */
  message?: string
}

/**
 * Standard API error response
 * 
 * @example
 * ```typescript
 * const error: ApiErrorResponse = {
 *   message: 'User not found',
 *   error: 'NOT_FOUND',
 *   details: { userId: '123' }
 * }
 * ```
 */
export interface ApiErrorResponse {
  /** Error message for display */
  message: string
  /** Error code for programmatic handling */
  error?: string
  /** Additional error details */
  details?: Record<string, any>
}

/**
 * Paginated API response
 * 
 * @example
 * ```typescript
 * const response: ApiPaginatedResponse<User> = {
 *   users: [...],
 *   pagination: {
 *     page: 1,
 *     pageSize: 50,
 *     total: 100,
 *     totalPages: 2
 *   }
 * }
 * ```
 */
export type ApiPaginatedResponse<T, K extends string = 'data'> = {
  [key in K]: T[]
} & {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore?: boolean
  }
}

/**
 * API response with generic paginated data
 */
export type ApiGenericPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>
