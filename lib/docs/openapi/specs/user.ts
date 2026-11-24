/**
 * OpenAPI Specification for User Endpoints
 *
 * Documents all user-related API endpoints including:
 * - User listing and management
 * - Profile operations
 * - Password management
 * - Authentication (register, forgot-password, reset-password)
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
 * User role enum
 */
export const RoleSchema = z.enum(['USER', 'ADMIN', 'CSA']).openapi({
  description: 'User role in the system',
  example: 'USER',
})

/**
 * Functional role enum
 */
export const FunctionalRoleSchema = z.enum([
  'DOCENTE',
  'DISCENTE',
  'EGRESSO',
  'TECNICO_UNIDADES_ENSINO',
  'TECNICO_COMPLEXO_HOSPITALAR',
]).openapi({
  description: 'Functional role of the user',
  example: 'DOCENTE',
})

/**
 * User schema for API responses
 */
export const UserSchema = z.object({
  id: z.string().cuid().openapi({ description: 'Unique user identifier' }),
  name: z.string().openapi({ description: 'User full name', example: 'João Silva' }),
  email: z.string().email().openapi({ description: 'User email address', example: 'joao@example.com' }),
  role: RoleSchema,
  functionalRoles: z.array(FunctionalRoleSchema).openapi({ description: 'List of functional roles' }),
  active: z.boolean().openapi({ description: 'Whether the user account is active' }),
  extraData: z.record(z.any()).optional().openapi({ description: 'Additional user data' }),
  createdAt: z.string().datetime().openapi({ description: 'Account creation timestamp' }),
  updatedAt: z.string().datetime().openapi({ description: 'Last update timestamp' }),
}).openapi('User')

/**
 * User profile schema (subset of user data)
 */
export const UserProfileSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  functionalRoles: z.array(FunctionalRoleSchema),
  extraData: z.record(z.any()).optional(),
}).openapi('UserProfile')

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * User registration request
 */
export const RegisterUserRequestSchema = z.object({
  name: z.string().min(2).max(100).openapi({ description: 'User full name', example: 'João Silva' }),
  email: z.string().email().openapi({ description: 'User email address', example: 'joao@example.com' }),
  password: z.string().min(6).openapi({ description: 'User password (min 6 characters)' }),
  userType: z.string().optional().openapi({ description: 'Comma-separated functional roles', example: 'DOCENTE,DISCENTE' }),
}).openapi('RegisterUserRequest')

/**
 * Forgot password request
 */
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().openapi({ description: 'User email address', example: 'joao@example.com' }),
}).openapi('ForgotPasswordRequest')

/**
 * Reset password request
 */
export const ResetPasswordRequestSchema = z.object({
  token: z.string().openapi({ description: 'Password reset token received via email' }),
  password: z.string().min(6).openapi({ description: 'New password (min 6 characters)' }),
}).openapi('ResetPasswordRequest')

/**
 * Update profile request
 */
export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(2).max(100).optional().openapi({ description: 'User full name' }),
  extraData: z.record(z.any()).optional().openapi({ description: 'Additional user data' }),
}).openapi('UpdateProfileRequest')

/**
 * Change password request
 */
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().openapi({ description: 'Current password' }),
  newPassword: z.string().min(6).openapi({ description: 'New password (min 6 characters)' }),
}).openapi('ChangePasswordRequest')

/**
 * Update user request (admin)
 */
export const UpdateUserRequestSchema = z.object({
  active: z.boolean().optional().openapi({ description: 'Whether the user account is active' }),
  role: RoleSchema.optional(),
  extraData: z.record(z.any()).optional().openapi({ description: 'Additional user data' }),
}).openapi('UpdateUserRequest')

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * User list filters
 */
export const UserFiltersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().openapi({ description: 'Page number', example: 1 }),
  pageSize: z.coerce.number().int().positive().max(100).optional().openapi({ description: 'Items per page', example: 10 }),
  search: z.string().optional().openapi({ description: 'Search term for name or email' }),
  role: RoleSchema.optional(),
  functionalRole: FunctionalRoleSchema.optional(),
  active: z.coerce.boolean().optional().openapi({ description: 'Filter by active status' }),
}).openapi('UserFiltersQuery')

// ============================================================================
// Path Parameter Schemas
// ============================================================================

/**
 * User ID path parameter
 */
export const UserIdParamSchema = z.object({
  id: z.string().cuid().openapi({ description: 'User ID' }),
}).openapi('UserIdParam')

// ============================================================================
// Response Schemas
// ============================================================================

const MessageResponseSchema = z.object({
  message: z.string(),
}).openapi('MessageResponse')

const UserCreatedResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
}).openapi('UserCreatedResponse')

// ============================================================================
// Endpoint Definitions
// ============================================================================

