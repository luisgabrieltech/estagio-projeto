/**
 * Property-Based Tests for Profile Update Preservation
 *
 * Feature: project-evolution-roadmap, Property 4: Profile Update Preservation
 * Validates: Requirements 1.3.1
 *
 * For any user profile update with partial data, fields not included in the
 * update SHALL remain unchanged.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { UserService } from '@/lib/domain/user/user.service'
import type { IUserRepository, UserEntity } from '@/lib/domain/user/user.repository'
import { Role, FunctionalRole } from '@prisma/client'
import type { User } from '@/types/entities/user'

// Helper: Generate valid names (2-100 chars)
const validNameArb = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((s) => s.trim().length >= 2)
  .map((s) => s.trim())

// Helper: Generate valid email addresses
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/),
    fc.stringMatching(/^[a-z]{2,10}$/),
    fc.constantFrom('com', 'org', 'net', 'edu', 'br', 'io')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

// Helper: Generate valid roles
const validRoleArb = fc.constantFrom(...Object.values(Role))

// Helper: Generate valid functional roles array
const validFunctionalRolesArb = fc.array(
  fc.constantFrom(...Object.values(FunctionalRole)),
  { minLength: 0, maxLength: 5 }
)

// Helper: Generate extraData objects
const extraDataArb = fc.option(
  fc.record({
    registration: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    campus: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  }),
  { nil: undefined }
)

// Helper: Generate a complete user entity
const userEntityArb: fc.Arbitrary<UserEntity> = fc.record({
  id: fc.uuid(),
  name: validNameArb,
  email: validEmailArb,
  password: fc.string({ minLength: 60, maxLength: 60 }), // bcrypt hash length
  role: validRoleArb,
  functionalRoles: validFunctionalRolesArb,
  extraData: extraDataArb,
  active: fc.boolean(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
})

describe('Profile Update Preservation Properties', () => {
  let userService: UserService
  let mockRepository: IUserRepository
  let capturedUpdateData: Record<string, unknown>

  beforeEach(() => {
    capturedUpdateData = {}
    
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMany: vi.fn().mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      count: vi.fn().mockResolvedValue(0),
      updatePassword: vi.fn().mockResolvedValue(undefined),
      setResetToken: vi.fn().mockResolvedValue(undefined),
      findByResetToken: vi.fn().mockResolvedValue(null),
      resetPassword: vi.fn().mockResolvedValue(undefined),
    }
    
    userService = new UserService(mockRepository)
  })

  it('preserva o segmento existente ao salvar dados de perfil', async () => {
    const [existingUser] = fc.sample(userEntityArb, { seed: 5, numRuns: 1 })
    existingUser.extraData = { functionalRoles: ['DISCENTE'] }
    vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)

    await userService.updateProfileByEmail(existingUser.email, { extraData: { campus: 'Central' } })

    expect(mockRepository.update).toHaveBeenCalledWith(existingUser.id, {
      extraData: { campus: 'Central', functionalRoles: ['DISCENTE'] },
    })
  })

  /**
   * Feature: project-evolution-roadmap, Property 4: Profile Update Preservation
   * Validates: Requirements 1.3.1
   *
   * For any user profile update with partial data, fields not included in the
   * update SHALL remain unchanged.
   */
  describe('Property 4: Profile Update Preservation', () => {
    it('should preserve unchanged fields when updating only name', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          validNameArb,
          async (existingUser, newName) => {
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              capturedUpdateData = data
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined, // Repository returns user without password
              } as User)
            })

            // Update only the name
            await userService.updateProfileByEmail(existingUser.email, { name: newName })

            // Verify only name was passed to update
            expect(capturedUpdateData).toHaveProperty('name', newName)
            // extraData should not be in the update if not provided
            if (!('extraData' in capturedUpdateData) || capturedUpdateData.extraData === undefined) {
              return true
            }
            // If extraData was passed, it should be undefined (not provided)
            return capturedUpdateData.extraData === undefined
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve unchanged fields when updating only extraData', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          fc.record({
            registration: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            department: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          }),
          async (existingUser, newExtraData) => {
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              capturedUpdateData = data
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined,
              } as User)
            })

            // Update only extraData
            await userService.updateProfileByEmail(existingUser.email, { extraData: newExtraData })

            // Verify only extraData was passed to update
            expect(capturedUpdateData).toHaveProperty('extraData')
            // name should not be in the update if not provided
            return !('name' in capturedUpdateData) || capturedUpdateData.name === undefined
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve all fields when updating with empty object', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          async (existingUser) => {
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              capturedUpdateData = data
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined,
              } as User)
            })

            // Update with empty object
            await userService.updateProfileByEmail(existingUser.email, {})

            // Verify empty object was passed (no fields to update)
            const hasNoMeaningfulUpdates = Object.keys(capturedUpdateData).every(
              key => capturedUpdateData[key] === undefined
            )
            return Object.keys(capturedUpdateData).length === 0 || hasNoMeaningfulUpdates
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update both name and extraData when both are provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          validNameArb,
          fc.record({
            registration: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          }),
          async (existingUser, newName, newExtraData) => {
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              capturedUpdateData = data
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined,
              } as User)
            })

            // Update both name and extraData
            await userService.updateProfileByEmail(existingUser.email, {
              name: newName,
              extraData: newExtraData,
            })

            // Verify both fields were passed to update
            expect(capturedUpdateData).toHaveProperty('name', newName)
            expect(capturedUpdateData).toHaveProperty('extraData', newExtraData)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not modify user ID during profile update', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          validNameArb,
          async (existingUser, newName) => {
            let updateCalledWithId = ''
            
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              updateCalledWithId = id
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined,
              } as User)
            })

            // Update profile
            await userService.updateProfileByEmail(existingUser.email, { name: newName })

            // Verify update was called with correct user ID
            return updateCalledWithId === existingUser.id
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not modify email, role, or functionalRoles during profile update', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          validNameArb,
          async (existingUser, newName) => {
            // Setup mock to return existing user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              capturedUpdateData = data
              return Promise.resolve({
                ...existingUser,
                ...data,
                password: undefined,
              } as User)
            })

            // Update profile with name
            await userService.updateProfileByEmail(existingUser.email, { name: newName })

            // Verify sensitive fields are not in the update data
            const hasNoSensitiveFields = 
              !('email' in capturedUpdateData) &&
              !('role' in capturedUpdateData) &&
              !('functionalRoles' in capturedUpdateData) &&
              !('password' in capturedUpdateData) &&
              !('active' in capturedUpdateData)
            
            return hasNoSensitiveFields
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return updated user with preserved fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          userEntityArb,
          validNameArb,
          async (existingUser, newName) => {
            // Setup mock to return existing user and simulate update
            vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser)
            vi.mocked(mockRepository.update).mockImplementation((id, data) => {
              return Promise.resolve({
                id: existingUser.id,
                name: data.name ?? existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                functionalRoles: existingUser.functionalRoles,
                extraData: data.extraData ?? existingUser.extraData,
                active: existingUser.active,
                createdAt: existingUser.createdAt,
                updatedAt: new Date(),
              } as User)
            })

            // Update profile
            const result = await userService.updateProfileByEmail(existingUser.email, { name: newName })

            // Verify returned user has updated name but preserved other fields
            return (
              result.name === newName &&
              result.email === existingUser.email &&
              result.role === existingUser.role &&
              result.id === existingUser.id
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
