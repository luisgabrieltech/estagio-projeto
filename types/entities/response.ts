import { QuestionType } from "@prisma/client"

/**
 * Response types for form response management
 * 
 * This module contains all types related to form responses,
 * including response entities, metrics, statistics, and analytics.
 * 
 * @module types/entities/response
 */

/**
 * Response entity representing a user's answer to a question
 * 
 * @example
 * ```typescript
 * const response: Response = {
 *   id: 'resp_123',
 *   userId: 'user_456',
 *   formId: 'form_789',
 *   questionId: 'q_001',
 *   value: 'Selected option A',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Response {
  /** Unique identifier for the response */
  id: string
  /** ID of the user who submitted the response */
  userId: string
  /** ID of the form this response belongs to */
  formId: string
  /** ID of the question being answered */
  questionId: string
  /** The response value (can be text, JSON for complex types) */
  value: string
  /** Timestamp when the response was created */
  createdAt: Date
  /** Timestamp when the response was last updated */
  updatedAt: Date
  /** Form details (optional, included when fetching user responses) */
  form?: {
    /** Form ID */
    id: string
    /** Form title */
    title: string
  }
}

/**
 * Response with user, form, and question details
 * Used when displaying responses with related entity information
 * 
 * @example
 * ```typescript
 * const detailedResponse: ResponseWithDetails = {
 *   id: 'resp_123',
 *   value: 'Option A',
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   user: { id: 'user_1', name: 'John', email: 'john@example.com', functionalRoles: ['Docente'] },
 *   form: { id: 'form_1', title: 'Survey', category: 'DOCENTES' },
 *   question: { id: 'q_1', text: 'Rate your experience', type: 'SCALE', required: true }
 * }
 * ```
 */
export interface ResponseWithDetails {
  /** Unique identifier for the response */
  id: string
  /** The response value */
  value: string
  /** Timestamp when the response was created */
  createdAt: Date
  /** Timestamp when the response was last updated */
  updatedAt: Date
  /** User who submitted the response */
  user: {
    /** User ID */
    id: string
    /** User's display name */
    name: string
    /** User's email address */
    email: string
    /** User's functional roles */
    functionalRoles: string[]
  }
  /** Form the response belongs to */
  form: {
    /** Form ID */
    id: string
    /** Form title */
    title: string
    /** Form category */
    category: string
  }
  /** Question being answered */
  question: {
    /** Question ID */
    id: string
    /** Question text */
    text: string
    /** Question type */
    type: QuestionType
    /** Whether the question is required */
    required: boolean
  }
}

/**
 * Detailed response for individual viewing
 * Contains all responses from a single user for a form
 * 
 * @example
 * ```typescript
 * const detailed: DetailedResponse = {
 *   id: 'submission_123',
 *   user: { id: 'user_1', name: 'John', email: 'john@example.com', role: 'USER' },
 *   form: { id: 'form_1', title: 'Annual Survey' },
 *   responses: [{ questionId: 'q_1', questionText: 'Rate us', questionType: 'SCALE', value: '5', answeredAt: new Date() }],
 *   submittedAt: new Date(),
 *   timeSpent: 300,
 *   isComplete: true
 * }
 * ```
 */
export interface DetailedResponse {
  /** Unique identifier for the submission */
  id: string
  /** User information */
  user: {
    /** User ID */
    id: string
    /** User's display name */
    name: string
    /** User's email address */
    email: string
    /** User's campus (optional) */
    campus?: string
    /** User's course (optional) */
    course?: string
    /** User's role */
    role: string
  }
  /** Form information */
  form: {
    /** Form ID */
    id: string
    /** Form title */
    title: string
  }
  /** Array of individual question responses */
  responses: Array<{
    /** Question ID */
    questionId: string
    /** Question text */
    questionText: string
    /** Question type */
    questionType: string
    /** Response value */
    value: string
    /** When the question was answered */
    answeredAt: Date
  }>
  /** When the form was submitted */
  submittedAt: Date
  /** Time spent completing the form in seconds (optional) */
  timeSpent?: number
  /** Whether all required questions were answered */
  isComplete: boolean
}

