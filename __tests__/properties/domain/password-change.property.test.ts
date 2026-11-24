/**
 * Property-Based Tests for Password Change Validation
 *
 * Feature: project-evolution-roadmap, Property 5: Password Change Validation
 * Validates: Requirements 1.3.2, 1.3.3
 *
 * For any password change attempt with incorrect current password, the operation
 * SHALL fail with ValidationError and the password SHALL remain unchanged.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { compare, hash } from 'bcryptjs'
import { UserService } from '@/lib/domain/user/user.service'
import type { IUserRepository, UserEntity } from '@/lib/domain/user/user.repository'
import { passwordArb, cuidArb } from '@/__tests__/utils/generators'
import { ValidationError, NotFoundError } from '@/lib/domain/errors'
import { Role } from '@prisma/client'

describe('Password Change Validation Properties', () => {
  let userService: UserService
  let mockRepository: IUserRepository
  let storedUsers: Map<string, UserEntity>

  beforeEach(() => {
    storedUsers = new Map()

    mockRepository = {
      findById: vi.fn().mockImplementation((id: string) => {
        const user = storedUsers.get(id)
        return Promise.resolve(user || null)
      }),
      findByEmail: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue({
        data: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      }),
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'test-id',
          ...data,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
      update: vi.fn().mockImplementation((id, data) =>
        Promise.resolve({ id, ...data })
      ),
      delete: vi.fn().mockResolvedValue(undefined),
      count: vi.fn().mockResolvedValue(0),
      updatePassword: vi.fn().mockImplementation(
        (id: string, hashedPassword: string) => {
          const user = storedUsers.get(id)
          if (user) {
            user.password = hashedPassword
            storedUsers.set(id, user)
          }
          return Promise.resolve()
        }
      ),
      setResetToken: vi.fn().mockResolvedValue(undefined),
      findByResetToken: vi.fn().mockResolvedValue(null),
      resetPassword: vi.fn().mockResolvedValue(undefined),
    }

    userService = new UserService(mockRepository)
  })

  /**
   * Helper to create a user with a known password
   */
  async function setupUser(
    userId: string,
    currentPassword: string
  ): Promise<{ user: UserEntity; hashedPassword: string }> {
    const hashedPassword = await hash(currentPassword, 10)
    const user: UserEntity = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'USER' as Role,
      functionalRoles: [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    storedUsers.set(userId, user)
    return { user, hashedPassword }
  }

  /**
   * Feature: project-evolution-roadmap, Property 5: Password Change Validation
   * Validates: Requirements 1.3.2, 1.3.3
   *
   * For any password change attempt with incorrect current password, the operation
   * SHALL fail with ValidationError and the password SHALL remain unchanged.
   */
  describe('Property 5: Password Change Validation', () => {
    it('should reject password change with incorrect current password', async () => {
      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb, // actual current password
          passwordArb, // wrong current password (provided by user)
          passwordArb, // new password
          async (userId, actualCurrentPassword, wrongCurrentPassword, newPassword) => {
            // Skip if the wrong password happens to match the actual password
            if (actualCurrentPassword === wrongCurrentPassword) return true

            // Setup: Create user with known password
            const { hashedPassword: originalHashedPassword } = await setupUser(
              userId,
              actualCurrentPassword
            )

            // Attempt to change password with wrong current password
            await expect(
              userService.changePassword(userId, wrongCurrentPassword, newPassword)
            ).rejects.toThrow(ValidationError)

            // Verify the error message
            try {
              await userService.changePassword(userId, wrongCurrentPassword, newPassword)
            } catch (error) {
              expect(error).toBeInstanceOf(ValidationError)
              expect((error as ValidationError).message).toBe('Senha atual incorreta')
            }

            // Verify password remains unchanged
            const user = storedUsers.get(userId)
            expect(user?.password).toBe(originalHashedPassword)

            // Original password should still work
            const isOriginalValid = await compare(actualCurrentPassword, user!.password)
            expect(isOriginalValid).toBe(true)

            return true
          }
        ),
        { numRuns: 50 } // Reduced runs due to async bcrypt operations
      )
    }, 60000) // 60 second timeout for bcrypt operations

    it('should successfully change password with correct current password', async () => {
      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb, // current password
          passwordArb, // new password
          async (userId, currentPassword, newPassword) => {
            // Setup: Create user with known password
            await setupUser(userId, currentPassword)

            // Change password with correct current password
            await userService.changePassword(userId, currentPassword, newPassword)

            // Verify the new password is stored correctly
            const user = storedUsers.get(userId)
            expect(user?.password).toBeDefined()

            // New password should be verifiable
            const isNewPasswordValid = await compare(newPassword, user!.password)
            expect(isNewPasswordValid).toBe(true)

            // Old password should NOT be valid anymore (unless they're the same)
            if (currentPassword !== newPassword) {
              const isOldPasswordValid = await compare(currentPassword, user!.password)
              expect(isOldPasswordValid).toBe(false)
            }

            return true
          }
        ),
        { numRuns: 30 } // Reduced runs due to async bcrypt operations
      )
    }, 60000)

    it('should reject password change for non-existent user', async () => {
      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb,
          passwordArb,
          async (userId, currentPassword, newPassword) => {
            // Ensure user doesn't exist
            storedUsers.clear()

            // Attempt to change password for non-existent user
            await expect(
              userService.changePassword(userId, currentPassword, newPassword)
            ).rejects.toThrow(NotFoundError)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should reject password change with weak password', async () => {
      // Generator for weak passwords (missing security requirements)
      const weakPasswordArb = fc.oneof(
        fc.constant('short'),           // Too short
        fc.constant('alllowercase1!'),  // No uppercase
        fc.constant('ALLUPPERCASE1!'),  // No lowercase
        fc.constant('NoNumbers!!'),     // No numbers
        fc.constant('NoSpecial123'),    // No special chars
      )

      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb, // valid current password
          weakPasswordArb, // invalid new password (weak)
          async (userId, currentPassword, weakNewPassword) => {
            // Setup: Create user with known password
            const { hashedPassword: originalHashedPassword } = await setupUser(
              userId,
              currentPassword
            )

            // Attempt to change password with weak new password
            await expect(
              userService.changePassword(userId, currentPassword, weakNewPassword)
            ).rejects.toThrow(ValidationError)

            // Verify the error message
            try {
              await userService.changePassword(userId, currentPassword, weakNewPassword)
            } catch (error) {
              expect(error).toBeInstanceOf(ValidationError)
              expect((error as ValidationError).message).toContain('requisitos de segurança')
            }

            // Verify password remains unchanged
            const user = storedUsers.get(userId)
            expect(user?.password).toBe(originalHashedPassword)

            return true
          }
        ),
        { numRuns: 50 }
      )
    }, 60000)

    it('should hash the new password (not store plain text)', async () => {
      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb,
          passwordArb,
          async (userId, currentPassword, newPassword) => {
            // Setup: Create user with known password
            await setupUser(userId, currentPassword)

            // Change password
            await userService.changePassword(userId, currentPassword, newPassword)

            // Get the stored password
            const user = storedUsers.get(userId)

            // Password should be hashed (not plain text)
            expect(user?.password).not.toBe(newPassword)

            // But should be verifiable
            const isValid = await compare(newPassword, user!.password)
            expect(isValid).toBe(true)

            return true
          }
        ),
        { numRuns: 20 } // Reduced due to bcrypt being slow
      )
    }, 120000) // 2 minute timeout for bcrypt operations

    it('should not modify password when validation fails before password check', async () => {
      await fc.assert(
        fc.asyncProperty(
          cuidArb,
          passwordArb,
          async (userId, currentPassword) => {
            // Setup: Create user with known password
            const { hashedPassword: originalHashedPassword } = await setupUser(
              userId,
              currentPassword
            )

            // Attempt to change password with empty new password
            await expect(
              userService.changePassword(userId, currentPassword, '')
            ).rejects.toThrow(ValidationError)

            // Verify password remains unchanged
            const user = storedUsers.get(userId)
            expect(user?.password).toBe(originalHashedPassword)

            return true
          }
        ),
        { numRuns: 30 } // Reduced due to bcrypt being slow
      )
    }, 90000) // 90 second timeout for bcrypt operations
  })
})
