import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PAGINATION } from '@/lib/config'
import { usePagination } from '@/hooks/common/usePagination'
import { useFilters } from '@/hooks/common/useFilters'
import { userKeys } from '@/lib/query/keys'
import { getUsers } from '@/lib/api/user.api'
import type { User, UserFilters } from '@/types/entities/user'
import type { PaginationData } from '@/types/common/pagination'

/**
 * Hook state interface
 */
interface UseUsersState {
  /** List of users */
  users: User[]
  /** Loading state (initial load) */
  loading: boolean
  /** Loading state (alias for isLoading) */
  isLoading: boolean
  /** Fetching state (includes background refetch) */
  isFetching: boolean
  /** Error state */
  error: string | null
  /** Current filters */
  filters: UserFilters
  /** Pagination data */
  pagination: PaginationData
}

/**
 * Hook return interface
 */
interface UseUsersReturn extends UseUsersState {
  /** Update search query */
  setSearchQuery: (query: string) => void
  /** Update role filter */
  setRoleFilter: (role: string) => void
  /** Update functional role filter */
  setFunctionalRoleFilter: (role: string) => void
  /** Change page */
  setPage: (page: number) => void
  /** Refresh users data */
  refresh: () => Promise<void>
  /** Refetch users data (alias for refresh) */
  refetch: () => Promise<void>
  /** Invalidate users cache */
  invalidateCache: () => void
}

/**
 * Custom hook for managing users list with filters, pagination, and caching
 * 
 * This hook handles:
 * - Fetching users from the API with server-side pagination
 * - Managing filter state (search, role, functional role)
 * - Debouncing search queries
 * - Caching responses with TanStack Query
 * - URL synchronization for filters and pagination
 * - Loading and error states
 * 
 * Now powered by TanStack Query for automatic caching, background refetch,
 * and request deduplication.
 * 
 * @returns Object with users data, loading state, filters, pagination, and control functions
 * 
 * @example
 * ```tsx
 * function UsersPage() {
 *   const {
 *     users,
 *     loading,
 *     error,
 *     filters,
 *     pagination,
 *     setSearchQuery,
 *     setRoleFilter,
 *     setPage,
 *     refresh
 *   } = useUsers()
 * 
 *   return (
 *     <div>
 *       <input onChange={(e) => setSearchQuery(e.target.value)} />
 *       <UserTable users={users} loading={loading} />
 *       <Pagination {...pagination} onPageChange={setPage} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useUsers(): UseUsersReturn {
  const queryClient = useQueryClient()

  // Use shared pagination hook
  const pagination = usePagination({
    pageSize: PAGINATION.USERS_PAGE_SIZE,
    syncWithUrl: true
  })

  // Use shared filters hook
  const {
    filters,
    debouncedFilters,
    setFilter
  } = useFilters<Omit<UserFilters, 'page' | 'pageSize'>>({
    initialFilters: {
      search: '',
      role: 'all',
      functionalRole: 'all'
    },
    filterConfigs: {
      search: {
        debounce: true,
        debounceDelay: 500
      }
    }
  })

  // Build query filters
  const queryFilters: UserFilters = {
    page: pagination.page,
    pageSize: PAGINATION.USERS_PAGE_SIZE,
  }

  if (debouncedFilters.search) {
    queryFilters.search = debouncedFilters.search as string
  }

  if (debouncedFilters.role && debouncedFilters.role !== 'all') {
    queryFilters.role = debouncedFilters.role as string
  }

  if (debouncedFilters.functionalRole && debouncedFilters.functionalRole !== 'all') {
    queryFilters.functionalRole = debouncedFilters.functionalRole as string
  }

  // Use TanStack Query for data fetching
  const {
    data: usersData,
    isLoading,
    isFetching,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: userKeys.list(queryFilters),
    queryFn: () => getUsers(queryFilters),
  })

  const users: User[] = usersData?.users || []
  const loading = isLoading
  const error = queryError?.message || null

  // Update pagination total when data changes
  useEffect(() => {
    if (usersData?.pagination) {
      pagination.setTotal(usersData.pagination.total)
    }
  }, [usersData])

  /**
   * Invalidate users cache
   */
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: userKeys.lists() })
  }, [queryClient])

  /**
   * Refresh users data
   */
  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      pagination.setPage(1)
    }
  }, [debouncedFilters.search, debouncedFilters.role, debouncedFilters.functionalRole])

  return {
    users,
    loading,
    isLoading,
    isFetching,
    error,
    filters: {
      search: filters.search as string,
      role: filters.role as string,
      functionalRole: filters.functionalRole as string,
      page: pagination.page,
      pageSize: PAGINATION.USERS_PAGE_SIZE
    },
    pagination: pagination.getPaginationData(),
    setSearchQuery: (query: string) => setFilter('search', query),
    setRoleFilter: (role: string) => setFilter('role', role),
    setFunctionalRoleFilter: (role: string) => setFilter('functionalRole', role),
    setPage: pagination.setPage,
    refresh,
    refetch: refresh,
    invalidateCache
  }
}
