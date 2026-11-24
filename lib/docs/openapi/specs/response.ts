/**
 * OpenAPI Specification for Response Endpoints
 *
 * Documents all response-related API endpoints including:
 * - Response submission
 * - User responses retrieval
 * - Admin response management
 * - Response statistics and metrics
 * - Response export
 *
 * @see Requirements 4.1.1, 4.1.2
 */

import { z } from 'zod'
import {
  EndpointDoc,
  createSuccessResponseSchema,
  createErrorResponseSchema,
  createPaginatedResponseSchema,
} from '../generator'

// ============================================================================
// Shared Schemas
// ============================================================================

/**
 * Response item schema
 */
export const ResponseItemSchema = z.object({
  formId: z.string().cuid().openapi({ description: 'Form ID' }),
  questionId: z.string().cuid().openapi({ description: 'Question ID' }),
  value: z.string().openapi({ description: 'Response value' }),
}).openapi('ResponseItem')

/**
 * Response schema for API responses
 */
export const ResponseSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique response identifier' }),
  formId: z.string().cuid().openapi({ description: 'Form ID' }),
  questionId: z.string().cuid().openapi({ description: 'Question ID' }),
  userId: z.string().cuid().openapi({ description: 'User ID who submitted the response' }),
  value: z.string().openapi({ description: 'Response value' }),
  createdAt: z.string().datetime().openapi({ description: 'Submission timestamp' }),
}).openapi('Response')

/**
 * Response with details schema (includes user and question info)
 */
export const ResponseWithDetailsSchema = ResponseSchema.extend({
  user: z.object({
    id: z.string().cuid(),
    name: z.string(),
    email: z.string().email(),
  }).openapi({ description: 'User who submitted the response' }),
  question: z.object({
    id: z.string().cuid(),
    text: z.string(),
    type: z.string(),
  }).optional().openapi({ description: 'Question details' }),
}).openapi('ResponseWithDetails')

/**
 * Form with stats schema
 */
export const FormWithStatsSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Form ID' }),
  title: z.string().openapi({ description: 'Form title' }),
  description: z.string().openapi({ description: 'Form description' }),
  status: z.string().openapi({ description: 'Form status' }),
  responseCount: z.number().int().openapi({ description: 'Total number of responses' }),
  uniqueRespondents: z.number().int().openapi({ description: 'Number of unique respondents' }),
  createdAt: z.string().datetime().openapi({ description: 'Form creation timestamp' }),
}).openapi('FormWithStats')

// ============================================================================
// Filter Options Schema
// ============================================================================

/**
 * Filter option schema
 */
export const FilterOptionSchema = z.object({
  value: z.string().openapi({ description: 'Filter value' }),
  label: z.string().openapi({ description: 'Display label' }),
  count: z.number().int().openapi({ description: 'Number of responses with this value' }),
}).openapi('FilterOption')

/**
 * Filter options schema
 */
export const FilterOptionsSchema = z.object({
  campuses: z.array(FilterOptionSchema).openapi({ description: 'Available campus filters' }),
  courses: z.array(FilterOptionSchema).openapi({ description: 'Available course filters' }),
  roles: z.array(FilterOptionSchema).openapi({ description: 'Available role filters' }),
  dateRange: z.object({
    earliest: z.string().datetime().openapi({ description: 'Earliest response date' }),
    latest: z.string().datetime().openapi({ description: 'Latest response date' }),
  }).openapi({ description: 'Date range of responses' }),
}).openapi('FilterOptions')

// ============================================================================
// Metrics Schema
// ============================================================================

/**
 * Demographics schema
 */
export const DemographicsSchema = z.object({
  byCampus: z.array(z.object({
    campus: z.string(),
    count: z.number().int(),
    percentage: z.number(),
  })),
  byCourse: z.array(z.object({
    course: z.string(),
    count: z.number().int(),
    percentage: z.number(),
  })),
  byRole: z.array(z.object({
    role: z.string(),
    count: z.number().int(),
    percentage: z.number(),
  })),
  byPeriod: z.array(z.object({
    period: z.string(),
    count: z.number().int(),
  })),
}).openapi('Demographics')

/**
 * Timeline entry schema
 */
export const TimelineEntrySchema = z.object({
  date: z.string().openapi({ description: 'Date (YYYY-MM-DD)' }),
  responses: z.number().int().openapi({ description: 'Responses on this date' }),
  cumulative: z.number().int().openapi({ description: 'Cumulative responses up to this date' }),
}).openapi('TimelineEntry')

/**
 * Form metrics schema
 */
