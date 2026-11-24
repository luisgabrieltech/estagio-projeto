import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PaginationData } from '@/types/common/pagination'

/**
 * Configuration options for pagination hook
 */
export interface UsePaginationOptions {
  /** Initial page number (default: 1) */
  initialPage?: number
  /** Number of items per page (default: 50) */
  pageSize?: number
  /** Whether to sync pagination state with URL (default: true) */
  syncWithUrl?: boolean
  /** URL parameter name for page (default: 'page') */
  pageParam?: string
  /** Callback when page changes */
  onPageChange?: (page: number) => void
}

/**
 * Return type for usePagination hook
 */
export interface UsePaginationReturn {
  /** Current page number */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  total: number
  /** Total number of pages */
  totalPages: number
  /** Whether there are more pages */
  hasMore: boolean
  /** Go to specific page */
  setPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  previousPage: () => void
  /** Go to first page */
  firstPage: () => void
  /** Go to last page */
  lastPage: () => void
  /** Set total number of items (updates totalPages) */
  setTotal: (total: number) => void
  /** Get pagination data object */
  getPaginationData: () => PaginationData
}

/**
 * Custom hook for managing pagination state with URL synchronization
 * 
 * This hook provides:
 * - Page state management with URL sync
 * - Navigation functions (next, previous, first, last)
 * - Total items and pages calculation
 * - Automatic URL parameter updates
 * 
 * @param options - Configuration options for pagination
 * @returns Pagination state and control functions
 * 
 * @example
 * ```tsx
 * function DataTable() {
 *   const pagination = usePagination({
 *     pageSize: 20,
 *     onPageChange: (page) => fetchData(page)
 *   })
 * 
 *   useEffect(() => {
 *     fetchData(pagination.page)
 *   }, [pagination.page])
 * 
 *   return (
 *     <div>
 *       <Table data={data} />
 *       <button onClick={pagination.previousPage} disabled={pagination.page === 1}>
 *         Previous
 *       </button>
 *       <span>Page {pagination.page} of {pagination.totalPages}</span>
 *       <button onClick={pagination.nextPage} disabled={!pagination.hasMore}>
 *         Next
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    pageSize = 50,
    syncWithUrl = true,
    pageParam = 'page',
    onPageChange
  } = options

  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize page from URL if syncing
  const urlPage = syncWithUrl ? parseInt(searchParams.get(pageParam) || '1') : initialPage
  const [currentPage, setCurrentPage] = useState(Math.max(1, urlPage))
  const [total, setTotal] = useState(0)

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasMore = currentPage < totalPages

  /**
   * Update URL with new page number
   */
  const updateURL = useCallback((page: number) => {
    if (!syncWithUrl) return

    const newParams = new URLSearchParams(searchParams.toString())
    
    if (page > 1) {
      newParams.set(pageParam, page.toString())
    } else {
      newParams.delete(pageParam)
    }

    const queryString = newParams.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname
    router.push(newUrl, { scroll: false })
  }, [router, searchParams, syncWithUrl, pageParam])

  /**
   * Set page with validation and URL sync
   */
  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || page))
    setCurrentPage(validPage)
    updateURL(validPage)
    onPageChange?.(validPage)
  }, [totalPages, updateURL, onPageChange])

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage(currentPage + 1)
    }
  }, [currentPage, hasMore, setPage])

  /**
   * Navigate to previous page
   */
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1)
    }
  }, [currentPage, setPage])

  /**
   * Navigate to first page
   */
  const firstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  /**
   * Navigate to last page
   */
  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      setPage(totalPages)
    }
  }, [totalPages, setPage])

  /**
   * Get pagination data object
   */
  const getPaginationData = useCallback((): PaginationData => ({
    page: currentPage,
    pageSize,
    total,
    totalPages,
    hasMore
  }), [currentPage, pageSize, total, totalPages, hasMore])

  // Sync with URL changes
  useEffect(() => {
    if (syncWithUrl) {
      const urlPage = parseInt(searchParams.get(pageParam) || '1')
      if (urlPage !== currentPage && urlPage > 0) {
        setCurrentPage(urlPage)
      }
    }
  }, [searchParams, syncWithUrl, pageParam])

  return {
    page: currentPage,
    pageSize,
    total,
    totalPages,
    hasMore,
    setPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setTotal,
    getPaginationData
  }
}
