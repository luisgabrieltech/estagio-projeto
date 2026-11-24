import { NextResponse } from 'next/server'
import type { RateLimitResult } from '@/lib/core/rate-limit'
import { addRateLimitHeaders } from '@/lib/core/rate-limit'

export const RATE_LIMIT_ERROR_CODE = 'RATE_LIMIT_EXCEEDED' as const

export interface RateLimitErrorResponse {
  success: false
  error: {
    code: typeof RATE_LIMIT_ERROR_CODE
    message: string
    retryAfter: number
  }
  timestamp: string
}

export function rateLimitExceededResponse(
  result: RateLimitResult
): NextResponse<RateLimitErrorResponse> {
  const response = NextResponse.json<RateLimitErrorResponse>(
    {
      success: false,
      error: {
        code: RATE_LIMIT_ERROR_CODE,
        message: 'Muitas requisições. Tente novamente em alguns segundos.',
        retryAfter: result.retryAfter ?? 60,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 429 }
  )

  return addRateLimitHeaders(response, result) as NextResponse<RateLimitErrorResponse>
}

export function withRateLimitHeaders<T>(
  response: NextResponse<T>,
  result: RateLimitResult
): NextResponse<T> {
  return addRateLimitHeaders(response, result) as NextResponse<T>
}
