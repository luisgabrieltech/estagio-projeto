/**
 * Test Types
 * 
 * Type definitions for test utilities and hook validation
 * 
 * @module __tests__/utils/types
 */

/**
 * Base query hook result interface (TanStack Query pattern)
 */
export interface QueryHookResult<TData> {
  data: TData | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<unknown>
  isFetching?: boolean
  isSuccess?: boolean
}

/**
 * Mutation hook result interface (TanStack Query pattern)
 */
export interface MutationHookResult<TData, TVariables> {
  mutate: (variables: TVariables) => void
  mutateAsync: (variables: TVariables) => Promise<TData>
  isPending: boolean
  isError: boolean
  error: Error | null
  isSuccess?: boolean
  data?: TData
  reset?: () => void
}

/**
 * Users list hook result interface
 */
export interface UsersHookResult {
  users: unknown[]
  loading: boolean
  error: string | null
  filters: {
    search: string
    role: string
    functionalRole: string
    page: number
    pageSize: number
  }
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  setSearchQuery: (query: string) => void
  setRoleFilter: (role: string) => void
  setFunctionalRoleFilter: (role: string) => void
  setPage: (page: number) => void
  refresh: () => Promise<void>
  invalidateCache: () => void
}

/**
 * Single user hook result interface
 */
export interface SingleUserHookResult {
  user: unknown | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

/**
 * Evaluations hook result interface (backward compatible)
 */
export interface EvaluationsHookResult {
  forms: unknown[]
  userResponses: unknown[]
  userProfile: unknown | null
  loading: boolean
  error: string | null
  searchQuery: string
  debouncedSearchQuery: string
  respondedFormIds: Set<string>
  userFunctionalRoles: string[]
  availableEvaluations: unknown[]
  completedEvaluations: unknown[]
  setSearchQuery: (query: string) => void
  refresh: () => Promise<void>
  hasRolePermission: (role: string) => boolean
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
