import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PAGINATION } from '@/lib/config'
import { usePagination } from '@/hooks/common/usePagination'
import { useFilters } from '@/hooks/common/useFilters'
import { formKeys } from '@/lib/query/keys'
import { getForms } from '@/lib/api/form.api'
import type { FormFilters } from '@/types/entities/form'
import type { PaginationData } from '@/types/common/pagination'

/**
 * Form with respondent count for list display
 * Matches the structure returned by the admin forms API
 */
interface FormWithRespondentCount {
  id: string
  title: string
  description: string
  category: string
  status: string
  externalStatus: string
  deadline?: Date | null
  estimatedTime?: string | null
  generatesCertificate: boolean
  visibleToRoles: string[]
  createdAt: Date
  updatedAt: Date
  createdById: string
  _count?: {
    responses?: number
    questions?: number
  }
  respondentCount?: number
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Response type from the forms API endpoint
 */
interface FormsApiResponse {
  forms: FormWithRespondentCount[]
  pagination: PaginationData
}

/**
 * Hook state interface
 */
interface UseFormsState {
  /** List of forms */
  forms: FormWithRespondentCount[]
  /** Loading state (initial load) */
  loading: boolean
  /** Loading state (alias for isLoading) */
  isLoading: boolean
  /** Fetching state (includes background refetch) */
  isFetching: boolean
  /** Error state */
  error: string | null
  /** Current filters */
  filters: FormFilters
  /** Pagination data */
  pagination: PaginationData
}

/**
 * Hook return interface
 */
interface UseFormsReturn extends UseFormsState {
  /** Update search query */
  setSearchQuery: (query: string) => void
  /** Update status filter */
  setStatusFilter: (status: string) => void
  /** Change page */
  setPage: (page: number) => void
  /** Refresh forms data */
  refresh: () => Promise<void>
  /** Invalidate forms cache */
  invalidateCache: () => void
  /** Update a form in the list (for optimistic updates) */
  updateForm: (formId: string, updates: Partial<FormWithRespondentCount>) => void
  /** Remove a form from the list (for optimistic updates) */
  removeForm: (formId: string) => void
}

/**
 * Custom hook for managing forms list with filters, pagination, and caching
 * 
 * This hook handles:
 * - Fetching forms from the API with server-side pagination
 * - Managing filter state (search, status)
 * - Debouncing search queries
 * - Caching responses with TanStack Query
 * - URL synchronization for filters and pagination
 * - Loading and error states
 * 
 * Now powered by TanStack Query for automatic caching, background refetch,
 * and request deduplication.
 * 
 * @returns Object with forms data, loading state, filters, pagination, and control functions
 * 
 * @example
 * ```tsx
 * function FormsPage() {
 *   const {
 *     forms,
 *     loading,
 *     error,
 *     filters,
 *     pagination,
 *     setSearchQuery,
 *     setStatusFilter,
 *     setPage,
 *     refresh
 *   } = useForms()
 * 
 *   return (
 *     <div>
 *       <input onChange={(e) => setSearchQuery(e.target.value)} />
 *       <FormTable forms={forms} loading={loading} />
 *       <Pagination {...pagination} onPageChange={setPage} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useForms(): UseFormsReturn {
  const queryClient = useQueryClient()

  // Use shared pagination hook
  const pagination = usePagination({
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    syncWithUrl: true
  })

  // Use shared filters hook with simple filter types
  const {
    filters,
    debouncedFilters,
    setFilter
  } = useFilters<{ search: string; status: string }>({
    initialFilters: {
      search: '',
      status: 'all'
    },
    filterConfigs: {
      search: {
        debounce: true,
        debounceDelay: 500
      }
    }
  })

  // Build query filters
  const queryFilters: FormFilters = {
    page: pagination.page,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  }

  if (debouncedFilters.search) {
    queryFilters.search = debouncedFilters.search as string
  }

  if (debouncedFilters.status && debouncedFilters.status !== 'all') {
    queryFilters.status = debouncedFilters.status as string
  }

  // Use TanStack Query for data fetching
  const {
    data: formsData,
    isLoading,
    isFetching,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: formKeys.list(queryFilters),
    queryFn: () => getForms(queryFilters),
  })

  const forms = formsData?.data || []
  const loading = isLoading
  const error = queryError?.message || null

  // Update pagination total when data changes
  useEffect(() => {
    if (formsData?.pagination) {
      pagination.setTotal(formsData.pagination.total)
    }
  }, [formsData])

  /**
   * Invalidate forms cache
   */
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: formKeys.lists() })
  }, [queryClient])

  /**
   * Refresh forms data
   */
  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  /**
   * Update a form in the list (for optimistic updates)
   * Uses TanStack Query's setQueryData to update cache directly
   */
  const updateForm = useCallback((formId: string, updates: Partial<FormWithRespondentCount>) => {
    const currentKey = formKeys.list(queryFilters)
    const currentData = queryClient.getQueryData<typeof formsData>(currentKey)
    
    if (currentData?.data) {
      const updatedForms = currentData.data.map(form => 
        form.id === formId ? { ...form, ...updates } : form
      )
      queryClient.setQueryData(currentKey, {
        ...currentData,
        data: updatedForms
      })
    }
  }, [queryClient, queryFilters, formsData])

  /**
   * Remove a form from the list (for optimistic updates)
   * Uses TanStack Query's setQueryData to update cache directly
   */
  const removeForm = useCallback((formId: string) => {
    const currentKey = formKeys.list(queryFilters)
    const currentData = queryClient.getQueryData<typeof formsData>(currentKey)
    
    if (currentData?.data) {
      const filteredForms = currentData.data.filter(form => form.id !== formId)
      queryClient.setQueryData(currentKey, {
        ...currentData,
        data: filteredForms
      })
    }
  }, [queryClient, queryFilters, formsData])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      pagination.setPage(1)
    }
  }, [debouncedFilters.search, debouncedFilters.status])

  return {
    forms,
    loading,
    isLoading,
    isFetching,
    error,
    filters: {
      search: filters.search as string,
      status: filters.status as string,
      page: pagination.page,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE
    },
    pagination: pagination.getPaginationData(),
    setSearchQuery: (query: string) => setFilter('search', query),
    setStatusFilter: (status: string) => setFilter('status', status),
    setPage: pagination.setPage,
    refresh,
    invalidateCache,
    updateForm,
    removeForm
  }
}
