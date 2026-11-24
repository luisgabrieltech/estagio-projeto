export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export interface RateLimitEntry {
  count: number
  resetAt: number
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfter?: number
}

export interface IRateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitEntry>
  get(key: string): Promise<RateLimitEntry | null>
  reset(key: string): Promise<void>
}

export type RateLimitPreset = 'authStrict' | 'auth' | 'write' | 'read' | 'authenticated' | 'default' | 'certificateVerification'