/**
 * Filters for querying responses
 * Used to filter response data in API calls and UI components
 * 
 * @example
 * ```typescript
 * const filters: ResponseFilters = {
 *   formId: 'form_123',
 *   campus: ['Campus A', 'Campus B'],
 *   userRole: ['Docente'],
 *   completionStatus: 'complete',
 *   page: 1,
 *   pageSize: 50
 * }
 * ```
 */
export interface ResponseFilters {
  /** Filter by form ID */
  formId?: string
  /** Filter by user ID */
  userId?: string
  /** Filter by question ID */
  questionId?: string
  /** Filter by campus (multiple selection) */
  campus?: string[]
  /** Filter by course (multiple selection) */
  course?: string[]
  /** Filter by user role (multiple selection) */
  userRole?: string[]
  /** Filter by response date range */
  responseDate?: {
    /** Start date */
    from: Date
    /** End date */
    to: Date
  }
  /** Filter by response time range in seconds */
  responseTime?: {
    /** Minimum time */
    min: number
    /** Maximum time */
    max: number
  }
  /** Filter by completion status */
  completionStatus?: 'complete' | 'partial' | 'all'
  /** Search term for text search */
  searchTerm?: string
  /** Page number for pagination */
  page?: number
  /** Number of items per page */
  pageSize?: number
}

/**
 * Question statistics for analytics
 * Contains detailed statistics for a single question based on all responses
 * 
 * @example
 * ```typescript
 * const stats: QuestionStats = {
 *   questionId: 'q_123',
 *   questionText: 'How satisfied are you?',
 *   questionType: 'SCALE',
 *   isRequired: true,
 *   totalResponses: 150,
 *   skipRate: 5.2,
 *   scaleStats: { average: 4.2, median: 4, mode: 5, standardDeviation: 0.8, distribution: [...] }
 * }
 * ```
 */
export interface QuestionStats {
  /** Question ID */
  questionId: string
  /** Question text */
  questionText: string
  /** Question type (MULTIPLE_CHOICE, TEXT, SCALE, etc.) */
  questionType: string
  /** Whether the question is required */
  isRequired: boolean
  /** Total number of responses for this question */
  totalResponses: number
  /** Percentage of users who skipped this question */
  skipRate: number
  
  /** Statistics for multiple choice, checkbox, dropdown questions */
  optionStats?: Array<{
    /** Option text */
    option: string
    /** Number of times selected */
    count: number
    /** Percentage of total responses */
    percentage: number
  }>
  
  /** Analysis for text questions */
  textAnalysis?: {
    /** Average character length of responses */
    averageLength: number
    /** Total word count across all responses */
    totalWords: number
    /** Number of unique words */
    uniqueWords: number
    /** Word frequency data for word cloud visualization */
    wordCloud: Array<{ word: string; frequency: number; weight: number }>
    /** Common phrases found in responses */
    commonPhrases: Array<{ phrase: string; count: number }>
    /** Sentiment analysis results (optional) */
    sentimentAnalysis?: {
      /** Percentage of positive responses */
      positive: number
      /** Percentage of neutral responses */
      neutral: number
      /** Percentage of negative responses */
      negative: number
    }
  }
  
  /** Statistics for scale questions */
  scaleStats?: {
    /** Average value */
    average: number
    /** Median value */
    median: number
    /** Most common value */
    mode: number
    /** Standard deviation */
    standardDeviation: number
    /** Distribution of values */
    distribution: Array<{ value: number; count: number; percentage: number }>
  }
  
  /** Statistics for grid questions */
  gridStats?: {
    /** Statistics for each row */
    rowStats: Array<{
      /** Row label */
      rowLabel: string
      /** Responses for each column */
      responses: Array<{ column: string; count: number; percentage: number }>
    }>
    /** Total counts for each column */
    columnTotals: Array<{ column: string; total: number; percentage: number }>
  }
}

