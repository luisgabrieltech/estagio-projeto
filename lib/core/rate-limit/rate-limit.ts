import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type {
  IRateLimitStore,
  RateLimitConfig,
  RateLimitResult,
} from './rate-limit.types'

export class RateLimiter {
  constructor(
    private store: IRateLimitStore,
    private config: RateLimitConfig
  ) {}

  async check(identifier: string): Promise<RateLimitResult> {
    const entry = await this.store.increment(identifier, this.config.windowMs)
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const allowed = entry.count <= this.config.maxRequests

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetAt: entry.resetAt,
      retryAfter: allowed
        ? undefined
        : Math.ceil((entry.resetAt - Date.now()) / 1000),
    }
  }

  async reset(identifier: string): Promise<void> {
    await this.store.reset(identifier)
  }
}

export function getIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

  return `ip:${ip}`
}

export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString())

  if (result.retryAfter !== undefined) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}
