import type { FormFilters } from '@/types/entities/form'

/**
 * Query keys for form-related queries
 * 
 * Follows the hierarchical pattern:
 * - all: ['forms'] - Base key for all form queries
 * - lists: ['forms', 'list'] - Base key for all form lists
 * - list: ['forms', 'list', filters] - Specific list with filters
 * - details: ['forms', 'detail'] - Base key for all form details
 * - detail: ['forms', 'detail', id] - Specific form detail
 * - withQuestions: ['forms', 'detail', id, 'questions'] - Form with questions
 */
export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: (filters: FormFilters) => [...formKeys.lists(), filters] as const,
  public: (userId?: string) => userId
    ? [...formKeys.all, 'public', userId] as const
    : [...formKeys.all, 'public'] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
  withQuestions: (id: string) => [...formKeys.detail(id), 'questions'] as const,
}