export const FormMetricsSchema = z.object({
  overview: z.object({
    totalResponses: z.number().int().openapi({ description: 'Total number of responses' }),
    totalUsers: z.number().int().openapi({ description: 'Total active users' }),
    responseRate: z.number().openapi({ description: 'Response rate percentage' }),
    averageTime: z.number().openapi({ description: 'Average completion time in minutes' }),
    completionRate: z.number().openapi({ description: 'Completion rate percentage' }),
    avgResponsesPerDay: z.number().openapi({ description: 'Average responses per day' }),
  }),
  demographics: DemographicsSchema,
  timeline: z.array(TimelineEntrySchema),
}).openapi('FormMetrics')

// ============================================================================
// Statistics Schema
// ============================================================================

/**
 * Option stats schema
 */
export const OptionStatsSchema = z.object({
  option: z.string().openapi({ description: 'Option text' }),
  count: z.number().int().openapi({ description: 'Number of selections' }),
  percentage: z.number().openapi({ description: 'Percentage of total' }),
}).openapi('OptionStats')

/**
 * Text analysis schema
 */
export const TextAnalysisSchema = z.object({
  averageLength: z.number().openapi({ description: 'Average response length' }),
  totalWords: z.number().int().openapi({ description: 'Total word count' }),
  uniqueWords: z.number().int().openapi({ description: 'Unique word count' }),
  wordCloud: z.array(z.object({
    word: z.string(),
    frequency: z.number().int(),
    weight: z.number(),
  })),
  commonPhrases: z.array(z.string()),
}).openapi('TextAnalysis')

/**
 * Scale stats schema
 */
export const ScaleStatsSchema = z.object({
  average: z.number().openapi({ description: 'Average value' }),
  median: z.number().openapi({ description: 'Median value' }),
  mode: z.number().openapi({ description: 'Most common value' }),
  standardDeviation: z.number().openapi({ description: 'Standard deviation' }),
  distribution: z.array(z.object({
    value: z.number(),
    count: z.number().int(),
    percentage: z.number(),
  })),
}).openapi('ScaleStats')

/**
 * Grid stats schema
 */
export const GridStatsSchema = z.object({
  rowStats: z.array(z.object({
    rowLabel: z.string(),
    responses: z.array(z.object({
      column: z.string(),
      count: z.number().int(),
      percentage: z.number(),
    })),
  })),
  columnTotals: z.array(z.object({
    column: z.string(),
    total: z.number().int(),
    percentage: z.number(),
  })),
}).openapi('GridStats')

/**
 * Question stats schema
 */
export const QuestionStatsSchema = z.object({
  questionId: z.string().cuid().openapi({ description: 'Question ID' }),
  questionText: z.string().openapi({ description: 'Question text' }),
  questionType: z.string().openapi({ description: 'Question type' }),
  isRequired: z.boolean().openapi({ description: 'Whether question is required' }),
  totalResponses: z.number().int().openapi({ description: 'Total responses for this question' }),
  skipRate: z.number().openapi({ description: 'Percentage of users who skipped this question' }),
  optionStats: z.array(OptionStatsSchema).optional(),
  textAnalysis: TextAnalysisSchema.optional(),
  scaleStats: ScaleStatsSchema.optional(),
  gridStats: GridStatsSchema.optional(),
}).openapi('QuestionStats')

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Submit responses request
 */
export const SubmitResponsesRequestSchema = z.object({
  responses: z.array(ResponseItemSchema).min(1).openapi({ description: 'Array of responses to submit' }),
}).openapi('SubmitResponsesRequest')

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * User responses query
 */
export const UserResponsesQuerySchema = z.object({
  user: z.literal('me').openapi({ description: 'Must be "me" to get current user responses' }),
}).openapi('UserResponsesQuery')

/**
 * Admin responses filters
 */
export const AdminResponsesFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().openapi({ description: 'Page number', example: 1 }),
  pageSize: z.coerce.number().int().positive().max(100).optional().openapi({ description: 'Items per page', example: 10 }),
  formId: z.string().cuid().optional().openapi({ description: 'Filter by form ID' }),
  userId: z.string().cuid().optional().openapi({ description: 'Filter by user ID' }),
}).openapi('AdminResponsesFilters')

/**
 * Response filters for metrics/statistics/export
 */
export const ResponseFiltersSchema = z.object({
  campus: z.string().optional().openapi({ description: 'Comma-separated campus values' }),
  course: z.string().optional().openapi({ description: 'Comma-separated course values' }),
  role: z.string().optional().openapi({ description: 'Comma-separated role values' }),
  dateFrom: z.string().datetime().optional().openapi({ description: 'Filter responses from this date' }),
  dateTo: z.string().datetime().optional().openapi({ description: 'Filter responses until this date' }),
}).openapi('ResponseFilters')

