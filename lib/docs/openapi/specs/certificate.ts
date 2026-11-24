/**
 * OpenAPI Specification for Certificate Endpoints
 *
 * Documents all certificate-related API endpoints including:
 * - Certificate listing
 * - Certificate validation
 * - Certificate download
 *
 * @see Requirements 4.1.1, 4.1.2
 */

import { z } from 'zod'
import {
  EndpointDoc,
  createSuccessResponseSchema,
  createErrorResponseSchema,
} from '../generator'

// ============================================================================
// Shared Schemas
// ============================================================================

/**
 * Certificate metadata schema
 */
export const CertificateMetadataSchema = z.object({
  completionDate: z.string().openapi({ description: 'Date when the form was completed' }),
  formTitle: z.string().openapi({ description: 'Title of the completed form' }),
  formDescription: z.string().optional().openapi({ description: 'Description of the form' }),
  userName: z.string().openapi({ description: 'Name of the certificate holder' }),
  userEmail: z.string().email().openapi({ description: 'Email of the certificate holder' }),
  workload: z.string().optional().openapi({ description: 'Certificate workload/hours', example: '4 horas' }),
}).openapi('CertificateMetadata')

/**
 * Certificate schema for API responses
 */
export const CertificateSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique certificate identifier' }),
  userId: z.string().cuid().openapi({ description: 'User ID who owns the certificate' }),
  formId: z.string().cuid().openapi({ description: 'Form ID that generated the certificate' }),
  validationCode: z.string().openapi({ description: 'Unique validation code for the certificate', example: 'ABC123XYZ' }),
  hash: z.string().openapi({ description: 'Certificate hash for integrity verification' }),
  metadata: CertificateMetadataSchema.optional(),
  issuedAt: z.string().datetime().openapi({ description: 'Certificate issue timestamp' }),
  createdAt: z.string().datetime().openapi({ description: 'Creation timestamp' }),
}).openapi('Certificate')

/**
 * Certificate list item schema (simplified for list views)
 */
export const CertificateListItemSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique certificate identifier' }),
  formTitle: z.string().openapi({ description: 'Title of the completed form' }),
  completedAt: z.string().datetime().openapi({ description: 'Completion timestamp' }),
}).openapi('CertificateListItem')

/**
 * Certificate validation result schema
 */
export const CertificateValidationResultSchema = z.object({
  isValid: z.literal(true).openapi({ description: 'Whether the certificate is valid' }),
  certificate: z.object({
    validationCode: z.string().openapi({ description: 'Certificate validation code' }),
    issuedAt: z.string().datetime().openapi({ description: 'Certificate issue date' }),
    formTitle: z.string().openapi({ description: 'Title printed on the certificate' }),
  }),
}).openapi('CertificateValidationResult')

// ============================================================================
// Path Parameter Schemas
// ============================================================================

/**
 * Certificate ID path parameter
 */
export const CertificateIdParamSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Certificate ID' }),
}).openapi('CertificateIdParam')

/**
 * Validation code path parameter
 */
export const ValidationCodeParamSchema = z.object({
  code: z.string().openapi({ description: 'Certificate validation code', example: 'ABC123XYZ' }),
}).openapi('ValidationCodeParam')

// ============================================================================
// Endpoint Definitions
// ============================================================================

export const certificateEndpoints: EndpointDoc[] = [
  // -------------------------------------------------------------------------
  // User Certificate Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/certificates',
    method: 'GET',
    summary: 'List user certificates',
    description: 'Returns all certificates for the currently authenticated user.',
    tags: ['Certificates'],
    auth: 'required',
    responses: {
      200: {
        description: 'Certificates retrieved successfully',
        schema: createSuccessResponseSchema(z.array(CertificateListItemSchema)),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/certificates/{id}/download',
    method: 'GET',
    summary: 'Download certificate PDF',
    description: 'Downloads the certificate PDF file. Only the certificate owner or an admin can download.',
    tags: ['Certificates'],
    auth: 'required',
    pathParams: CertificateIdParamSchema,
    responses: {
      200: {
        description: 'Certificate PDF file (returns file download)',
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
      403: {
        description: 'Not authorized to download this certificate',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Certificate or certificate data not found',
        schema: createErrorResponseSchema(),
      },
    },
  },

  // -------------------------------------------------------------------------
  // Public Certificate Validation
  // -------------------------------------------------------------------------
  {
    path: '/certificates/validate/{code}',
    method: 'GET',
    summary: 'Validate certificate',
    description: 'Validates a certificate by its validation code. This endpoint is public and does not require authentication.',
    tags: ['Certificates'],
    auth: 'none',
    pathParams: ValidationCodeParamSchema,
    responses: {
      200: {
        description: 'Certificate is valid',
        schema: createSuccessResponseSchema(CertificateValidationResultSchema),
      },
      400: {
        description: 'Invalid validation code format',
        schema: createErrorResponseSchema(),
      },
      404: {
        description: 'Certificate not found',
        schema: createErrorResponseSchema(),
      },
      429: {
        description: 'Certificate lookup limit exceeded',
        schema: createErrorResponseSchema(),
      },
    },
  },
]
