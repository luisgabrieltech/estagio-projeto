/**
 * Query keys for certificate-related queries
 * 
 * Follows the hierarchical pattern:
 * - all: ['certificates'] - Base key for all certificate queries
 * - lists: ['certificates', 'list'] - Base key for all certificate lists
 * - list: ['certificates', 'list', filters] - Specific list with filters
 * - details: ['certificates', 'detail'] - Base key for all certificate details
 * - detail: ['certificates', 'detail', id] - Specific certificate detail
 * - byUser: ['certificates', 'user', userId] - Certificates for a specific user
 * - byForm: ['certificates', 'form', formId] - Certificates for a specific form
 * - validation: ['certificates', 'validation', code] - Certificate validation by code
 */
export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...certificateKeys.lists(), filters] as const,
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateKeys.details(), id] as const,
  byUser: (userId: string) => [...certificateKeys.all, 'user', userId] as const,
  byForm: (formId: string) => [...certificateKeys.all, 'form', formId] as const,
  validation: (code: string) => [...certificateKeys.all, 'validation', code] as const,
}
