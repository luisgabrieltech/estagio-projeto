/**
 * Pagination metadata
 */
export interface PaginationData {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore?: boolean
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationData
}

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}
