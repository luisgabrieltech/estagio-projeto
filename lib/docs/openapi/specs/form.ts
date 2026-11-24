/**
 * OpenAPI Specification for Form Endpoints
 *
 * Documents all form-related API endpoints including:
 * - Form listing and retrieval
 * - Form creation and updates
 * - Form visibility and status management
 * - Admin form management
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
 * Form category enum
 */
export const CategorySchema = z.enum([
  'AUTOAVALIACAO',
  'AVALIACAO_DOCENTE',
  'AVALIACAO_INFRAESTRUTURA',
  'AVALIACAO_CURSO',
  'PESQUISA',
  'OUTRO',
]).openapi({
  description: 'Form category',
  example: 'AUTOAVALIACAO',
})

/**
 * Form status enum
 */
export const FormStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'ARCHIVED',
]).openapi({
  description: 'Internal form status',
  example: 'PUBLISHED',
})

/**
 * External status enum
 */
export const ExternalStatusSchema = z.enum([
  'ABERTO',
  'FECHADO',
  'EM_BREVE',
]).openapi({
  description: 'External visibility status',
  example: 'ABERTO',
})

/**
 * Question type enum
 */
export const QuestionTypeSchema = z.enum([
  'MULTIPLE_CHOICE',
  'CHECKBOX',
  'TEXT',
  'SCALE',
  'GRID',
  'DROPDOWN',
  'SECTION',
]).openapi({
  description: 'Type of question',
  example: 'MULTIPLE_CHOICE',
})

/**
 * Condition type enum
 */
export const ConditionTypeSchema = z.enum([
  'equals',
  'contains',
  'not_equals',
  'greater_than',
  'less_than',
]).openapi({
  description: 'Condition type for conditional logic',
})

/**
 * Conditional operator enum
 */
export const ConditionalOperatorSchema = z.enum(['AND', 'OR']).openapi({
  description: 'Logical operator for combining conditions',
})

/**
 * Condition schema
 */
export const ConditionSchema = z.object({
  type: ConditionTypeSchema,
  value: z.string().openapi({ description: 'Value to compare against' }),
}).openapi('Condition')

/**
 * Conditional rule schema
 */
export const ConditionalRuleSchema = z.object({
  dependsOn: z.string().openapi({ description: 'ID of the question this depends on' }),
  operator: ConditionalOperatorSchema,
  conditions: z.array(ConditionSchema),
}).openapi('ConditionalRule')

/**
 * Question schema
 */
export const QuestionSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique question identifier' }),
  customId: z.string().optional().nullable().openapi({ description: 'Custom identifier for the question' }),
  text: z.string().openapi({ description: 'Question text', example: 'Como você avalia o curso?' }),
  type: QuestionTypeSchema,
  required: z.boolean().openapi({ description: 'Whether the question is required' }),
  order: z.number().int().openapi({ description: 'Display order of the question' }),
  options: z.array(z.string()).openapi({ description: 'Options for multiple choice questions' }),
  rows: z.array(z.string()).openapi({ description: 'Row labels for grid questions' }),
  columns: z.array(z.string()).openapi({ description: 'Column labels for grid questions' }),
  conditional: ConditionalRuleSchema.optional().nullable(),
}).openapi('Question')

/**
 * Form schema for API responses
 */
export const FormSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique form identifier' }),
  title: z.string().openapi({ description: 'Form title', example: 'Avaliação Docente 2024' }),
  description: z.string().openapi({ description: 'Form description' }),
  category: CategorySchema,
  status: FormStatusSchema,
  externalStatus: ExternalStatusSchema.optional().nullable(),
  deadline: z.string().datetime().optional().nullable().openapi({ description: 'Form deadline' }),
  estimatedTime: z.string().optional().nullable().openapi({ description: 'Estimated completion time', example: '15 minutos' }),
  generatesCertificate: z.boolean().openapi({ description: 'Whether completing the form generates a certificate' }),
  certificateHours: z.string().optional().nullable().openapi({ description: 'Certificate hours', example: '4 horas' }),
  visibleToRoles: z.array(z.string()).openapi({ description: 'Functional roles that can see this form' }),
  visibleToUserIds: z.array(z.string()).openapi({ description: 'Specific user IDs that can see this form' }),
  questions: z.array(QuestionSchema).openapi({ description: 'Form questions' }),
  createdById: z.string().cuid().openapi({ description: 'ID of the user who created the form' }),
  createdAt: z.string().datetime().openapi({ description: 'Creation timestamp' }),
  updatedAt: z.string().datetime().openapi({ description: 'Last update timestamp' }),
}).openapi('Form')

