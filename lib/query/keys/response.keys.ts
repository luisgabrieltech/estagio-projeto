import type { ResponseFilters } from '@/types/entities/response'

/**
 * Query keys for response-related queries
 * 
 * Follows the hierarchical pattern:
 * - all: ['responses'] - Base key for all response queries
 * - lists: ['responses', 'list'] - Base key for all response lists
 * - list: ['responses', 'list', filters] - Specific list with filters
 * - byForm: ['responses', 'form', formId] - Responses for a specific form
 * - byFormFiltered: ['responses', 'form', formId, filters] - Filtered responses for a form
 * - byUser: ['responses', 'user', userId] - Responses by a specific user
 * - stats: ['responses', 'stats', formId] - Statistics for a form's responses
 * - metrics: ['responses', 'metrics', formId] - Metrics for a form's responses
 */
export const responseKeys = {
  all: ['responses'] as const,
  lists: () => [...responseKeys.all, 'list'] as const,
  list: (filters: ResponseFilters) => [...responseKeys.lists(), filters] as const,
  byForm: (formId: string) => [...responseKeys.all, 'form', formId] as const,
  byFormFiltered: (formId: string, filters: ResponseFilters) => 
    [...responseKeys.byForm(formId), filters] as const,
  byUser: (userId: string) => [...responseKeys.all, 'user', userId] as const,
  stats: (formId: string) => [...responseKeys.all, 'stats', formId] as const,
  metrics: (formId: string) => [...responseKeys.all, 'metrics', formId] as const,
}
