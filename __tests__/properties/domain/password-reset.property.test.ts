/**
 * Property-Based Tests for Password Reset
 *
 * Feature: project-evolution-roadmap, Property 2: Password Reset Round-Trip
 * Validates: Requirements 1.2.1, 1.2.2
 *
 * Feature: project-evolution-roadmap, Property 3: Invalid Token Rejection
 * Validates: Requirements 1.2.3
 *
 * For any valid user email, generating a reset token and then using that token
 * to reset the password SHALL result in the new password being valid for authentication.
 *
 * For any invalid or expired reset token, attempting to reset password SHALL result
 * in a ValidationError.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { compare, hash } from 'bcryptjs'
import { UserService } from '@/lib/domain/user/user.service'
import type { IUserRepository, UserEntity } from '@/lib/domain/user/user.repository'
import { emailArb, nameArb, passwordArb } from '@/__tests__/utils/generators'
import { ValidationError } from '@/lib/domain/errors'
import { Role } from '@prisma/client'

describe('Password Reset Properties', () => {
  let userService: UserService
  let mockRepository: IUserRepository
  let storedTokens: Map<string, { token: string; expiry: Date; userId: string }>
  let storedPasswords: Map<string, string>

  beforeEach(() => {
    storedTokens = new Map()
    storedPasswords = new Map()

    mockRepository = {
      findById: vi.fn().mockImplementation((id: string) => {
        const password = storedPasswords.get(id)
        if (!password) return Promise.resolve(null)
        return Promise.resolve({
          id,
          name: 'Test User',
          email: 'test@example.com',
          password,
          role: 'USER' as Role,
          functionalRoles: [],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserEntity)
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
      updatePassword: vi.fn().mockResolvedValue(undefined),
      setResetToken: vi.fn().mockImplementation(
        (email: string, token: string, expiry: Date) => {
          // Store the token for later retrieval
          storedTokens.set(token, { token, expiry, userId: 'test-user-id' })
          return Promise.resolve()
        }
      ),
      findByResetToken: vi.fn().mockImplementation((token: string) => {
        const stored = storedTokens.get(token)
        if (!stored) return Promise.resolve(null)
        if (stored.expiry < new Date()) return Promise.resolve(null)
        const password = storedPasswords.get(stored.userId) || 'hashed-password'
        return Promise.resolve({
          id: stored.userId,
          name: 'Test User',
          email: 'test@example.com',
          password,
          role: 'USER' as Role,
          functionalRoles: [],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserEntity)
      }),
      resetPassword: vi.fn().mockImplementation(
        (id: string, hashedPassword: string) => {
          storedPasswords.set(id, hashedPassword)
          // Clear the token after password reset
          for (const [token, data] of storedTokens.entries()) {
            if (data.userId === id) {
              storedTokens.delete(token)
            }
          }
          return Promise.resolve()
        }
      ),
    }

    userService = new UserService(mockRepository)
  })

  /**
   * Feature: project-evolution-roadmap, Property 2: Password Reset Round-Trip
   * Validates: Requirements 1.2.1, 1.2.2
   *
   * For any valid user email, generating a reset token and then using that token
   * to reset the password SHALL result in the new password being valid for authentication.
   */
  describe('Property 2: Password Reset Round-Trip', () => {
    it('should allow password reset with valid token and new password should be verifiable', async () => {
      await fc.assert(
        fc.asyncProperty(
          nameArb,
          emailArb,
          passwordArb, // original password
          passwordArb, // new password
          async (name, email, originalPassword, newPassword) => {
            // Setup: Create a user with the original password
            const hashedOriginalPassword = await hash(originalPassword, 10)
            const userId = 'test-user-id'
            storedPasswords.set(userId, hashedOriginalPassword)

            // Mock findByEmail to return the user
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: userId,
              name,
              email,
              password: hashedOriginalPassword,
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Step 1: Generate reset token (Requirements 1.2.1)
            const { token } = await userService.generateResetToken(email)

            // Verify token was generated
            expect(token).toBeDefined()
            expect(typeof token).toBe('string')
            expect(token.length).toBeGreaterThan(0)

            // Step 2: Reset password with token (Requirements 1.2.2)
            await userService.resetPasswordWithToken(token, newPassword)

            // Step 3: Verify the new password is stored correctly
            const storedNewPassword = storedPasswords.get(userId)
            expect(storedNewPassword).toBeDefined()

            // The stored password should be different from the plain text new password (it's hashed)
            expect(storedNewPassword).not.toBe(newPassword)

            // The new password should be verifiable against the stored hash
            const isNewPasswordValid = await compare(newPassword, storedNewPassword!)
            expect(isNewPasswordValid).toBe(true)

            // The old password should NOT be valid anymore
            const isOldPasswordValid = await compare(originalPassword, storedNewPassword!)
            // Only check if passwords are different
            if (originalPassword !== newPassword) {
              expect(isOldPasswordValid).toBe(false)
            }

            return true
          }
        ),
        { numRuns: 20 } // Reduced runs due to async bcrypt operations
      )
    }, 120000) // 2 minute timeout for bcrypt operations

    it('should generate unique tokens for each reset request', async () => {
      await fc.assert(
        fc.asyncProperty(
          emailArb,
          nameArb,
          async (email, name) => {
            // Setup: Mock user exists
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: 'test-user-id',
              name,
              email,
              password: 'hashed-password',
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Generate multiple tokens
            const { token: token1 } = await userService.generateResetToken(email)
            const { token: token2 } = await userService.generateResetToken(email)

            // Tokens should be unique
            expect(token1).not.toBe(token2)

            return true
          }
        ),
        { numRuns: 30 }
      )
    })

    it('should return user info when generating reset token', async () => {
      await fc.assert(
        fc.asyncProperty(
          emailArb,
          nameArb,
          async (email, name) => {
            // Setup: Mock user exists
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: 'test-user-id',
              name,
              email,
              password: 'hashed-password',
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Generate token
            const result = await userService.generateResetToken(email)

            // Should return user info for email sending
            expect(result.user).toBeDefined()
            expect(result.user.name).toBe(name)
            expect(result.user.email).toBe(email)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should hash the new password during reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          emailArb,
          nameArb,
          passwordArb,
          async (email, name, newPassword) => {
            const userId = 'test-user-id'
            storedPasswords.set(userId, 'old-hashed-password')

            // Setup: Mock user exists
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: userId,
              name,
              email,
              password: 'old-hashed-password',
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Generate token and reset password
            const { token } = await userService.generateResetToken(email)
            await userService.resetPasswordWithToken(token, newPassword)

            // Get the stored password
            const storedPassword = storedPasswords.get(userId)

            // Password should be hashed (not plain text)
            expect(storedPassword).not.toBe(newPassword)

            // But should be verifiable
            const isValid = await compare(newPassword, storedPassword!)
            expect(isValid).toBe(true)

            return true
          }
        ),
        { numRuns: 20 } // Reduced due to bcrypt being slow
      )
    }, 120000) // 2 minute timeout for bcrypt operations
  })

  /**
   * Feature: project-evolution-roadmap, Property 3: Invalid Token Rejection
   * Validates: Requirements 1.2.3
   *
   * For any invalid or expired reset token, attempting to reset password SHALL
   * result in a ValidationError.
   */
  describe('Property 3: Invalid Token Rejection', () => {
    it('should reject password reset with invalid (non-existent) token', async () => {
      // Generator for random hex-like tokens (simulating tokens that were never generated)
      const hexChars = '0123456789abcdef'
      const invalidTokenArb = fc.array(
        fc.integer({ min: 0, max: hexChars.length - 1 }),
        { minLength: 32, maxLength: 64 }
      ).map(indices => indices.map(i => hexChars[i]).join(''))

      await fc.assert(
        fc.asyncProperty(
          invalidTokenArb,
          passwordArb, // Use valid password generator
          async (invalidToken: string, newPassword: string) => {
            // Ensure the token doesn't exist in our stored tokens
            storedTokens.clear()

            // Attempt to reset password with invalid token should throw ValidationError
            await expect(
              userService.resetPasswordWithToken(invalidToken, newPassword)
            ).rejects.toThrow(ValidationError)

            // Verify the error message
            try {
              await userService.resetPasswordWithToken(invalidToken, newPassword)
            } catch (error) {
              expect(error).toBeInstanceOf(ValidationError)
              expect((error as ValidationError).message).toBe('Token inválido ou expirado')
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject password reset with expired token', async () => {
      await fc.assert(
        fc.asyncProperty(
          emailArb,
          nameArb,
          passwordArb, // Use valid password generator
          async (email, name, newPassword) => {
            const userId = 'test-user-id'
            storedPasswords.set(userId, 'old-hashed-password')

            // Setup: Mock user exists
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: userId,
              name,
              email,
              password: 'old-hashed-password',
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Generate a valid token
            const { token } = await userService.generateResetToken(email)

            // Manually expire the token by setting its expiry to the past
            const storedToken = storedTokens.get(token)
            if (storedToken) {
              storedToken.expiry = new Date(Date.now() - 1000) // 1 second in the past
            }

            // Attempt to reset password with expired token should throw ValidationError
            await expect(
              userService.resetPasswordWithToken(token, newPassword)
            ).rejects.toThrow(ValidationError)

            // Verify the error message
            try {
              await userService.resetPasswordWithToken(token, newPassword)
            } catch (error) {
              expect(error).toBeInstanceOf(ValidationError)
              expect((error as ValidationError).message).toBe('Token inválido ou expirado')
            }

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should reject password reset with empty token', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArb,
          async (newPassword) => {
            // Empty token should be rejected
            await expect(
              userService.resetPasswordWithToken('', newPassword)
            ).rejects.toThrow(ValidationError)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should reject password reset with malformed tokens', async () => {
      // Generator for various malformed token formats
      const malformedTokenArb = fc.oneof(
        fc.constant(''),                                    // Empty string
        fc.constant('   '),                                 // Whitespace only
        fc.string({ minLength: 1, maxLength: 10 }),         // Too short
        fc.string({ minLength: 200, maxLength: 300 }),      // Too long
        fc.string({ minLength: 32, maxLength: 64 }),        // Random strings (may contain special chars)
      )

      await fc.assert(
        fc.asyncProperty(
          malformedTokenArb,
          passwordArb, // Use valid password generator
          async (malformedToken: string, newPassword: string) => {
            // Ensure no tokens exist
            storedTokens.clear()

            // Malformed tokens should be rejected
            await expect(
              userService.resetPasswordWithToken(malformedToken, newPassword)
            ).rejects.toThrow(ValidationError)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not allow token reuse after successful password reset', async () => {
      await fc.assert(
        fc.asyncProperty(
          emailArb,
          nameArb,
          passwordArb,
          passwordArb,
          async (email, name, firstNewPassword, secondNewPassword) => {
            const userId = 'test-user-id'
            storedPasswords.set(userId, 'old-hashed-password')

            // Setup: Mock user exists
            vi.mocked(mockRepository.findByEmail).mockResolvedValue({
              id: userId,
              name,
              email,
              password: 'old-hashed-password',
              role: 'USER' as Role,
              functionalRoles: [],
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as UserEntity)

            // Generate a valid token
            const { token } = await userService.generateResetToken(email)

            // First reset should succeed
            await userService.resetPasswordWithToken(token, firstNewPassword)

            // Second reset with same token should fail (token was consumed)
            await expect(
              userService.resetPasswordWithToken(token, secondNewPassword)
            ).rejects.toThrow(ValidationError)

            return true
          }
        ),
        { numRuns: 20 } // Reduced due to bcrypt being slow
      )
    }, 120000) // 2 minute timeout for bcrypt operations
  })
})
