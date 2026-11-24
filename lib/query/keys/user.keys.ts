import type { UserFilters } from '@/types/entities/user'

/**
 * Query keys for user-related queries
 * 
 * Follows the hierarchical pattern:
 * - all: ['users'] - Base key for all user queries
 * - lists: ['users', 'list'] - Base key for all user lists
 * - list: ['users', 'list', filters] - Specific list with filters
 * - details: ['users', 'detail'] - Base key for all user details
 * - detail: ['users', 'detail', id] - Specific user detail
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
