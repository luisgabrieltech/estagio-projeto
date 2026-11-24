/**
 * Form and Question type definitions
 * 
 * This file contains all TypeScript interfaces and types related to forms and questions.
 * These types are based on the Prisma schema and extend it with additional
 * frontend-specific properties.
 */

import type { Category, FormStatus, ExternalStatus, QuestionType } from "@prisma/client"

// Re-export Prisma enums for compatibility
export { Category as FormCategory, FormStatus, ExternalStatus as ExternalFormStatus, QuestionType } from "@prisma/client"

/**
 * Conditional operator enum
 * Used to combine multiple conditions
 */
export enum ConditionalOperator {
  AND = 'AND',
  OR = 'OR',
}

/**
 * Condition type enum
 * Represents the type of comparison for conditional logic
 */
export enum ConditionType {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
}

/**
 * Condition interface
 * Represents a single condition in conditional logic
 */
export interface Condition {
  /** Type of comparison */
  type: ConditionType
  
  /** Value to compare against */
  value: string
}

/**
 * Conditional rule interface
 * Defines when a question should be shown based on other questions
 */
export interface ConditionalRule {
  /** ID of the question this depends on */
  dependsOn: string
  
  /** Operator to combine multiple conditions */
  operator: ConditionalOperator
  
  /** List of conditions that must be met */
  conditions: Condition[]
}

/**
 * Question interface
 * Represents a question in a form
 */
export interface Question {
  /** Unique identifier */
  id: string
  
  /** Optional custom identifier for easier reference */
  customId?: string | null
  
  /** Question type */
  type: QuestionType
  
  /** Question text/title */
  text: string
  
  /** Optional description or help text */
  description?: string
  
  /** Whether this question is required */
  required: boolean
  
  /** Order/position in the form */
  order: number
  
  /** Options for multiple choice, checkbox, or dropdown questions */
  options: string[]
  
  /** Rows for grid questions */
  rows: string[]
  
  /** Columns for grid questions */
  columns: string[]
  
  /** Conditional logic rules */
  conditional: any
  
  /** ID of the form this question belongs to */
  formId: string
  
  /** Creation timestamp */
  createdAt: Date
  
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Question creation data
 * Used when creating a new question
 */
export interface QuestionCreateData {
  customId?: string
  type: QuestionType
  text: string
  description?: string
  required?: boolean
  order: number
  options?: string[]
  rows?: string[]
  columns?: string[]
  conditional?: ConditionalRule
  formId: string
}

/**
 * Question update data
 * Used when updating an existing question
 */
export interface QuestionUpdateData {
  customId?: string
  type?: QuestionType
  text?: string
  description?: string
  required?: boolean
  order?: number
  options?: string[]
  rows?: string[]
  columns?: string[]
  conditional?: ConditionalRule
}

/**
 * Question validation result
 * Used to validate question configuration
 */
export interface QuestionValidationResult {
  /** Whether the question is valid */
  isValid: boolean
  
  /** List of validation errors */
  errors: string[]
}

/**
 * Question with responses
 * Extended question interface that includes response data
 */
export interface QuestionWithResponses extends Question {
  /** Number of responses received */
  responseCount: number
  
  /** Response distribution (for analytics) */
  responseDistribution?: Record<string, number>
}

/**
 * Form entity representing an evaluation form
 */
export interface Form {
  id: string
  title: string
  description: string
  category: Category
  status: FormStatus
  externalStatus: ExternalStatus
  deadline?: Date | null
  estimatedTime?: string | null
  generatesCertificate: boolean
  certificateHours?: string | null
  visibleToRoles: string[]
  visibleToUserIds: string[]
  createdAt: Date
  updatedAt: Date
  createdById: string
  questions?: Question[]
  respondentCount?: number
}

/**
 * Form with creator information
 */
export interface FormWithCreator extends Form {
  createdBy: {
    id: string
    name: string
    email: string
  }
}

/**
 * Form with statistics
 */
export interface FormWithStats {
  id: string
  title: string
  description: string
  category: string
  status: string
  externalStatus?: string
  deadline?: Date | null
  estimatedTime?: string | null
  generatesCertificate?: boolean
  totalResponses: number
  totalQuestions: number
  responseRate: number
  respondentCount?: number
  lastResponse?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: {
    name: string
    email: string
  }
}

/**
 * Form filters interface
 * Used for filtering forms in lists
 */
export interface FormFilters {
  /** Search query for title/description */
  search?: string
  
  /** Filter by status */
  status?: FormStatus | string
  
  /** Filter by external status */
  externalStatus?: ExternalStatus | string
  
  /** Filter by category */
  category?: Category | string
  
  /** Filter by certificate generation */
  generatesCertificate?: boolean
  
  /** Filter by creator */
  createdById?: string
  
  /** Filter by date range */
  dateFrom?: Date
  dateTo?: Date
  
  /** Pagination */
  page?: number
  pageSize?: number
}

/**
 * Form creation data
 * Used when creating a new form
 */
export interface FormCreateData {
  title: string
  description: string
  category: Category
  deadline?: Date
  estimatedTime?: string
  generatesCertificate?: boolean
  certificateHours?: string
  visibleToRoles?: string[]
  visibleToUserIds?: string[]
  questions?: Array<{
    customId?: string
    text: string
    type: QuestionType
    required: boolean
    options: string[]
    rows: string[]
    columns: string[]
    order: number
    conditional?: any
  }>
}

/**
 * Form update data
 * Used when updating an existing form
 */
export interface FormUpdateData {
  title?: string
  description?: string
  category?: Category
  status?: FormStatus
  externalStatus?: ExternalStatus
  deadline?: Date
  estimatedTime?: string
  generatesCertificate?: boolean
  certificateHours?: string
  visibleToRoles?: string[]
  visibleToUserIds?: string[]
  questions?: Array<{
    id?: string
    customId?: string
    text: string
    type: QuestionType
    required: boolean
    options: string[]
    rows: string[]
    columns: string[]
    order: number
    conditional?: any
  }>
}

/**
 * Form list item
 * Simplified form data for list views
 */
export interface FormListItem {
  id: string
  title: string
  description: string
  category: Category
  status: FormStatus
  externalStatus: ExternalStatus
  createdAt: Date
  deadline?: Date
  respondentCount?: number
  questionCount?: number
}
