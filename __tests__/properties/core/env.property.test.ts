/**
 * Property-Based Tests for Environment Validation
 *
 * Feature: core-infrastructure, Property 4: Environment Validation Strictness
 * Validates: Requirements 4.1, 4.2, 4.3
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { envSchema } from '@/lib/core/env/env.schema'

// Valid base environment for testing
const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  NEXTAUTH_SECRET: 'a'.repeat(32), // 32 character minimum
  NEXTAUTH_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
}

// Arbitraries for generating test data
const validUrlArb = fc.constantFrom(
  'http://localhost:3000',
  'https://example.com',
  'postgresql://user:pass@localhost:5432/db',
  'https://app.example.com/path'
)

// Zod's URL validation is lenient - these are truly invalid URLs
const invalidUrlArb = fc.constantFrom(
  'not a url with spaces',
  '',
  '://missing-protocol',
  'http://',
  'just-text-no-protocol'
)

const validSecretArb = fc.string({ minLength: 32, maxLength: 100 })
const shortSecretArb = fc.string({ minLength: 1, maxLength: 31 })

const validNodeEnvArb = fc.constantFrom('development', 'production', 'test')
const invalidNodeEnvArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter((s) => !['development', 'production', 'test'].includes(s))

const validLogLevelArb = fc.constantFrom('debug', 'info', 'warn', 'error')
const invalidLogLevelArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter((s) => !['debug', 'info', 'warn', 'error'].includes(s))

const validEmailArb = fc.constantFrom(
  'test@example.com',
  'user@domain.org',
  'admin@company.co'
)

const invalidEmailArb = fc.constantFrom(
  'not-an-email',
  '@missing-local',
  'missing-at.com',
  'spaces in@email.com'
)

describe('Environment Validation Properties', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  /**
   * Feature: core-infrastructure, Property 4: Environment Validation Strictness
   * Validates: Requirements 4.1, 4.2, 4.3
   *
   * For any required environment variable that is missing or has invalid format,
   * the validation SHALL throw an error with descriptive message before the application starts.
   */
  describe('Property 4: Environment Validation Strictness', () => {
    it('should accept valid environment configurations', () => {
      fc.assert(
        fc.property(
          validUrlArb,
          validSecretArb,
          validUrlArb,
          validNodeEnvArb,
          validLogLevelArb,
          (dbUrl, secret, authUrl, nodeEnv, logLevel) => {
            const testEnv = {
              DATABASE_URL: dbUrl,
              NEXTAUTH_SECRET: secret,
              NEXTAUTH_URL: authUrl,
              NODE_ENV: nodeEnv,
              LOG_LEVEL: logLevel,
            }

            const result = envSchema.safeParse(testEnv)
            expect(result.success).toBe(true)

            if (result.success) {
              expect(result.data.DATABASE_URL).toBe(dbUrl)
              expect(result.data.NEXTAUTH_SECRET).toBe(secret)
              expect(result.data.NEXTAUTH_URL).toBe(authUrl)
              expect(result.data.NODE_ENV).toBe(nodeEnv)
              expect(result.data.LOG_LEVEL).toBe(logLevel)
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject missing required DATABASE_URL', () => {
      fc.assert(
        fc.property(
          validSecretArb,
          validUrlArb,
          (secret, authUrl) => {
            const testEnv = {
              // DATABASE_URL is missing
              NEXTAUTH_SECRET: secret,
              NEXTAUTH_URL: authUrl,
            }

            const result = envSchema.safeParse(testEnv)
            expect(result.success).toBe(false)

            if (!result.success) {
              const dbError = result.error.errors.find((e) => e.path.includes('DATABASE_URL'))
              expect(dbError).toBeDefined()
            }

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should reject invalid DATABASE_URL format', () => {
      fc.assert(
        fc.property(invalidUrlArb, (invalidUrl) => {
          const testEnv = {
            ...validEnv,
            DATABASE_URL: invalidUrl,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const dbError = result.error.errors.find((e) => e.path.includes('DATABASE_URL'))
            expect(dbError).toBeDefined()
            expect(dbError?.message).toContain('URL')
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject missing required NEXTAUTH_SECRET', () => {
      fc.assert(
        fc.property(validUrlArb, validUrlArb, (dbUrl, authUrl) => {
          const testEnv = {
            DATABASE_URL: dbUrl,
            // NEXTAUTH_SECRET is missing
            NEXTAUTH_URL: authUrl,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const secretError = result.error.errors.find((e) =>
              e.path.includes('NEXTAUTH_SECRET')
            )
            expect(secretError).toBeDefined()
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject NEXTAUTH_SECRET shorter than 32 characters', () => {
      fc.assert(
        fc.property(shortSecretArb, (shortSecret) => {
          const testEnv = {
            ...validEnv,
            NEXTAUTH_SECRET: shortSecret,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const secretError = result.error.errors.find((e) =>
              e.path.includes('NEXTAUTH_SECRET')
            )
            expect(secretError).toBeDefined()
            expect(secretError?.message).toContain('32')
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject missing required NEXTAUTH_URL', () => {
      fc.assert(
        fc.property(validUrlArb, validSecretArb, (dbUrl, secret) => {
          const testEnv = {
            DATABASE_URL: dbUrl,
            NEXTAUTH_SECRET: secret,
            // NEXTAUTH_URL is missing
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const urlError = result.error.errors.find((e) =>
              e.path.includes('NEXTAUTH_URL')
            )
            expect(urlError).toBeDefined()
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject invalid NEXTAUTH_URL format', () => {
      fc.assert(
        fc.property(invalidUrlArb, (invalidUrl) => {
          const testEnv = {
            ...validEnv,
            NEXTAUTH_URL: invalidUrl,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const urlError = result.error.errors.find((e) =>
              e.path.includes('NEXTAUTH_URL')
            )
            expect(urlError).toBeDefined()
            expect(urlError?.message).toContain('URL')
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject invalid NODE_ENV values', () => {
      fc.assert(
        fc.property(invalidNodeEnvArb, (invalidNodeEnv) => {
          const testEnv = {
            ...validEnv,
            NODE_ENV: invalidNodeEnv,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const nodeEnvError = result.error.errors.find((e) =>
              e.path.includes('NODE_ENV')
            )
            expect(nodeEnvError).toBeDefined()
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject invalid LOG_LEVEL values', () => {
      fc.assert(
        fc.property(invalidLogLevelArb, (invalidLogLevel) => {
          const testEnv = {
            ...validEnv,
            LOG_LEVEL: invalidLogLevel,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const logLevelError = result.error.errors.find((e) =>
              e.path.includes('LOG_LEVEL')
            )
            expect(logLevelError).toBeDefined()
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should reject invalid SMTP_FROM email format when provided', () => {
      fc.assert(
        fc.property(invalidEmailArb, (invalidEmail) => {
          const testEnv = {
            ...validEnv,
            SMTP_FROM: invalidEmail,
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(false)

          if (!result.success) {
            const emailError = result.error.errors.find((e) =>
              e.path.includes('SMTP_FROM')
            )
            expect(emailError).toBeDefined()
            expect(emailError?.message).toContain('email')
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should accept valid optional SMTP configuration', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 65535 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          validEmailArb,
          (host, port, user, pass, from) => {
            const testEnv = {
              ...validEnv,
              SMTP_HOST: host,
              SMTP_PORT: port.toString(),
              SMTP_USER: user,
              SMTP_PASSWORD: pass,
              SMTP_FROM: from,
            }

            const result = envSchema.safeParse(testEnv)
            expect(result.success).toBe(true)

            if (result.success) {
              expect(result.data.SMTP_HOST).toBe(host)
              expect(result.data.SMTP_PORT).toBe(port)
              expect(result.data.SMTP_USER).toBe(user)
              expect(result.data.SMTP_PASSWORD).toBe(pass)
              expect(result.data.SMTP_FROM).toBe(from)
            }

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should use default values for optional fields when not provided', () => {
      fc.assert(
        fc.property(validUrlArb, validSecretArb, validUrlArb, (dbUrl, secret, authUrl) => {
          const testEnv = {
            DATABASE_URL: dbUrl,
            NEXTAUTH_SECRET: secret,
            NEXTAUTH_URL: authUrl,
            // No optional fields provided
          }

          const result = envSchema.safeParse(testEnv)
          expect(result.success).toBe(true)

          if (result.success) {
            // Check defaults are applied
            expect(result.data.NODE_ENV).toBe('development')
            expect(result.data.LOG_LEVEL).toBe('info')
            expect(result.data.SMTP_PORT).toBe(587)
            expect(result.data.NEXT_PUBLIC_BASE_PATH).toBe('')
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should provide descriptive Portuguese error messages', () => {
      // Test that error messages are in Portuguese
      const testEnv = {
        DATABASE_URL: 'not-a-url',
        NEXTAUTH_SECRET: 'short',
        NEXTAUTH_URL: 'invalid',
      }

      const result = envSchema.safeParse(testEnv)
      expect(result.success).toBe(false)

      if (!result.success) {
        const messages = result.error.errors.map((e) => e.message)
        
        // Check for Portuguese messages
        const hasPortugueseMessages = messages.some(
          (msg) =>
            msg.includes('deve ser') ||
            msg.includes('obrigatória') ||
            msg.includes('válida') ||
            msg.includes('caracteres')
        )
        expect(hasPortugueseMessages).toBe(true)
      }
    })
  })
})
