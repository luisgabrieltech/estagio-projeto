/**
 * Property-Based Tests for User Domain
 *
 * Feature: domain-layer, Property 1: Schema Validation Consistency (user)
 * Feature: domain-layer, Property 2: Password Hashing Integrity
 * Validates: Requirements 2.1, 5.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { compare, hash } from 'bcryptjs'
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  type CreateUserDTO,
} from '@/lib/domain/user/user.schema'
import { UserService } from '@/lib/domain/user/user.service'
import type { IUserRepository } from '@/lib/domain/user/user.repository'
import { Role, FunctionalRole } from '@prisma/client'

// Helper: Generate valid names (2-100 chars, non-whitespace only)
const validNameArb = fc
  .stringMatching(/^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s]{0,98}[a-zA-ZÀ-ÿ]?$/)
  .filter((s) => s.trim().length >= 2 && s.trim().length <= 100)
  .map((s) => s.trim())

// Helper: Generate valid email addresses that Zod will accept
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/),
    fc.stringMatching(/^[a-z]{2,10}$/),
    fc.constantFrom('com', 'org', 'net', 'edu', 'br', 'io')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

// Helper: Generate valid passwords (min 6 chars)
const validPasswordArb = fc.string({ minLength: 6, maxLength: 50 })

// Helper: Generate valid roles
const validRoleArb = fc.constantFrom(...Object.values(Role))

// Helper: Generate valid functional roles array
const validFunctionalRolesArb = fc.array(
  fc.constantFrom(...Object.values(FunctionalRole)),
  { minLength: 0, maxLength: 5 }
)

describe('User Domain Properties', () => {
  /**
   * Feature: domain-layer, Property 1: Schema Validation Consistency (user)
   * Validates: Requirements 2.1
   *
   * For any user data that conforms to the entity's constraints
   * (required fields present, correct types, valid ranges), the corresponding
   * Zod schema SHALL accept the data; otherwise, the schema SHALL reject
   * with appropriate error messages.
   */
  describe('Property 1: Schema Validation Consistency', () => {
    it('should accept all valid user creation data', () => {
      const validUserArb = fc.record({
        name: validNameArb,
        email: validEmailArb,
        password: validPasswordArb,
        role: fc.option(validRoleArb, { nil: undefined }),
        functionalRoles: fc.option(validFunctionalRolesArb, { nil: undefined }),
        extraData: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: undefined }),
      })

      fc.assert(
        fc.property(validUserArb, (data) => {
          const result = createUserSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject user creation data with name shorter than 2 characters', () => {
      const invalidUserArb = fc.record({
        name: fc.string({ maxLength: 1 }), // Too short
        email: validEmailArb,
        password: validPasswordArb,
      })

      fc.assert(
        fc.property(invalidUserArb, (data) => {
          const result = createUserSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should reject user creation data with name longer than 100 characters', () => {
      const invalidUserArb = fc.record({
        name: fc.string({ minLength: 101, maxLength: 150 }), // Too long
        email: validEmailArb,
        password: validPasswordArb,
      })

      fc.assert(
        fc.property(invalidUserArb, (data) => {
          const result = createUserSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should reject user creation data with invalid email format', () => {
      const invalidUserArb = fc.record({
        name: validNameArb,
        email: fc.string().filter((s) => !s.includes('@') || s.startsWith('@') || s.endsWith('@')),
        password: validPasswordArb,
      })

      fc.assert(
        fc.property(invalidUserArb, (data) => {
          const result = createUserSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should reject user creation data with password shorter than 6 characters', () => {
      const invalidUserArb = fc.record({
        name: validNameArb,
        email: validEmailArb,
        password: fc.string({ maxLength: 5 }), // Too short
      })

      fc.assert(
        fc.property(invalidUserArb, (data) => {
          const result = createUserSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should accept all valid user update data (partial fields)', () => {
      const validUpdateArb = fc.record({
        name: fc.option(validNameArb, { nil: undefined }),
        email: fc.option(validEmailArb, { nil: undefined }),
        role: fc.option(validRoleArb, { nil: undefined }),
        functionalRoles: fc.option(validFunctionalRolesArb, { nil: undefined }),
        active: fc.option(fc.boolean(), { nil: undefined }),
        extraData: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: undefined }),
      })

      fc.assert(
        fc.property(validUpdateArb, (data) => {
          const result = updateUserSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should accept empty object for user update (all fields optional)', () => {
      const result = updateUserSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept all valid user filter data', () => {
      const validFiltersArb = fc.record({
        search: fc.option(fc.string(), { nil: undefined }),
        role: fc.option(validRoleArb, { nil: undefined }),
        functionalRole: fc.option(fc.constantFrom(...Object.values(FunctionalRole)), { nil: undefined }),
        active: fc.option(fc.boolean(), { nil: undefined }),
        page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
        pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
      })

      fc.assert(
        fc.property(validFiltersArb, (data) => {
          const result = userFiltersSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject user filter data with pageSize greater than 100', () => {
      const invalidFiltersArb = fc.record({
        page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
        pageSize: fc.integer({ min: 101, max: 500 }), // Invalid: > 100
      })

      fc.assert(
        fc.property(invalidFiltersArb, (data) => {
          const result = userFiltersSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should normalize email to lowercase', () => {
      const mixedCaseEmailArb = fc
        .tuple(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{2,10}$/),
          fc.stringMatching(/^[a-zA-Z]{2,10}$/),
          fc.constantFrom('com', 'org', 'net')
        )
        .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

      fc.assert(
        fc.property(mixedCaseEmailArb, validNameArb, validPasswordArb, (email, name, password) => {
          const result = createUserSchema.safeParse({ name, email, password })
          if (!result.success) return true // Skip invalid cases
          return result.data.email === email.toLowerCase()
        }),
        { numRuns: 100 }
      )
    })

    it('should trim whitespace from name', () => {
      const nameWithWhitespaceArb = fc
        .tuple(
          fc.constant('  '),
          validNameArb,
          fc.constant('  ')
        )
        .map(([prefix, name, suffix]) => `${prefix}${name}${suffix}`)

      fc.assert(
        fc.property(nameWithWhitespaceArb, validEmailArb, validPasswordArb, (name, email, password) => {
          const result = createUserSchema.safeParse({ name, email, password })
          if (!result.success) return true // Skip invalid cases
          return result.data.name === name.trim()
        }),
        { numRuns: 100 }
      )
    })

    it('should provide Portuguese error messages for validation failures', () => {
      // Test missing required fields
      const resultMissingName = createUserSchema.safeParse({ email: 'test@test.com', password: '123456' })
      expect(resultMissingName.success).toBe(false)
      if (!resultMissingName.success) {
        const nameError = resultMissingName.error.errors.find((e) => e.path.includes('name'))
        expect(nameError?.message).toContain('Nome')
      }

      // Test invalid email
      const resultInvalidEmail = createUserSchema.safeParse({ name: 'Test', email: 'invalid', password: '123456' })
      expect(resultInvalidEmail.success).toBe(false)
      if (!resultInvalidEmail.success) {
        const emailError = resultInvalidEmail.error.errors.find((e) => e.path.includes('email'))
        expect(emailError?.message).toBe('Email inválido')
      }

      // Test short password
      const resultShortPassword = createUserSchema.safeParse({ name: 'Test', email: 'test@test.com', password: '123' })
      expect(resultShortPassword.success).toBe(false)
      if (!resultShortPassword.success) {
        const passwordError = resultShortPassword.error.errors.find((e) => e.path.includes('password'))
        expect(passwordError?.message).toContain('Senha')
      }
    })
  })

  /**
   * Feature: domain-layer, Property 2: Password Hashing Integrity
   * Validates: Requirements 5.1
   *
   * For any user created through UserService, the stored password SHALL be
   * different from the input password (hashed), and the hash SHALL be
   * verifiable against the original password using bcrypt.compare.
   */
  describe('Property 2: Password Hashing Integrity', () => {
    let userService: UserService
    let mockRepository: IUserRepository

    beforeEach(() => {
      mockRepository = {
        findById: vi.fn().mockResolvedValue(null),
        findByEmail: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue({ data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'test-id', ...data, createdAt: new Date(), updatedAt: new Date() })),
        update: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        delete: vi.fn().mockResolvedValue(undefined),
        count: vi.fn().mockResolvedValue(0),
        updatePassword: vi.fn().mockResolvedValue(undefined),
        setResetToken: vi.fn().mockResolvedValue(undefined),
        findByResetToken: vi.fn().mockResolvedValue(null),
        resetPassword: vi.fn().mockResolvedValue(undefined),
      }
      userService = new UserService(mockRepository)
    })

    it('should store hashed password different from input password', async () => {
      await fc.assert(
        fc.asyncProperty(validNameArb, validEmailArb, validPasswordArb, async (name, email, password) => {
          // Reset mock for each iteration
          vi.mocked(mockRepository.findByEmail).mockResolvedValue(null)
          let capturedPassword = ''
          vi.mocked(mockRepository.create).mockImplementation((data) => {
            capturedPassword = data.password
            return Promise.resolve({
              id: 'test-id',
              ...data,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          })

          await userService.createUser({
            name,
            email,
            password,
            role: Role.USER,
            functionalRoles: [],
          })

          // Password should be hashed (different from input)
          return capturedPassword !== password
        }),
        { numRuns: 20 } // Reduced runs due to async bcrypt operations
      )
    }, 30000) // 30 second timeout for bcrypt operations

    it('should produce verifiable hash using bcrypt.compare', async () => {
      await fc.assert(
        fc.asyncProperty(validNameArb, validEmailArb, validPasswordArb, async (name, email, password) => {
          // Reset mock for each iteration
          vi.mocked(mockRepository.findByEmail).mockResolvedValue(null)
          let capturedPassword = ''
          vi.mocked(mockRepository.create).mockImplementation((data) => {
            capturedPassword = data.password
            return Promise.resolve({
              id: 'test-id',
              ...data,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          })

          await userService.createUser({
            name,
            email,
            password,
            role: Role.USER,
            functionalRoles: [],
          })

          // Hash should be verifiable against original password
          const isValid = await compare(password, capturedPassword)
          return isValid === true
        }),
        { numRuns: 20 } // Reduced runs due to async bcrypt operations
      )
    }, 30000) // 30 second timeout for bcrypt operations

    it('should produce different hashes for different passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArb,
          validEmailArb,
          validPasswordArb,
          validPasswordArb.filter((p) => p.length >= 6),
          async (name, email, password1, password2) => {
            // Skip if passwords are the same
            if (password1 === password2) return true

            // Hash both passwords
            const hash1 = await hash(password1, 10)
            const hash2 = await hash(password2, 10)

            // Hashes should be different
            return hash1 !== hash2
          }
        ),
        { numRuns: 20 } // Reduced runs due to async bcrypt operations
      )
    }, 30000) // 30 second timeout for bcrypt operations

    it('should not verify hash against wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(
          validPasswordArb,
          validPasswordArb.filter((p) => p.length >= 6),
          async (correctPassword, wrongPassword) => {
            // Skip if passwords are the same
            if (correctPassword === wrongPassword) return true

            const hashedPassword = await hash(correctPassword, 10)

            // Wrong password should not verify
            const isValid = await compare(wrongPassword, hashedPassword)
            return isValid === false
          }
        ),
        { numRuns: 20 } // Reduced runs due to async bcrypt operations
      )
    }, 30000) // 30 second timeout for bcrypt operations

    it('should produce consistent verification for same password', async () => {
      await fc.assert(
        fc.asyncProperty(validPasswordArb, async (password) => {
          const hashedPassword = await hash(password, 10)

          // Multiple verifications should all succeed
          const results = await Promise.all([
            compare(password, hashedPassword),
            compare(password, hashedPassword),
            compare(password, hashedPassword),
          ])

          return results.every((r) => r === true)
        }),
        { numRuns: 15 } // Reduced runs due to async bcrypt operations
      )
    }, 30000) // 30 second timeout for bcrypt operations
  })
})
