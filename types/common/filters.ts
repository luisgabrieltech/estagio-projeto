/**
 * Base filter interface with common filter properties
 */
export interface BaseFilters {
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from: Date
  to: Date
}

/**
 * Numeric range filter
 */
export interface NumericRangeFilter {
  min: number
  max: number
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string
  order: SortOrder
}

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'

/**
 * Generic filter condition
 */
export interface FilterCondition<T = any> {
  field: string
  operator: FilterOperator
  value: T
}

/**
 * Filter group with AND/OR logic
 */
export interface FilterGroup {
  operator: 'AND' | 'OR'
  conditions: (FilterCondition | FilterGroup)[]
}

/**
 * Advanced filter configuration
 */
export interface AdvancedFilters extends BaseFilters {
  sort?: SortConfig
  filters?: FilterGroup
}
