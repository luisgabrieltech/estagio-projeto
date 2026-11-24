/**
 * API Types for Forms
 * 
 * Type definitions for form-related API responses.
 * 
 * @module types/api/forms
 */

import type { Question } from '@/types/entities/form'

/**
 * Form status enum
 */
export type FormStatus = 'AVAILABLE' | 'HIDDEN' | 'FROZEN' | 'SCHEDULED'

/**
 * Form API response
 */
export interface FormResponse {
  id: string
  title: string
  description: string
  status: FormStatus
  externalStatus: FormStatus
  questions: Question[]
  createdAt: string
  updatedAt: string
  startDate?: string
  endDate?: string
  targetAudience?: string[]
  /** Form category */
  category: string
  /** Total number of questions */
  totalQuestions: number
  /** User who created the form */
  createdBy: {
    name: string
    email: string
  }
}

/**
 * Form list item (simplified for lists)
 */
export interface FormListItem {
  id: string
  title: string
  description: string
  status: FormStatus
  externalStatus: FormStatus
  responseCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Form creation request
 */
export interface CreateFormRequest {
  title: string
  description: string
  questions: Omit<Question, 'id'>[]
  targetAudience?: string[]
  startDate?: string
  endDate?: string
}

/**
 * Form update request
 */
export interface UpdateFormRequest {
  title?: string
  description?: string
  questions?: Question[]
  status?: FormStatus
  targetAudience?: string[]
  startDate?: string
  endDate?: string
}

/**
 * Pending form for user dashboard
 */
export interface PendingForm {
  id: string
  title: string
  description: string
  externalStatus: FormStatus
}
