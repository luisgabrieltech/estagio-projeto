"use client"

import { useState, useEffect } from "react"
import { ResponseFilters, FilterOptions } from "@/types/entities/response"
import { apiRequest } from "@/lib/utils/api-utils"

/**
 * Hook for managing response filters and filter options
 * 
 * @param formId - The ID of the form to fetch filter options for
 * @returns Object containing filters, filter options, loading state, and filter management functions
 * 
 * @example
 * ```tsx
 * const { 
 *   filters, 
 *   filterOptions, 
 *   loading, 
 *   updateFilters, 
 *   resetFilters 
 * } = useResponseFilters(formId)
 * 
 * // Update filters
 * updateFilters({ campus: ['Campus A'], userRole: ['Docente'] })
 * 
 * // Reset filters
 * resetFilters()
 * ```
 */
export function useResponseFilters(formId: string) {
  const [filters, setFilters] = useState<ResponseFilters>({
    campus: [],
    course: [],
    userRole: [],
    completionStatus: 'all'
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Builds a query string from the current filters
   * 
   * @param currentFilters - The filters to convert to query string
   * @returns URL query string
   */
  const buildQueryString = (currentFilters: ResponseFilters): string => {
    const params = new URLSearchParams()
    
    if (currentFilters.campus && currentFilters.campus.length > 0) {
      params.set('campus', currentFilters.campus.join(','))
    }
    if (currentFilters.course && currentFilters.course.length > 0) {
      params.set('course', currentFilters.course.join(','))
    }
    if (currentFilters.userRole && currentFilters.userRole.length > 0) {
      params.set('role', currentFilters.userRole.join(','))
    }
    if (currentFilters.responseDate?.from) {
      params.set('dateFrom', currentFilters.responseDate.from.toISOString())
    }
    if (currentFilters.responseDate?.to) {
      params.set('dateTo', currentFilters.responseDate.to.toISOString())
    }
    
    return params.toString()
  }

  /**
   * Fetches available filter options from the API
   */
  const fetchFilterOptions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiRequest<FilterOptions>(`admin/responses/${formId}/filters`)
      setFilterOptions(data)

    } catch (err) {
      console.error('Erro ao carregar opções de filtro:', err)
      setError('Erro ao carregar opções de filtro')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates the current filters
   * 
   * @param newFilters - The new filter values to apply
   */
  const updateFilters = (newFilters: ResponseFilters) => {
    setFilters(newFilters)
  }

  /**
   * Resets all filters to their default values
   */
  const resetFilters = () => {
    const emptyFilters: ResponseFilters = {
      campus: [],
      course: [],
      userRole: [],
      completionStatus: 'all'
    }
    setFilters(emptyFilters)
  }

  /**
   * Gets the count of active filters
   * 
   * @returns Number of active filters
   */
  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.campus && filters.campus.length > 0) count++
    if (filters.course && filters.course.length > 0) count++
    if (filters.userRole && filters.userRole.length > 0) count++
    if (filters.responseDate) count++
    if (filters.completionStatus && filters.completionStatus !== 'all') count++
    return count
  }

  // Fetch filter options when formId changes
  useEffect(() => {
    if (formId) {
      fetchFilterOptions()
    }
  }, [formId])

  return {
    filters,
    filterOptions,
    loading,
    error,
    updateFilters,
    resetFilters,
    buildQueryString,
    getActiveFilterCount,
    activeFilterCount: getActiveFilterCount()
  }
}