/**
 * Form list item schema (without questions for list views)
 */
export const FormListItemSchema = FormSchema.omit({ questions: true }).openapi('FormListItem')

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Question input schema for creating/updating forms
 */
export const QuestionInputSchema = z.object({
  id: z.string().optional().openapi({ description: 'Question ID (for updates)' }),
  customId: z.string().optional().nullable().openapi({ description: 'Custom identifier' }),
  text: z.string().min(1).max(1000).openapi({ description: 'Question text' }),
  type: z.string().openapi({ description: 'Question type (multiple_choice, checkbox, text, scale, grid, dropdown, section)' }),
  required: z.boolean().optional().openapi({ description: 'Whether the question is required' }),
  options: z.array(z.string()).optional().openapi({ description: 'Options for choice questions' }),
  rows: z.array(z.string()).optional().openapi({ description: 'Row labels for grid questions' }),
  columns: z.array(z.string()).optional().openapi({ description: 'Column labels for grid questions' }),
  conditional: ConditionalRuleSchema.optional().nullable(),
}).openapi('QuestionInput')

/**
 * Create form request
 */
export const CreateFormRequestSchema = z.object({
  title: z.string().min(3).max(200).openapi({ description: 'Form title', example: 'Avaliação Docente 2024' }),
  description: z.string().min(10).max(2000).openapi({ description: 'Form description' }),
  category: z.string().openapi({ description: 'Form category' }),
  deadline: z.string().datetime().optional().openapi({ description: 'Form deadline' }),
  estimatedTime: z.string().optional().openapi({ description: 'Estimated completion time' }),
  generatesCertificate: z.boolean().optional().openapi({ description: 'Whether form generates certificate' }),
  certificateHours: z.string().optional().openapi({ description: 'Certificate hours' }),
  questions: z.array(QuestionInputSchema).optional().openapi({ description: 'Form questions' }),
}).openapi('CreateFormRequest')

/**
 * Update form request
 */
export const UpdateFormRequestSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Form ID to update' }),
  title: z.string().min(3).max(200).optional().openapi({ description: 'Form title' }),
  description: z.string().min(10).max(2000).optional().openapi({ description: 'Form description' }),
  category: z.string().optional().openapi({ description: 'Form category' }),
  status: FormStatusSchema.optional(),
  deadline: z.string().datetime().optional().nullable().openapi({ description: 'Form deadline' }),
  estimatedTime: z.string().optional().nullable().openapi({ description: 'Estimated completion time' }),
  generatesCertificate: z.boolean().optional().openapi({ description: 'Whether form generates certificate' }),
  certificateHours: z.string().optional().nullable().openapi({ description: 'Certificate hours' }),
  questions: z.array(QuestionInputSchema).optional().openapi({ description: 'Form questions' }),
}).openapi('UpdateFormRequest')

/**
 * Update form status request
 */
export const UpdateFormStatusRequestSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Form ID' }),
  status: FormStatusSchema,
}).openapi('UpdateFormStatusRequest')

/**
 * Update form visibility request
 */
export const UpdateFormVisibilityRequestSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Form ID' }),
  visibleToRoles: z.array(z.string()).openapi({ description: 'Functional roles that can see this form' }),
  status: ExternalStatusSchema.optional(),
}).openapi('UpdateFormVisibilityRequest')

