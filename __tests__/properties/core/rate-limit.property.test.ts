/**
 * Property-Based Tests for Rate Limiter
 *
 * Feature: rate-limiting, Property 1: Identifier Selection
 * Feature: rate-limiting, Property 2: Rate Limit Enforcement
 * Feature: rate-limiting, Property 5: Limit Hierarchy
 * Validates: Requirements 1.1, 1.2, 2.1, 2.3, 3.2, 3.3, 3.4
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { NextRequest } from 'next/server'
import {
  RateLimiter,
  MemoryRateLimitStore,
  getIdentifier,
  rateLimitPresets,
  getPresetForRoute,
} from '@/lib/core/rate-limit'
import type { RateLimitPreset } from '@/lib/core/rate-limit'

// Arbitraries for generating test data
const userIdArb = fc.uuid()
const ipAddressArb = fc.ipV4()

const routePatternArb = fc.constantFrom(
  '/api/auth/login',
  '/api/auth/register',
  '/api/admin/users',
  '/api/forms',
  '/api/forms/123',
  '/api/responses',
  '/api/certificates',
  '/api/user/profile',
  '/api/unknown/route'
)

// Helper to create mock NextRequest
function createMockRequest(realIp?: string, forwardedFor?: string): NextRequest {
  const headers = new Headers()
  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor)
  }
  if (realIp) {
    headers.set('x-real-ip', realIp)
  }

  return new NextRequest('http://localhost/api/test', { headers })
}

describe('Rate Limiter Properties', () => {
  let store: MemoryRateLimitStore

  beforeEach(() => {
    store = new MemoryRateLimitStore(0) // Disable auto-cleanup for tests
  })

  afterEach(() => {
    store.destroy()
  })

  /**
   * Feature: rate-limiting, Property 1: Identifier Selection
   * Validates: Requirements 1.1, 2.1
   *
   * For any request, if the request has a userId then the identifier
   * SHALL be `user:{userId}`, otherwise the identifier SHALL be `ip:{ipAddress}`.
   */
  describe('Property 1: Identifier Selection', () => {
    it('should use user:{userId} when userId is provided', () => {
      fc.assert(
        fc.property(userIdArb, ipAddressArb, (userId, ip) => {
          const req = createMockRequest(ip)
          const identifier = getIdentifier(req, userId)

          expect(identifier).toBe(`user:${userId}`)
          expect(identifier).not.toContain('ip:')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should use ip:{ipAddress} when userId is not provided', () => {
      fc.assert(
        fc.property(ipAddressArb, (ip) => {
          const req = createMockRequest(ip)
          const identifier = getIdentifier(req)

          expect(identifier).toBe(`ip:${ip}`)
          expect(identifier).not.toContain('user:')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should prefer x-forwarded-for header over x-real-ip', () => {
      fc.assert(
        fc.property(ipAddressArb, ipAddressArb, (forwardedIp, realIp) => {
          fc.pre(forwardedIp !== realIp) // Ensure they're different

          const req = createMockRequest(realIp, forwardedIp)
          const identifier = getIdentifier(req)

          expect(identifier).toBe(`ip:${forwardedIp}`)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should use first IP from x-forwarded-for when multiple present', () => {
      fc.assert(
        fc.property(
          fc.array(ipAddressArb, { minLength: 2, maxLength: 5 }),
          (ips) => {
            const forwardedFor = ips.join(', ')
            const req = createMockRequest(undefined, forwardedFor)
            const identifier = getIdentifier(req)

            expect(identifier).toBe(`ip:${ips[0]}`)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use "unknown" when no IP available', () => {
      const req = createMockRequest(undefined, undefined)
      const identifier = getIdentifier(req)

      expect(identifier).toBe('ip:unknown')
    })
  })

  /**
   * Feature: rate-limiting, Property 2: Rate Limit Enforcement
   * Validates: Requirements 1.2, 2.2
   *
   * For any sequence of N+1 requests from the same identifier within the window,
   * where N is the limit, the (N+1)th request SHALL return allowed: false.
   */
  describe('Property 2: Rate Limit Enforcement', () => {
    it('should allow requests up to the limit', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 20 }),
          userIdArb,
          async (limit, userId) => {
            const localStore = new MemoryRateLimitStore(0)
            const limiter = new RateLimiter(localStore, {
              windowMs: 60_000,
              maxRequests: limit,
            })

            const identifier = `user:${userId}`

            // Make exactly 'limit' requests
            for (let i = 0; i < limit; i++) {
              const result = await limiter.check(identifier)
              expect(result.allowed).toBe(true)
              expect(result.remaining).toBe(limit - i - 1)
            }

            localStore.destroy()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should block the (N+1)th request', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 20 }),
          userIdArb,
          async (limit, userId) => {
            const localStore = new MemoryRateLimitStore(0)
            const limiter = new RateLimiter(localStore, {
              windowMs: 60_000,
              maxRequests: limit,
            })

            const identifier = `user:${userId}`

            // Exhaust the limit
            for (let i = 0; i < limit; i++) {
              await limiter.check(identifier)
            }

            // The (N+1)th request should be blocked
            const result = await limiter.check(identifier)
            expect(result.allowed).toBe(false)
            expect(result.remaining).toBe(0)
            expect(result.retryAfter).toBeDefined()
            expect(result.retryAfter).toBeGreaterThan(0)

            localStore.destroy()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should track different identifiers independently', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          fc.array(userIdArb, { minLength: 2, maxLength: 5 }),
          async (limit, userIds) => {
            fc.pre(new Set(userIds).size === userIds.length) // Ensure unique

            const localStore = new MemoryRateLimitStore(0)
            const limiter = new RateLimiter(localStore, {
              windowMs: 60_000,
              maxRequests: limit,
            })

            // Exhaust limit for first user
            const firstUser = `user:${userIds[0]}`
            for (let i = 0; i < limit; i++) {
              await limiter.check(firstUser)
            }

            // First user should be blocked
            const firstResult = await limiter.check(firstUser)
            expect(firstResult.allowed).toBe(false)

            // Other users should still be allowed
            for (let i = 1; i < userIds.length; i++) {
              const result = await limiter.check(`user:${userIds[i]}`)
              expect(result.allowed).toBe(true)
            }

            localStore.destroy()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should include correct limit and remaining in result', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 5, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          userIdArb,
          async (limit, requestCount, userId) => {
            fc.pre(requestCount < limit)

            const localStore = new MemoryRateLimitStore(0)
            const limiter = new RateLimiter(localStore, {
              windowMs: 60_000,
              maxRequests: limit,
            })

            const identifier = `user:${userId}`

            // Make some requests
            for (let i = 0; i < requestCount - 1; i++) {
              await limiter.check(identifier)
            }

            const result = await limiter.check(identifier)
            expect(result.limit).toBe(limit)
            expect(result.remaining).toBe(limit - requestCount)
            expect(result.resetAt).toBeGreaterThan(Date.now())

            localStore.destroy()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Feature: rate-limiting, Property 5: Limit Hierarchy
   * Validates: Requirements 2.3, 3.2, 3.3, 3.4
   *
   * For any configuration, the limits SHALL follow:
   * authStrict < auth < write < default < read < authenticated
   */
  describe('Property 5: Limit Hierarchy', () => {
    it('should maintain limit hierarchy: authStrict < auth < write < default < read < authenticated', () => {
      const hierarchy: RateLimitPreset[] = ['authStrict', 'auth', 'write', 'default', 'read', 'authenticated']

      for (let i = 0; i < hierarchy.length - 1; i++) {
        const current = rateLimitPresets[hierarchy[i]]
        const next = rateLimitPresets[hierarchy[i + 1]]

        expect(current.maxRequests).toBeLessThan(next.maxRequests)
      }
    })

    it('should return correct preset for sensitive auth routes (authStrict)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('authStrict')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should return correct preset for other auth routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/auth/login', '/api/auth/logout', '/api/auth/session'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('auth')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should return correct preset for admin routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/admin/users', '/api/admin/forms', '/api/admin/settings'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('write')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should return correct preset for read routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/forms', '/api/forms/123', '/api/certificates', '/api/certificates/abc'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('read')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should return correct preset for write routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/responses', '/api/responses/123', '/api/user', '/api/user/profile'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('write')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should return default preset for unknown routes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/api/unknown', '/api/other/route', '/api/something'),
          (route) => {
            const preset = getPresetForRoute(route)
            expect(preset).toBe('default')
            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should have all presets with same window duration', () => {
      const presets = Object.values(rateLimitPresets)
      const windowMs = presets[0].windowMs

      for (const preset of presets) {
        expect(preset.windowMs).toBe(windowMs)
      }
    })
  })
})
