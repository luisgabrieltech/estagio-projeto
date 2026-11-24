import type { RateLimitConfig, RateLimitPreset } from './rate-limit.types'

export const rateLimitPresets: Record<RateLimitPreset, RateLimitConfig> = {
  authStrict: { windowMs: 60_000, maxRequests: 3 },
  auth: { windowMs: 60_000, maxRequests: 5 },
  write: { windowMs: 60_000, maxRequests: 30 },
  default: { windowMs: 60_000, maxRequests: 60 },
  read: { windowMs: 60_000, maxRequests: 100 },
  certificateVerification: { windowMs: 60_000, maxRequests: 20 },
  authenticated: { windowMs: 60_000, maxRequests: 200 },
}

export const routeRateLimits: Array<{ pattern: string; preset: RateLimitPreset }> = [
  { pattern: '/api/auth/register', preset: 'authStrict' },
  { pattern: '/api/auth/forgot-password', preset: 'authStrict' },
  { pattern: '/api/auth/reset-password', preset: 'authStrict' },
  { pattern: '/api/magic-link', preset: 'authStrict' },
  { pattern: '/api/auth/', preset: 'auth' },
  { pattern: '/api/admin/', preset: 'write' },
  { pattern: '/api/user', preset: 'write' },
  { pattern: '/api/responses', preset: 'write' },
  { pattern: '/api/forms', preset: 'read' },
  { pattern: '/api/certificates', preset: 'read' },
]

export function isCertificateVerificationPath(pathname: string): boolean {
  return /^\/api\/(?:v1\/)?certificates\/validate\/[^/]+\/?$/.test(pathname)
}

export function getPresetForRoute(pathname: string): RateLimitPreset {
  if (isCertificateVerificationPath(pathname)) return 'certificateVerification'

  for (const { pattern, preset } of routeRateLimits) {
    if (pathname.startsWith(pattern)) {
      return preset
    }
  }
  return 'default'
}

export function getConfigForRoute(pathname: string): RateLimitConfig {
  const preset = getPresetForRoute(pathname)
  return rateLimitPresets[preset]
}
