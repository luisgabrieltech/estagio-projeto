/**
 * Property-Based Tests for Rate Limit Response Format
 *
 * Feature: rate-limiting, Property 3: Headers Presence
 * Feature: rate-limiting, Property 4: Response Format Consistency
 * Validates: Requirements 1.3, 4.1, 4.2, 4.3, 5.2
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { NextResponse } from 'next/server'
import {
  rateLimitExceededResponse,
  withRateLimitHeaders,
  RATE_LIMIT_ERROR_CODE,
} from '@/lib/api/rate-limit'
import { addRateLimitHeaders } from '@/lib/core/rate-limit'
import type { RateLimitResult } from '@/lib/core/rate-limit'

// Arbitrary for generating RateLimitResult
const rateLimitResultArb = (allowed: boolean): fc.Arbitrary<RateLimitResult> =>
  fc.record({
    allowed: fc.constant(allowed),
    limit: fc.integer({ min: 1, max: 1000 }),
    remaining: allowed
      ? fc.integer({ min: 0, max: 999 })
      : fc.constant(0),
    resetAt: fc.integer({ min: Date.now(), max: Date.now() + 120_000 }),
    retryAfter: allowed
      ? fc.constant(undefined)
      : fc.integer({ min: 1, max: 120 }),
  })

const blockedResultArb = rateLimitResultArb(false)
const allowedResultArb = rateLimitResultArb(true)

describe('Rate Limit Response Properties', () => {
  /**
   * Feature: rate-limiting, Property 3: Headers Presence
   * Validates: Requirements 1.3, 5.2
   *
   * For any response from a rate-limited endpoint, the response SHALL contain
   * headers X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset.
   */
  describe('Property 3: Headers Presence', () => {
    it('should include all rate limit headers in blocked responses', () => {
      fc.assert(
        fc.property(blockedResultArb, (result) => {
          const response = rateLimitExceededResponse(result)

          expect(response.headers.get('X-RateLimit-Limit')).toBe(
            result.limit.toString()
          )
          expect(response.headers.get('X-RateLimit-Remaining')).toBe(
            result.remaining.toString()
          )
          expect(response.headers.get('X-RateLimit-Reset')).toBe(
            result.resetAt.toString()
          )
          expect(response.headers.get('Retry-After')).toBe(
            result.retryAfter?.toString()
          )

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should include rate limit headers when added to success response', () => {
      fc.assert(
        fc.property(allowedResultArb, (result) => {
          const originalResponse = NextResponse.json({ success: true })
          const response = addRateLimitHeaders(originalResponse, result)

          expect(response.headers.get('X-RateLimit-Limit')).toBe(
            result.limit.toString()
          )
          expect(response.headers.get('X-RateLimit-Remaining')).toBe(
            result.remaining.toString()
          )
          expect(response.headers.get('X-RateLimit-Reset')).toBe(
            result.resetAt.toString()
          )

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should not include Retry-After header for allowed requests', () => {
      fc.assert(
        fc.property(allowedResultArb, (result) => {
          const originalResponse = NextResponse.json({ success: true })
          const response = addRateLimitHeaders(originalResponse, result)

          // Retry-After should not be set for allowed requests
          expect(response.headers.get('Retry-After')).toBeNull()

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should preserve original response when adding headers', async () => {
      await fc.assert(
        fc.asyncProperty(
          allowedResultArb,
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (result, data) => {
            const originalResponse = NextResponse.json({ success: true, data })
            const response = withRateLimitHeaders(originalResponse, result)

            const body = await response.json()
            expect(body.success).toBe(true)
            expect(body.data).toEqual(data)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Feature: rate-limiting, Property 4: Response Format Consistency
   * Validates: Requirements 4.1, 4.2, 4.3
   *
   * For any 429 response, the body SHALL contain:
   * - code: 'RATE_LIMIT_EXCEEDED'
   * - retryAfter in seconds
   * - Follow the ApiErrorResponse format
   */
  describe('Property 4: Response Format Consistency', () => {
    it('should return 429 status code', () => {
      fc.assert(
        fc.property(blockedResultArb, (result) => {
          const response = rateLimitExceededResponse(result)
          expect(response.status).toBe(429)
          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should include RATE_LIMIT_EXCEEDED error code', async () => {
      await fc.assert(
        fc.asyncProperty(blockedResultArb, async (result) => {
          const response = rateLimitExceededResponse(result)
          const body = await response.json()

          expect(body.error.code).toBe(RATE_LIMIT_ERROR_CODE)
          expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should include retryAfter in response body', async () => {
      await fc.assert(
        fc.asyncProperty(blockedResultArb, async (result) => {
          const response = rateLimitExceededResponse(result)
          const body = await response.json()

          expect(typeof body.error.retryAfter).toBe('number')
          expect(body.error.retryAfter).toBeGreaterThan(0)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should follow ApiErrorResponse format', async () => {
      await fc.assert(
        fc.asyncProperty(blockedResultArb, async (result) => {
          const response = rateLimitExceededResponse(result)
          const body = await response.json()

          // Required fields from ApiErrorResponse
          expect(body.success).toBe(false)
          expect(body.error).toBeDefined()
          expect(typeof body.error.code).toBe('string')
          expect(typeof body.error.message).toBe('string')
          expect(typeof body.timestamp).toBe('string')

          // Timestamp should be valid ISO 8601
          const timestamp = new Date(body.timestamp)
          expect(timestamp.toISOString()).toBe(body.timestamp)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should include user-friendly message in Portuguese', async () => {
      await fc.assert(
        fc.asyncProperty(blockedResultArb, async (result) => {
          const response = rateLimitExceededResponse(result)
          const body = await response.json()

          expect(body.error.message).toContain('requisições')
          expect(body.error.message.length).toBeGreaterThan(10)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should have consistent retryAfter between header and body', async () => {
      await fc.assert(
        fc.asyncProperty(blockedResultArb, async (result) => {
          const response = rateLimitExceededResponse(result)
          const body = await response.json()

          const headerRetryAfter = response.headers.get('Retry-After')
          expect(headerRetryAfter).toBe(body.error.retryAfter.toString())

          return true
        }),
        { numRuns: 100 }
      )
    })
  })
})
