import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '@/lib/domain/user/user.service'
import type { IUserRepository } from '@/lib/domain/user/user.repository'
import { ConflictError, NotFoundError, ValidationError } from '@/lib/domain/errors'
import { Role } from '@prisma/client'

describe('UserService Unit Tests', () => {
  let userService: UserService
  let mockRepository: IUserRepository

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: Role.USER,
    functionalRoles: [],
    active: true,
    extraData: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    resetToken: null,
    resetTokenExpiry: null,
    ...overrides,
  })

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      updatePassword: vi.fn(),
      setResetToken: vi.fn(),
      findByResetToken: vi.fn(),
      resetPassword: vi.fn(),
    }
    userService = new UserService(mockRepository)
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const mockUser = createMockUser()
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null)
      vi.mocked(mockRepository.create).mockResolvedValue(mockUser)

      const result = await userService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
        functionalRoles: [],
      })

      expect(result.id).toBe('user-123')
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('should throw ConflictError when email already exists', async () => {
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(createMockUser())

      await expect(
        userService.createUser({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: Role.USER,
          functionalRoles: [],
        })
      ).rejects.toThrow(ConflictError)
    })

    it('should throw ValidationError for invalid email format', async () => {
      await expect(
        userService.createUser({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          role: Role.USER,
          functionalRoles: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for short password', async () => {
      await expect(
        userService.createUser({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
          role: Role.USER,
          functionalRoles: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for short name', async () => {
      await expect(
        userService.createUser({
          name: 'A',
          email: 'test@example.com',
          password: 'password123',
          role: Role.USER,
          functionalRoles: [],
        })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getUserById', () => {
    it('should return user without password', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockUser())

      const result = await userService.getUserById('user-123')

      expect(result).not.toHaveProperty('password')
      expect(result.id).toBe('user-123')
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(userService.getUserById('nonexistent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockRepository.update).mockResolvedValue(createMockUser({ name: 'Updated Name' }))

      const result = await userService.updateUser('user-123', { name: 'Updated Name' })

      expect(result.name).toBe('Updated Name')
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(
        userService.updateUser('nonexistent', { name: 'Updated Name' })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError when changing to existing email', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(createMockUser({ id: 'other-user' }))

      await expect(
        userService.updateUser('user-123', { email: 'existing@example.com' })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      await expect(userService.deleteUser('user-123')).resolves.toBeUndefined()
      expect(mockRepository.delete).toHaveBeenCalledWith('user-123')
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(userService.deleteUser('nonexistent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('changePassword', () => {
    it('should throw ValidationError for short new password', async () => {
      await expect(
        userService.changePassword('user-123', 'current', '123')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(
        userService.changePassword('nonexistent', 'current', 'NewPassword123!')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('registerUser', () => {
    it('should throw ValidationError when no functional roles provided', async () => {
      await expect(
        userService.registerUser({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          functionalRoles: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(
        userService.registerUser({
          name: '',
          email: 'test@example.com',
          password: 'password123',
          functionalRoles: ['Docente'],
        })
      ).rejects.toThrow(ValidationError)
    })
  })
})