/**
 * Export query parameters
 */
export const ExportQuerySchema = ResponseFiltersSchema.extend({
  format: z.enum(['csv', 'excel']).optional().openapi({ description: 'Export format', example: 'csv' }),
  includeMetrics: z.coerce.boolean().optional().openapi({ description: 'Include raw values in export' }),
  includePersonalData: z.coerce.boolean().optional().openapi({ description: 'Include user personal data' }),
  questionIds: z.string().optional().openapi({ description: 'Comma-separated question IDs to include' }),
}).openapi('ExportQuery')

// ============================================================================
// Path Parameter Schemas
// ============================================================================

/**
 * Form ID path parameter
 */
export const FormIdParamSchema = z.object({
  formId: z.string().cuid().openapi({ description: 'Form ID' }),
}).openapi('FormIdParam')

// ============================================================================
// Response Schemas
// ============================================================================

const MessageResponseSchema = z.object({
  message: z.string(),
}).openapi('MessageResponse')

// ============================================================================
// Endpoint Definitions
// ============================================================================

export const responseEndpoints: EndpointDoc[] = [
  // -------------------------------------------------------------------------
  // User Response Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/responses',
    method: 'POST',
    summary: 'Submit form responses',
    description: 'Submits responses for a form. If the form generates certificates, one will be created automatically.',
    tags: ['Responses'],
    auth: 'required',
    requestBody: SubmitResponsesRequestSchema,
    responses: {
      200: {
        description: 'Responses submitted successfully',
        schema: createSuccessResponseSchema(MessageResponseSchema),
      },
      400: {
        description: 'Validation error (no responses or invalid data)',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form or question not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/responses',
    method: 'GET',
    summary: 'Get current user responses',
    description: 'Returns all responses submitted by the current user. Use user=me query parameter.',
    tags: ['Responses'],
    auth: 'none',
    queryParams: UserResponsesQuerySchema,
    responses: {
      200: {
        description: 'Responses retrieved successfully',
        schema: createSuccessResponseSchema(z.array(ResponseSchema)),
      },
    },
  },

  // -------------------------------------------------------------------------
  // Admin Response Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/admin/responses',
    method: 'GET',
    summary: 'List responses (admin)',
    description: 'Returns a paginated list of responses with user details. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    queryParams: AdminResponsesFiltersSchema,
    responses: {
      200: {
        description: 'Responses retrieved successfully',
        schema: createPaginatedResponseSchema(ResponseWithDetailsSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/admin/responses/forms-stats',
    method: 'GET',
    summary: 'Get forms with response statistics',
    description: 'Returns all forms with their response counts and statistics. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    responses: {
      200: {
        description: 'Forms with stats retrieved successfully',
        schema: createSuccessResponseSchema(z.array(FormWithStatsSchema)),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/admin/responses/{formId}/filters',
    method: 'GET',
    summary: 'Get available filter options',
    description: 'Returns available filter options (campuses, courses, roles, date range) for a form. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    pathParams: FormIdParamSchema,
    responses: {
      200: {
        description: 'Filter options retrieved successfully',
        schema: createSuccessResponseSchema(FilterOptionsSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/admin/responses/{formId}/metrics',
    method: 'GET',
    summary: 'Get form response metrics',
    description: 'Returns detailed metrics and analytics for form responses including demographics and timeline. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    pathParams: FormIdParamSchema,
    queryParams: ResponseFiltersSchema,
    responses: {
      200: {
        description: 'Metrics retrieved successfully',
        schema: createSuccessResponseSchema(FormMetricsSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/admin/responses/{formId}/statistics',
    method: 'GET',
    summary: 'Get question statistics',
    description: 'Returns detailed statistics for each question in the form. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    pathParams: FormIdParamSchema,
    queryParams: ResponseFiltersSchema,
    responses: {
      200: {
        description: 'Statistics retrieved successfully',
        schema: createSuccessResponseSchema(z.array(QuestionStatsSchema)),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/admin/responses/{formId}/export',
    method: 'GET',
    summary: 'Export form responses',
    description: 'Exports form responses in CSV or Excel format. Requires admin or CSA role.',
    tags: ['Admin - Responses'],
    auth: 'admin',
    pathParams: FormIdParamSchema,
    queryParams: ExportQuerySchema,
    responses: {
      200: {
        description: 'Export file generated successfully (returns file download)',
      },
      400: {
        description: 'Invalid export format',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin or CSA required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
]
