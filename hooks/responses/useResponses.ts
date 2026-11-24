"use client"

import { useQuery } from '@tanstack/react-query'
import { responseKeys } from '@/lib/query/keys'
import { getFormResponses, getUserResponses } from '@/lib/api/response.api'
import type { ResponseFilters } from '@/types/entities/response'

/**
 * Hook for fetching responses for a specific form
 * 
 * Uses TanStack Query for automatic caching, background refetching,
 * and request deduplication.
 * 
 * @param formId - The ID of the form to fetch responses for
 * @param filters - Optional filters for responses
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function ResponsesList({ formId }: { formId: string }) {
 *   const { data, isLoading, isError, error, refetch } = useResponses(formId)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />
 * 
 *   return <ResponsesTable data={data} />
 * }
 * ```
 */
export function useResponses(formId: string, filters: ResponseFilters = {}) {
  return useQuery({
    queryKey: responseKeys.byFormFiltered(formId, filters),
    queryFn: () => getFormResponses(formId, filters),
    enabled: !!formId,
  })
}

/**
 * Hook for fetching responses for a specific user
 * 
 * Uses TanStack Query for automatic caching and background refetching.
 * 
 * @param userId - The ID of the user to fetch responses for
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function UserResponsesList({ userId }: { userId: string }) {
 *   const { data, isLoading, isError } = useUserResponses(userId)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState />
 * 
 *   return <ResponsesList responses={data} />
 * }
 * ```
 */
export function useUserResponses(userId: string) {
  return useQuery({
    queryKey: responseKeys.byUser(userId),
    queryFn: () => getUserResponses(userId),
    enabled: !!userId,
  })
}
