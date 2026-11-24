import type {
  QueryHookResult,
  MutationHookResult,
  UsersHookResult,
  SingleUserHookResult,
  EvaluationsHookResult,
} from './types'

export function isValidQueryHookResult<T>(
  result: unknown
): result is QueryHookResult<T> {
  if (typeof result !== 'object' || result === null) return false
  
  const obj = result as Record<string, unknown>
  
  return (
    'data' in obj &&
    typeof obj.isLoading === 'boolean' &&
    typeof obj.isError === 'boolean' &&
    (obj.error === null || obj.error instanceof Error) &&
    typeof obj.refetch === 'function'
  )
}

export function isValidMutationHookResult<TData, TVariables>(
  result: unknown
): result is MutationHookResult<TData, TVariables> {
  if (typeof result !== 'object' || result === null) return false
  
  const obj = result as Record<string, unknown>
  
  return (
    typeof obj.mutate === 'function' &&
    typeof obj.mutateAsync === 'function' &&
    typeof obj.isPending === 'boolean' &&
    typeof obj.isError === 'boolean' &&
    (obj.error === null || obj.error instanceof Error)
  )
}

export function isValidUsersHookResult(
  result: unknown
): result is UsersHookResult {
  if (typeof result !== 'object' || result === null) return false
  
  const obj = result as Record<string, unknown>
  
  const hasRequiredProperties = 
    Array.isArray(obj.users) &&
    typeof obj.loading === 'boolean' &&
    (obj.error === null || typeof obj.error === 'string') &&
    typeof obj.filters === 'object' &&
    typeof obj.pagination === 'object'
  
  if (!hasRequiredProperties) return false
  
  const hasRequiredFunctions =
    typeof obj.setSearchQuery === 'function' &&
    typeof obj.setRoleFilter === 'function' &&
    typeof obj.setFunctionalRoleFilter === 'function' &&
    typeof obj.setPage === 'function' &&
    typeof obj.refresh === 'function' &&
    typeof obj.invalidateCache === 'function'
  
  return hasRequiredFunctions
}

export function isValidSingleUserHookResult(
  result: unknown
): result is SingleUserHookResult {
  if (typeof result !== 'object' || result === null) return false
  
  const obj = result as Record<string, unknown>
  
  return (
    'user' in obj &&
    typeof obj.isLoading === 'boolean' &&
    typeof obj.isError === 'boolean' &&
    (obj.error === null || obj.error instanceof Error) &&
    typeof obj.refetch === 'function'
  )
}

export function isValidEvaluationsHookResult(
  result: unknown
): result is EvaluationsHookResult {
  if (typeof result !== 'object' || result === null) return false
  
  const obj = result as Record<string, unknown>
  
  const hasRequiredProperties =
    Array.isArray(obj.forms) &&
    Array.isArray(obj.userResponses) &&
    typeof obj.loading === 'boolean' &&
    (obj.error === null || typeof obj.error === 'string') &&
    typeof obj.searchQuery === 'string' &&
    typeof obj.debouncedSearchQuery === 'string' &&
    obj.respondedFormIds instanceof Set &&
    Array.isArray(obj.userFunctionalRoles) &&
    Array.isArray(obj.availableEvaluations) &&
    Array.isArray(obj.completedEvaluations)
  
  if (!hasRequiredProperties) return false
  
  const hasRequiredFunctions =
    typeof obj.setSearchQuery === 'function' &&
    typeof obj.refresh === 'function' &&
    typeof obj.hasRolePermission === 'function'
  
  return hasRequiredFunctions
}

export function isValidPagination(
  pagination: unknown
): pagination is { page: number; pageSize: number; total: number; totalPages: number } {
  if (typeof pagination !== 'object' || pagination === null) return false
  
  const obj = pagination as Record<string, unknown>
  
  return (
    typeof obj.page === 'number' &&
    typeof obj.pageSize === 'number' &&
    typeof obj.total === 'number' &&
    typeof obj.totalPages === 'number'
  )
}
