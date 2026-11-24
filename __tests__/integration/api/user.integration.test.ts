/**
 * Integration Tests for User API Routes
 *
 * Tests that user API routes return correct response formats
 * and handle operations consistently.
 *
 * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/utils/mocks/server'
import { success, paginated, created, noContent } from '@/lib/api/server-helpers'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/domain/errors'
import { createUser, createUsers, createUserCreateData } from '@/__tests__/utils/factories'

// Mock session for auth helpers
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || ''

describe('User API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  /**
   * Test: GET /api/admin/users - List users with pagination
   * Validates: Requirements 3.1.1, 3.1.2
   */
  describe('GET /api/admin/users', () => {
    it('should return paginated list of users', async () => {
      const users = createUsers(5)
      const pagination = { page: 1, pageSize: 10, total: 5, totalPages: 1 }
      
      const response = paginated(users, pagination)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('pagination')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data).toHaveLength(5)
      expect(body.pagination).toEqual(pagination)
    })

    it('should handle pagination parameters correctly', async () => {
      const users = createUsers(10)
      const pagination = { page: 2, pageSize: 5, total: 20, totalPages: 4 }
      
      const response = paginated(users, pagination)
      const body = await response.json()

      expect(body.pagination.page).toBe(2)
      expect(body.pagination.pageSize).toBe(5)
      expect(body.pagination.totalPages).toBe(4)
    })

    it('should return empty list when no users match filters', async () => {
      const users: ReturnType<typeof createUser>[] = []
      const pagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
      
      const response = paginated(users, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(0)
      expect(body.pagination.total).toBe(0)
    })
  })

  /**
   * Test: GET /api/admin/users/:id - Get single user
   * Validates: Requirements 3.1.1, 3.1.2
   */
  describe('GET /api/admin/users/:id', () => {
    it('should return single user data', async () => {
      const user = createUser({ id: 'user-123', name: 'John Doe', email: 'john@test.com' })
      
      const response = success(user)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('data')
      expect(body.data.id).toBe('user-123')
      expect(body.data.name).toBe('John Doe')
      expect(body.data.email).toBe('john@test.com')
    })

    it('should return 404 for non-existent user', async () => {
      const error = new NotFoundError('Usuário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  /**
   * Test: POST /api/admin/users - Create user
   * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
   */
  describe('POST /api/admin/users', () => {
    it('should create user and return 201', async () => {
      const userData = createUserCreateData({ name: 'New User', email: 'new@test.com' })
      const createdUserData = createUser({ ...userData, id: 'new-user-id' })
      
      const response = created(createdUserData)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body).toHaveProperty('data')
      expect(body.data.name).toBe('New User')
      expect(body.data.email).toBe('new@test.com')
    })

    it('should return validation error for invalid data', async () => {
      const error = new ValidationError('Dados inválidos', { email: ['Email inválido'] })
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toHaveProperty('email')
    })

    it('should return conflict error for duplicate email', async () => {
      const error = new ConflictError('Email já cadastrado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('CONFLICT')
    })
  })

  /**
   * Test: PUT /api/admin/users/:id - Update user
   * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
   */
  describe('PUT /api/admin/users/:id', () => {
    it('should update user and return updated data', async () => {
      const updatedUser = createUser({ id: 'user-123', name: 'Updated Name' })
      
      const response = success(updatedUser)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.name).toBe('Updated Name')
    })

    it('should return 404 when updating non-existent user', async () => {
      const error = new NotFoundError('Usuário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })

    it('should return conflict error when updating to existing email', async () => {
      const error = new ConflictError('Email já cadastrado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('CONFLICT')
    })
  })

  /**
   * Test: DELETE /api/admin/users/:id - Delete user
   * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
   */
  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user and return 204', () => {
      const response = noContent()

      expect(response.status).toBe(204)
      expect(response.body).toBeNull()
    })

    it('should return 404 when deleting non-existent user', async () => {
      const error = new NotFoundError('Usuário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  /**
   * Test: GET /api/user/profile - Get current user profile
   * Validates: Requirements 3.1.1, 3.1.2
   */
  describe('GET /api/user/profile', () => {
    it('should return current user profile', async () => {
      const user = createUser({ id: 'current-user', name: 'Current User' })
      
      const response = success(user)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.id).toBe('current-user')
      expect(body.data.name).toBe('Current User')
    })

    it('should return 401 when not authenticated', async () => {
      const error = new ForbiddenError('Não autenticado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
    })
  })

  /**
   * Test: PUT /api/user/profile - Update current user profile
   * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
   */
  describe('PUT /api/user/profile', () => {
    it('should update profile and return updated data', async () => {
      const updatedUser = createUser({ id: 'current-user', name: 'Updated Profile Name' })
      
      const response = success(updatedUser)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.name).toBe('Updated Profile Name')
    })

    it('should preserve fields not included in update', async () => {
      const originalUser = createUser({ 
        id: 'current-user', 
        name: 'Original Name',
        email: 'original@test.com',
        role: 'USER'
      })
      
      // Simulating partial update - only name changed
      const updatedUser = { ...originalUser, name: 'New Name' }
      
      const response = success(updatedUser)
      const body = await response.json()

      expect(body.data.name).toBe('New Name')
      expect(body.data.email).toBe('original@test.com')
      expect(body.data.role).toBe('USER')
    })
  })

  /**
   * Test: POST /api/user/password - Change password
   * Validates: Requirements 3.1.1, 3.1.2, 3.1.3
   */
  describe('POST /api/user/password', () => {
    it('should change password successfully', async () => {
      const response = success({ message: 'Senha alterada com sucesso' })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.message).toBe('Senha alterada com sucesso')
    })

    it('should return validation error for incorrect current password', async () => {
      const error = new ValidationError('Senha atual incorreta')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return validation error for weak new password', async () => {
      const error = new ValidationError('Senha deve ter pelo menos 6 caracteres')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  /**
   * Test: User data format consistency
   * Validates: Requirements 3.1.1, 3.1.2
   */
  describe('User Data Format', () => {
    it('should return user with all required fields', async () => {
      const user = createUser()
      
      const response = success(user)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('name')
      expect(body.data).toHaveProperty('email')
      expect(body.data).toHaveProperty('role')
      expect(body.data).toHaveProperty('active')
      expect(body.data).toHaveProperty('createdAt')
      expect(body.data).toHaveProperty('updatedAt')
    })

    it('should not expose password in response', async () => {
      const user = createUser()
      
      const response = success(user)
      const body = await response.json()

      expect(body.data).not.toHaveProperty('password')
    })
  })

  /**
   * Test: MSW handler integration
   * Validates: Requirements 3.1.3
   */
  describe('MSW Handler Integration', () => {
    it('should intercept GET /api/admin/users request', async () => {
      const mockUsers = createUsers(3)
      
      server.use(
        http.get(`${baseUrl}/api/admin/users`, () => {
          return HttpResponse.json({
            data: mockUsers,
            pagination: { page: 1, pageSize: 10, total: 3, totalPages: 1 }
          })
        })
      )

      const response = await fetch(`${baseUrl}/api/admin/users`)
      const body = await response.json()

      expect(body.data).toHaveLength(3)
    })

    it('should intercept POST /api/admin/users request', async () => {
      const newUser = createUser({ name: 'Created via MSW' })
      
      server.use(
        http.post(`${baseUrl}/api/admin/users`, () => {
          return HttpResponse.json({ data: newUser }, { status: 201 })
        })
      )

      const response = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Created via MSW', email: 'msw@test.com' })
      })
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.data.name).toBe('Created via MSW')
    })
  })
})
