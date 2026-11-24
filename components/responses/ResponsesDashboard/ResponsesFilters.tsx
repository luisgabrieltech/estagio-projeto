"use client"

import { FilterPanel } from "../FilterPanel"
import { ResponseFilters, FilterOptions } from "@/types/entities/response"

/**
 * Props for the ResponsesFilters component
 */
export interface ResponsesFiltersProps {
  /** Current filter values */
  filters: ResponseFilters
  /** Available filter options */
  filterOptions: FilterOptions | null
  /** Callback when filters change */
  onFiltersChange: (filters: ResponseFilters) => void
  /** Whether filter options are loading */
  loading?: boolean
}

/**
 * Filter panel component for the responses dashboard
 * Wraps the common FilterPanel component with proper typing
 * 
 * @example
 * ```tsx
 * <ResponsesFilters
 *   filters={filters}
 *   filterOptions={filterOptions}
 *   onFiltersChange={handleFiltersChange}
 *   loading={filtersLoading}
 * />
 * ```
 */
export function ResponsesFilters({ 
  filters, 
  filterOptions, 
  onFiltersChange, 
  loading = false 
}: ResponsesFiltersProps) {
  return (
    <div className="mb-6">
      <FilterPanel
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={onFiltersChange}
        loading={loading}
      />
    </div>
  )
}