/**
 * Form metrics and analytics
 * Contains comprehensive metrics for a form's responses
 * 
 * @example
 * ```typescript
 * const metrics: FormMetrics = {
 *   overview: {
 *     totalResponses: 500,
 *     totalUsers: 450,
 *     responseRate: 75.5,
 *     averageTime: 12.5,
 *     completionRate: 92.0,
 *     avgResponsesPerDay: 15.2
 *   },
 *   demographics: { byCampus: [...], byCourse: [...], byRole: [...], byPeriod: [...] },
 *   timeline: [{ date: '2024-01-15', responses: 25, cumulative: 100 }]
 * }
 * ```
 */
export interface FormMetrics {
  /** Overview statistics */
  overview: {
    /** Total number of responses */
    totalResponses: number
    /** Total number of unique users who responded */
    totalUsers: number
    /** Response rate as percentage */
    responseRate: number
    /** Average time to complete in minutes */
    averageTime: number
    /** Completion rate as percentage */
    completionRate: number
    /** Average responses per day */
    avgResponsesPerDay: number
  }
  /** Demographic breakdown of responses */
  demographics: {
    /** Responses by campus */
    byCampus: Array<{ campus: string; count: number; percentage: number }>
    /** Responses by course */
    byCourse: Array<{ course: string; count: number; percentage: number }>
    /** Responses by user role */
    byRole: Array<{ role: string; count: number; percentage: number }>
    /** Responses by time period */
    byPeriod: Array<{ period: string; count: number }>
  }
  /** Timeline data for charts */
  timeline: Array<{ date: string; responses: number; cumulative: number }>
}

/**
 * Alias for FormMetrics for backward compatibility
 * @deprecated Use FormMetrics instead
 */
export type ResponseMetrics = FormMetrics

/**
 * Filter options available for responses
 * Contains available filter values with counts for UI display
 * 
 * @example
 * ```typescript
 * const options: FilterOptions = {
 *   campuses: [{ value: 'campus_a', label: 'Campus A', count: 150 }],
 *   courses: [{ value: 'cs', label: 'Computer Science', count: 75 }],
 *   roles: [{ value: 'docente', label: 'Docente', count: 200 }],
 *   dateRange: { earliest: new Date('2024-01-01'), latest: new Date('2024-12-31') }
 * }
 * ```
 */
export interface FilterOptions {
  /** Available campus options */
  campuses: Array<{ value: string; label: string; count: number }>
  /** Available course options */
  courses: Array<{ value: string; label: string; count: number }>
  /** Available role options */
  roles: Array<{ value: string; label: string; count: number }>
  /** Date range of available responses */
  dateRange: {
    /** Earliest response date */
    earliest: Date
    /** Latest response date */
    latest: Date
  }
}

/**
 * Comparison data for analytics
 * Used for comparing statistics across time periods or segments
 * 
 * @example
 * ```typescript
 * const comparison: ComparisonData = {
 *   byPeriod: {
 *     current: currentStats,
 *     previous: previousStats,
 *     change: 50,
 *     changePercent: 25.0
 *   },
 *   bySegment: [{ segment: 'Campus A', segmentType: 'campus', stats: campusStats }]
 * }
 * ```
 */
export interface ComparisonData {
  /** Period-over-period comparison */
  byPeriod: {
    /** Current period statistics */
    current: QuestionStats
    /** Previous period statistics */
    previous: QuestionStats
    /** Absolute change */
    change: number
    /** Percentage change */
    changePercent: number
  }
  /** Comparison by segment */
  bySegment: Array<{
    /** Segment name */
    segment: string
    /** Type of segment */
    segmentType: 'campus' | 'course' | 'role'
    /** Statistics for this segment */
    stats: QuestionStats
  }>
}

/**
 * Trend analysis data
 * Contains trend information for a specific question over time
 * 
 * @example
 * ```typescript
 * const trend: TrendAnalysis = {
 *   questionId: 'q_123',
 *   trend: 'increasing',
 *   trendPercent: 15.5,
 *   periodComparison: [
 *     { period: 'Q1 2024', value: 100, change: 10 },
 *     { period: 'Q2 2024', value: 115, change: 15 }
 *   ]
 * }
 * ```
 */
export interface TrendAnalysis {
  /** Question ID being analyzed */
  questionId: string
  /** Overall trend direction */
  trend: 'increasing' | 'decreasing' | 'stable'
  /** Percentage change over the analysis period */
  trendPercent: number
  /** Period-by-period comparison data */
  periodComparison: Array<{
    /** Period label */
    period: string
    /** Value for this period */
    value: number
    /** Change from previous period (optional) */
    change?: number
  }>
}

