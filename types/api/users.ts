/**
 * API Types for Users
 * 
 * Type definitions for user-related API responses.
 * 
 * @module types/api/users
 */

import type { User } from '@/types/entities/user'

/**
 * User profile API response
 */
export interface UserProfileResponse {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  extraData?: {
    avatar?: string
    course?: string
    campus?: string
    registration?: string
    department?: string
    functionalRoles?: string[]
  }
  createdAt: string
  updatedAt: string
}

/**
 * User list API response
 */
export interface UserListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * User response item (form responses by user)
 */
export interface UserResponseItem {
  id: string
  value: string
  createdAt: string
  form: {
    id: string
    title: string
  }
}

/**
 * User responses API response
 */
export interface UserResponsesResponse {
  responses: UserResponseItem[]
  total: number
}

/**
 * Update user role request
 */
export interface UpdateUserRoleRequest {
  role: 'ADMIN' | 'CSA' | 'USER'
}

/**
 * Update functional roles request
 */
export interface UpdateFunctionalRolesRequest {
  functionalRoles: string[]
}

/**
 * Reset password response
 */
export interface ResetPasswordResponse {
  success: boolean
  message: string
  temporaryPassword?: string
}