export const userEndpoints: EndpointDoc[] = [
  // -------------------------------------------------------------------------
  // Authentication Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/auth/register',
    method: 'POST',
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided information.',
    tags: ['Authentication'],
    auth: 'none',
    requestBody: RegisterUserRequestSchema,
    responses: {
      201: {
        description: 'User created successfully',
        schema: createSuccessResponseSchema(UserCreatedResponseSchema),
      },
      400: {
        description: 'Validation error',
        schema: createErrorResponseSchema(),
      },
      409: {
        description: 'Email already registered',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/auth/forgot-password',
    method: 'POST',
    summary: 'Request password reset',
    description: 'Sends a password reset email to the specified address if the account exists.',
    tags: ['Authentication'],
    auth: 'none',
    requestBody: ForgotPasswordRequestSchema,
    responses: {
      200: {
        description: 'Reset email sent (or user not found - same response for security)',
        schema: createSuccessResponseSchema(MessageResponseSchema),
      },
      400: {
        description: 'Validation error',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/auth/reset-password',
    method: 'POST',
    summary: 'Reset password with token',
    description: 'Resets the user password using a valid reset token.',
    tags: ['Authentication'],
    auth: 'none',
    requestBody: ResetPasswordRequestSchema,
    responses: {
      200: {
        description: 'Password reset successfully',
        schema: createSuccessResponseSchema(MessageResponseSchema),
      },
      400: {
        description: 'Invalid or expired token',
        schema: createErrorResponseSchema(),
      },
    },
  },

  // -------------------------------------------------------------------------
  // User Profile Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/user/profile',
    method: 'GET',
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
    tags: ['User Profile'],
    auth: 'required',
    responses: {
      200: {
        description: 'User profile retrieved successfully',
        schema: createSuccessResponseSchema(UserProfileSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/user/profile',
    method: 'PUT',
    summary: 'Update current user profile',
    description: 'Updates the profile of the currently authenticated user.',
    tags: ['User Profile'],
    auth: 'required',
    requestBody: UpdateProfileRequestSchema,
    responses: {
      200: {
        description: 'Profile updated successfully',
        schema: createSuccessResponseSchema(UserProfileSchema),
      },
      400: {
        description: 'Validation error',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/user/password',
    method: 'POST',
    summary: 'Change password',
    description: 'Changes the password of the currently authenticated user.',
    tags: ['User Profile'],
    auth: 'required',
    requestBody: ChangePasswordRequestSchema,
    responses: {
      200: {
        description: 'Password changed successfully',
        schema: createSuccessResponseSchema(MessageResponseSchema),
      },
      400: {
        description: 'Current password incorrect or validation error',
        schema: createErrorResponseSchema(),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
    },
  },

  // -------------------------------------------------------------------------
  // User List Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/user',
    method: 'GET',
    summary: 'List users',
    description: 'Returns a paginated list of users. Requires authentication.',
    tags: ['Users'],
    auth: 'required',
    responses: {
      200: {
        description: 'Users retrieved successfully',
        schema: createPaginatedResponseSchema(UserSchema),
      },
      401: {
        description: 'Not authenticated',
        schema: createErrorResponseSchema(),
      },
    },
  },

  // -------------------------------------------------------------------------
  // Admin User Management Endpoints
  // -------------------------------------------------------------------------
  {
    path: '/admin/users',
    method: 'GET',
    summary: 'List users (admin)',
    description: 'Returns a paginated list of users with filtering options. Requires admin role.',
    tags: ['Admin - Users'],
    auth: 'admin',
    queryParams: UserFiltersQuerySchema,
    responses: {
      200: {
        description: 'Users retrieved successfully',
        schema: createPaginatedResponseSchema(UserSchema),
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
    path: '/user/{id}',
    method: 'PATCH',
    summary: 'Update user (admin)',
    description: 'Updates a user by ID. Requires admin role.',
    tags: ['Admin - Users'],
    auth: 'admin',
    pathParams: UserIdParamSchema,
    requestBody: UpdateUserRequestSchema,
    responses: {
      200: {
        description: 'User updated successfully',
        schema: createSuccessResponseSchema(UserSchema),
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
        description: 'User not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/user/{id}',
    method: 'DELETE',
    summary: 'Delete user (admin)',
    description: 'Deletes a user by ID. Requires admin role.',
    tags: ['Admin - Users'],
    auth: 'admin',
    pathParams: UserIdParamSchema,
    responses: {
      200: {
        description: 'User deleted successfully',
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
        description: 'User not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
  {
    path: '/user/{id}/reset-password',
    method: 'POST',
    summary: 'Send password reset email (admin)',
    description: 'Sends a password reset email to the specified user. Requires admin role.',
    tags: ['Admin - Users'],
    auth: 'admin',
    pathParams: UserIdParamSchema,
    responses: {
      200: {
        description: 'Reset email sent successfully',
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
        description: 'User not found',
        schema: createErrorResponseSchema(),
      },
    },
  },
]