/**
 * Delete form request
 */
export const DeleteFormRequestSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Form ID to delete' }),
}).openapi('DeleteFormRequest')

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Form list filters
 */
export const FormFiltersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().openapi({ description: 'Page number', example: 1 }),
  pageSize: z.coerce.number().int().positive().max(100).optional().openapi({ description: 'Items per page', example: 10 }),
  search: z.string().optional().openapi({ description: 'Search term for title or description' }),
  status: ExternalStatusSchema.optional(),
}).openapi('FormFiltersQuery')

/**
 * Form ID query parameter
 */
export const FormIdQuerySchema = z.object({
  id: z.string().cuid().optional().openapi({ description: 'Form ID to retrieve' }),
}).openapi('FormIdQuery')

// ============================================================================
// Response Schemas
// ============================================================================

const MessageResponseSchema = z.object({
  message: z.string(),
}).openapi('MessageResponse')

// ============================================================================
// Endpoint Definitions
// ============================================================================

export const formEndpoints: EndpointDoc[] = [
  // -------------------------------------------------------------------------
  // Public/User Form Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/forms',
    method: 'GET',
    summary: 'List forms or get form by ID',
    description: 'Returns a list of forms visible to the current user, or a specific form if ID is provided. Forms are filtered based on user functional roles.',
    tags: ['Forms'],
    auth: 'none',
    queryParams: FormIdQuerySchema,
    responses: {
      200: {
        description: 'Forms retrieved successfully',
        schema: createSuccessResponseSchema(z.union([FormSchema, z.array(FormListItemSchema)])),
      },
      404: {
        description: 'Form not found or not visible to user',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/forms',
    method: 'POST',
    summary: 'Create or update form',
    description: 'Creates a new form or updates an existing one if ID is provided. Requires admin role.',
    tags: ['Forms'],
    auth: 'admin',
    requestBody: z.union([CreateFormRequestSchema, UpdateFormRequestSchema]),
    responses: {
      200: {
        description: 'Form updated successfully',
        schema: createSuccessResponseSchema(FormSchema),
      },
      201: {
        description: 'Form created successfully',
        schema: createSuccessResponseSchema(FormSchema),
      },
      400: {
        description: 'Validation error',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin required)',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/forms',
    method: 'PATCH',
    summary: 'Update form status or visibility',
    description: 'Updates form status or visibility settings. Use action=visibility for visibility updates, action=external-status for external status, or no action for internal status.',
    tags: ['Forms'],
    auth: 'admin',
    queryParams: z.object({
      action: z.enum(['visibility', 'external-status']).optional().openapi({ description: 'Type of update action' }),
    }),
    requestBody: z.union([UpdateFormStatusRequestSchema, UpdateFormVisibilityRequestSchema]),
    responses: {
      200: {
        description: 'Form updated successfully',
        schema: createSuccessResponseSchema(FormSchema),
      },
      400: {
        description: 'Validation error',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/forms',
    method: 'DELETE',
    summary: 'Delete form',
    description: 'Deletes a form by ID. Requires admin role.',
    tags: ['Forms'],
    auth: 'admin',
    requestBody: DeleteFormRequestSchema,
    responses: {
      200: {
        description: 'Form deleted successfully',
        schema: createSuccessResponseSchema(MessageResponseSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin required)',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Form not found',
        schema: createErrorResponseSchema(),
      },
    },
  },

  // -------------------------------------------------------------------------
  // Admin Form Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/admin/forms',
    method: 'GET',
    summary: 'List forms (admin)',
    description: 'Returns a paginated list of all forms with filtering options. Requires admin role.',
    tags: ['Admin - Forms'],
    auth: 'admin',
    queryParams: FormFiltersQuerySchema,
    responses: {
      200: {
        description: 'Forms retrieved successfully',
        schema: createPaginatedResponseSchema(FormListItemSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized (admin required)',
        schema: createErrorResponseSchema(),
      },
    },
  },
]
