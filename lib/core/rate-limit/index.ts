/**
 * Rate Limit Module - Barrel Export
 * Core Infrastructure - Sistema CPA
 *
 * Requirements: 1.1
 */

// Types and interfaces
export type {
  RateLimitConfig,
  RateLimitEntry,
  RateLimitResult,
  IRateLimitStore,
  RateLimitPreset,
} from './rate-limit.types'

// Configuration and presets
export {
  rateLimitPresets,
  routeRateLimits,
  getPresetForRoute,
  getConfigForRoute,
} from './rate-limit.config'

// Store implementation
export {
  MemoryRateLimitStore,
  getRateLimitStore,
  resetRateLimitStore,
} from './rate-limit.store'

// Rate limiter service
export {
  RateLimiter,
  getIdentifier,
  addRateLimitHeaders,
} from './rate-limit'
