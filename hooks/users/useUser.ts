import { useQuery } from '@tanstack/react-query'
import { userKeys } from '@/lib/query/keys'
import { getUser } from '@/lib/api/user.api'
import type { User } from '@/types/entities/user'

/**
 * Hook return interface
 */
interface UseUserReturn {
  /** User data */
  user: User | undefined
  /** Loading state */
  isLoading: boolean
  /** Error state */
  isError: boolean
  /** Error object */
  error: Error | null
  /** Refetch function */
  refetch: () => Promise<any>
}

/**
 * Custom hook for fetching a single user by ID
 * 
 * This hook uses TanStack Query to fetch and cache user data.
 * It provides automatic caching, background refetch, and loading states.
 * 
 * @param id - User ID to fetch
 * @param options - Optional configuration
 * @param options.enabled - Whether the query should run (default: true if id is provided)
 * @returns Object with user data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { user, isLoading, isError, error } = useUser(userId)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState error={error} />
 *   if (!user) return <NotFound />
 * 
 *   return <UserDetails user={user} />
 * }
 * ```
 */
export function useUser(
  id: string,
  options?: { enabled?: boolean }
): UseUserReturn {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: options?.enabled !== false && !!id,
  })

  return {
    user,
    isLoading,
    isError,
    error,
    refetch
  }
}
