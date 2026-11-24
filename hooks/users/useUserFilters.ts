import { useCallback, useMemo } from 'react'
import { useFilters, type FilterValue } from '@/hooks/common/useFilters'
import type { UserFilters } from '@/types/entities/user'

/**
 * User filter state (without pagination)
 */
interface UserFilterState {
  /** Search query for name or email */
  search: string
  /** System role filter */
  role: string
  /** Functional role filter */
  functionalRole: string
}

/**
 * Hook return interface
 */
interface UseUserFiltersReturn {
  /** Current filter values */
  filters: UserFilterState
  /** Debounced filter values (for API calls) */
  debouncedFilters: UserFilterState
  /** Update search query */
  setSearchQuery: (query: string) => void
  /** Update role filter */
  setRoleFilter: (role: string) => void
  /** Update functional role filter */
  setFunctionalRoleFilter: (role: string) => void
  /** Reset all filters to defaults */
  resetFilters: () => void
  /** Check if any filters are active */
  hasActiveFilters: boolean
  /** Get filters as UserFilters type (for API calls) */
  getApiFilters: (page?: number, pageSize?: number) => UserFilters
}

/**
 * Options for useUserFilters hook
 */
interface UseUserFiltersOptions {
  /** Initial search value */
  initialSearch?: string
  /** Initial role filter */
  initialRole?: string
  /** Initial functional role filter */
  initialFunctionalRole?: string
  /** Whether to sync with URL (default: true) */
  syncWithUrl?: boolean
  /** Callback when filters change */
  onFiltersChange?: (filters: UserFilterState) => void
}

/**
 * Custom hook for managing user filter state
 * 
 * This hook provides a simplified interface for managing user filters
 * with debouncing for search and URL synchronization.
 * 
 * Use this hook when you need filter state management without
 * the full user fetching logic (e.g., for filter components).
 * 
 * @param options - Configuration options
 * @returns Filter state and control functions
 * 
 * @example
 * ```tsx
 * function UserFiltersPanel() {
 *   const {
 *     filters,
 *     debouncedFilters,
 *     setSearchQuery,
 *     setRoleFilter,
 *     setFunctionalRoleFilter,
 *     resetFilters,
 *     hasActiveFilters
 *   } = useUserFilters({
 *     onFiltersChange: (filters) => console.log('Filters changed:', filters)
 *   })
 * 
 *   return (
 *     <div>
 *       <input
 *         value={filters.search}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Buscar usuários..."
 *       />
 *       <select
 *         value={filters.role}
 *         onChange={(e) => setRoleFilter(e.target.value)}
 *       >
 *         <option value="all">Todos os cargos</option>
 *         <option value="ADMIN">Administrador</option>
 *         <option value="USER">Usuário</option>
 *       </select>
 *       {hasActiveFilters && (
 *         <button onClick={resetFilters}>Limpar filtros</button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useUserFilters(options: UseUserFiltersOptions = {}): UseUserFiltersReturn {
  const {
    initialSearch = '',
    initialRole = 'all',
    initialFunctionalRole = 'all',
    syncWithUrl = true,
    onFiltersChange
  } = options

  // Use the common filters hook
  const {
    filters: rawFilters,
    debouncedFilters: rawDebouncedFilters,
    setFilter,
    resetFilters: resetAllFilters,
    hasActiveFilters
  } = useFilters<Record<string, FilterValue>>({
    initialFilters: {
      search: initialSearch,
      role: initialRole,
      functionalRole: initialFunctionalRole
    },
    filterConfigs: {
      search: {
        debounce: true,
        debounceDelay: 500
      }
    },
    syncWithUrl,
    onFiltersChange: onFiltersChange 
      ? (filters) => onFiltersChange({
          search: filters.search as string,
          role: filters.role as string,
          functionalRole: filters.functionalRole as string
        })
      : undefined
  })

  // Type-safe filter state
  const filters: UserFilterState = useMemo(() => ({
    search: rawFilters.search as string,
    role: rawFilters.role as string,
    functionalRole: rawFilters.functionalRole as string
  }), [rawFilters])

  // Type-safe debounced filter state
  const debouncedFilters: UserFilterState = useMemo(() => ({
    search: rawDebouncedFilters.search as string,
    role: rawDebouncedFilters.role as string,
    functionalRole: rawDebouncedFilters.functionalRole as string
  }), [rawDebouncedFilters])

  /**
   * Update search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setFilter('search', query)
  }, [setFilter])

  /**
   * Update role filter
   */
  const setRoleFilter = useCallback((role: string) => {
    setFilter('role', role)
  }, [setFilter])

  /**
   * Update functional role filter
   */
  const setFunctionalRoleFilter = useCallback((role: string) => {
    setFilter('functionalRole', role)
  }, [setFilter])

  /**
   * Get filters formatted for API calls
   */
  const getApiFilters = useCallback((page = 1, pageSize = 10): UserFilters => {
    return {
      search: debouncedFilters.search || undefined,
      role: debouncedFilters.role !== 'all' ? debouncedFilters.role : undefined,
      functionalRole: debouncedFilters.functionalRole !== 'all' 
        ? debouncedFilters.functionalRole 
        : undefined,
      page,
      pageSize
    }
  }, [debouncedFilters])

  return {
    filters,
    debouncedFilters,
    setSearchQuery,
    setRoleFilter,
    setFunctionalRoleFilter,
    resetFilters: resetAllFilters,
    hasActiveFilters,
    getApiFilters
  }
}
