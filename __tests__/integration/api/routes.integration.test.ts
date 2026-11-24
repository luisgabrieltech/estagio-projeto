/**
 * Integration Tests for API Routes
 *
 * Tests that API routes return correct response formats
 * and handle errors consistently.
 *
 * Validates: Requirements 3.1, 3.2, 5.5
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { success, paginated, created, noContent } from '@/lib/api/server-helpers'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/domain/errors'

// Mock session for auth helpers
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test: User routes return correct formats
   * Validates: Requirements 3.1, 5.5
   */
  describe('Response Format Consistency', () => {
    it('should return data wrapped in { data: T } for single resource', async () => {
      const userData = { id: '1', name: 'Test User', email: 'test@example.com' }
      const response = success(userData)
      const body = await response.json()

      expect(body).toHaveProperty('data')
      expect(body.data).toEqual(userData)
      expect(response.status).toBe(200)
    })

    it('should return paginated response with data and pagination', async () => {
      const users = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]
      const pagination = { page: 1, pageSize: 10, total: 2, totalPages: 1 }
      
      const response = paginated(users, pagination)
      const body = await response.json()

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('pagination')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.pagination).toEqual(pagination)
    })

    it('should return 201 for created resources', async () => {
      const newUser = { id: '1', name: 'New User' }
      const response = created(newUser)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.data).toEqual(newUser)
    })

    it('should return 204 for no content responses', () => {
      const response = noContent()
      expect(response.status).toBe(204)
      expect(response.body).toBeNull()
    })
  })

  /**
   * Test: Error responses are consistent
   * Validates: Requirements 3.2, 5.5
   * 
   * New standardized format: { success: false, error: { code, message, details? }, timestamp }
   */
  describe('Error Response Consistency', () => {
    it('should return validation error with correct format', async () => {
      const error = new ValidationError('Campo inválido', { email: ['Email inválido'] })
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR')
      expect(body.error).toHaveProperty('message')
      expect(body.error).toHaveProperty('details')
      expect(body).toHaveProperty('timestamp')
    })

    it('should return not found error with correct format', async () => {
      const error = new NotFoundError('Usuário', '123')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error).toHaveProperty('code', 'NOT_FOUND')
      expect(body.error).toHaveProperty('message')
      expect(body.error.message).toContain('Usuário')
      expect(body).toHaveProperty('timestamp')
    })

    it('should return forbidden error with correct format', async () => {
      const error = new ForbiddenError('Acesso negado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
      expect(body.error).toHaveProperty('code', 'FORBIDDEN')
      expect(body.error).toHaveProperty('message')
      expect(body).toHaveProperty('timestamp')
    })

    it('should return conflict error with correct format', async () => {
      const error = new ConflictError('Email já cadastrado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body.success).toBe(false)
      expect(body.error).toHaveProperty('code', 'CONFLICT')
      expect(body.error).toHaveProperty('message')
      expect(body).toHaveProperty('timestamp')
    })

    it('should return internal error for unknown errors', async () => {
      const error = new Error('Unexpected error')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.success).toBe(false)
      expect(body.error).toHaveProperty('code', 'INTERNAL_ERROR')
      expect(body.error).toHaveProperty('message')
      expect(body).toHaveProperty('timestamp')
    })
  })

  /**
   * Test: Form routes return correct formats
   * Validates: Requirements 3.1, 5.5
   */
  describe('Form Response Format', () => {
    it('should return form data in correct format', async () => {
      const formData = {
        id: '1',
        title: 'Test Form',
        description: 'A test form',
        questions: [],
      }
      const response = success(formData)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('title')
      expect(body.data).toHaveProperty('questions')
    })

    it('should return paginated forms list', async () => {
      const forms = [
        { id: '1', title: 'Form 1' },
        { id: '2', title: 'Form 2' },
      ]
      const pagination = { page: 1, pageSize: 10, total: 2, totalPages: 1 }
      
      const response = paginated(forms, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(2)
      expect(body.pagination.total).toBe(2)
    })
  })

  /**
   * Test: Response routes return correct formats
   * Validates: Requirements 3.1, 5.5
   */
  describe('Response Data Format', () => {
    it('should return response data in correct format', async () => {
      const responseData = {
        id: '1',
        formId: 'form-1',
        userId: 'user-1',
        answers: [],
      }
      const response = success(responseData)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('formId')
      expect(body.data).toHaveProperty('userId')
    })
  })

  /**
   * Test: Certificate routes return correct formats
   * Validates: Requirements 3.1, 5.5
   */
  describe('Certificate Response Format', () => {
    it('should return certificate data in correct format', async () => {
      const certificateData = {
        id: '1',
        formTitle: 'Test Form',
        completedAt: new Date().toISOString(),
      }
      const response = success(certificateData)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('formTitle')
      expect(body.data).toHaveProperty('completedAt')
    })
  })
})