/**
 * Export configuration
 * Configuration options for exporting response data
 * 
 * @example
 * ```typescript
 * const config: ExportConfig = {
 *   format: 'excel',
 *   includeRawData: true,
 *   includeCharts: false,
 *   includeMetrics: true,
 *   filters: { campus: ['Campus A'] },
 *   anonymize: true
 * }
 * ```
 */
export interface ExportConfig {
  /** Export file format */
  format: 'excel' | 'csv' | 'pdf'
  /** Whether to include raw response data */
  includeRawData: boolean
  /** Whether to include charts (for PDF/Excel) */
  includeCharts: boolean
  /** Whether to include metrics summary */
  includeMetrics: boolean
  /** Filters to apply to exported data */
  filters: ResponseFilters
  /** Specific questions to include (optional, all if not specified) */
  selectedQuestions?: string[]
  /** Whether to anonymize user data */
  anonymize: boolean
}

/**
 * Export result
 * Result of an export operation with download information
 * 
 * @example
 * ```typescript
 * const result: ExportResult = {
 *   downloadUrl: '/api/exports/abc123',
 *   filename: 'responses_2024-01-15.xlsx',
 *   size: 1024000,
 *   generatedAt: new Date(),
 *   expiresAt: new Date(Date.now() + 3600000)
 * }
 * ```
 */
export interface ExportResult {
  /** URL to download the exported file */
  downloadUrl: string
  /** Suggested filename for download */
  filename: string
  /** File size in bytes */
  size: number
  /** When the export was generated */
  generatedAt: Date
  /** When the download link expires */
  expiresAt: Date
}

/**
 * Chart data for visualizations
 * Standard chart data structure compatible with Chart.js and similar libraries
 * 
 * @example
 * ```typescript
 * const chartData: ChartData = {
 *   labels: ['Jan', 'Feb', 'Mar'],
 *   datasets: [{
 *     label: 'Responses',
 *     data: [10, 25, 30],
 *     backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
 *   }]
 * }
 * ```
 */
export interface ChartData {
  /** Labels for x-axis or categories */
  labels: string[]
  /** Data series */
  datasets: Array<{
    /** Series label */
    label: string
    /** Data values */
    data: number[]
    /** Background colors (optional) */
    backgroundColor?: string[]
    /** Border colors (optional) */
    borderColor?: string[]
    /** Border width (optional) */
    borderWidth?: number
  }>
}

/**
 * Word cloud data
 * Data structure for word cloud visualizations
 * 
 * @example
 * ```typescript
 * const wordData: WordCloudData = {
 *   text: 'excellent',
 *   size: 24,
 *   color: '#3B82F6'
 * }
 * ```
 */
export interface WordCloudData {
  /** Word text */
  text: string
  /** Size/weight of the word (determines visual size) */
  size: number
  /** Color for display (optional) */
  color?: string
}

/**
 * Form details for response dashboard
 * Basic form information used in the responses page header
 * 
 * @example
 * ```typescript
 * const formDetails: FormDetails = {
 *   id: 'form_123',
 *   title: 'Annual Survey',
 *   description: 'Annual satisfaction survey',
 *   category: 'DOCENTES',
 *   status: 'ACTIVE',
 *   totalQuestions: 15,
 *   createdAt: new Date(),
 *   createdBy: { name: 'Admin', email: 'admin@example.com' }
 * }
 * ```
 */
export interface FormDetails {
  /** Form ID */
  id: string
  /** Form title */
  title: string
  /** Form description */
  description: string
  /** Form category */
  category: string
  /** Form status */
  status: string
  /** Form deadline (optional) */
  deadline?: Date
  /** Estimated time to complete (optional) */
  estimatedTime?: string
  /** Total number of questions */
  totalQuestions: number
  /** When the form was created */
  createdAt: Date
  /** User who created the form */
  createdBy: {
    /** Creator's name */
    name: string
    /** Creator's email */
    email: string
  }
}
