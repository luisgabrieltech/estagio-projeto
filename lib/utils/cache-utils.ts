/**
 * Native cache utilities using Map with TTL support
 * No external dependencies required
 * Provides in-memory caching with automatic expiration
 */

/**
 * Cache entry with value and expiration time
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Generic cache manager with TTL (Time To Live) support
 * @template T - Type of values stored in cache
 */
class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private timers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with TTL (time to live) in milliseconds
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   * @example
   * cache.set('user:123', userData, 60000) // Cache for 1 minute
   */
  set(key: string, value: T, ttl: number): void {
    // Clear existing timer if any
    this.clearTimer(key);

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });

    // Set timer to auto-delete after TTL
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * Returns undefined if not found or expired
   * @param key - Cache key
   * @returns Cached value or undefined
   * @example
   * const user = cache.get('user:123')
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   * @param key - Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    this.clearTimer(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get all cache keys (excluding expired ones)
   * @returns Array of valid cache keys
   */
  keys(): string[] {
    const validKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (Date.now() <= entry.expiresAt) {
        validKeys.push(key);
      } else {
        this.delete(key);
      }
    });

    return validKeys;
  }

  /**
   * Get cache size (excluding expired entries)
   * @returns Number of valid entries
   */
  size(): number {
    return this.keys().length;
  }

  /**
   * Get or set a value in cache
   * If key exists and is valid, returns cached value
   * Otherwise, calls factory function, caches result, and returns it
   * @param key - Cache key
   * @param factory - Function to generate value if not cached
   * @param ttl - Time to live in milliseconds
   * @returns Cached or newly generated value
   * @example
   * const user = await cache.getOrSet(
   *   'user:123',
   *   () => fetchUser('123'),
   *   60000
   * )
   */
  async getOrSet(
    key: string,
    factory: () => T | Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = this.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  private clearTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
}

// Global cache instances for different data types
export const formsCache = new CacheManager();
export const responsesCache = new CacheManager();
export const certificatesCache = new CacheManager();
export const usersCache = new CacheManager();
export const metricsCache = new CacheManager();

/**
 * Cache key generators for consistent naming
 * Provides standardized cache key patterns across the application
 */
export const cacheKeys = {
  forms: {
    list: (userId: string) => `forms:list:${userId}`,
    detail: (formId: string) => `forms:detail:${formId}`,
    available: (userId: string) => `forms:available:${userId}`,
    admin: (page: number, filters: string) => `forms:admin:${page}:${filters}`,
  },
  responses: {
    user: (userId: string) => `responses:user:${userId}`,
    form: (formId: string) => `responses:form:${formId}`,
    formMetrics: (formId: string) => `responses:metrics:${formId}`,
  },
  certificates: {
    user: (userId: string) => `certificates:user:${userId}`,
    detail: (certId: string) => `certificates:detail:${certId}`,
  },
  users: {
    profile: (userId: string) => `users:profile:${userId}`,
    list: (page: number, filters: string) => `users:list:${page}:${filters}`,
  },
  metrics: {
    admin: () => `metrics:admin`,
    formStats: (formId: string) => `metrics:form:${formId}`,
  },
};

/**
 * Invalidate cache entries by pattern
 * @param cache - Cache manager instance
 * @param pattern - Pattern to match against keys
 * @returns Number of invalidated entries
 * @example
 * invalidateCacheByPattern(formsCache, 'form:123') // Invalidates all keys containing 'form:123'
 */
export function invalidateCacheByPattern(
  cache: CacheManager,
  pattern: string
): number {
  let count = 0;
  const keys = cache.keys();

  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
      count++;
    }
  });

  return count;
}

/**
 * Invalidate all form-related caches
 * @param formId - Optional form ID to invalidate specific form
 * @example
 * invalidateFormCaches() // Invalidates all forms
 * invalidateFormCaches('123') // Invalidates only form 123
 */
export function invalidateFormCaches(formId?: string): void {
  if (formId) {
    // Invalidate specific form
    invalidateCacheByPattern(formsCache, formId);
    invalidateCacheByPattern(responsesCache, formId);
  } else {
    // Invalidate all forms
    formsCache.clear();
  }
}

/**
 * Invalidate all user-related caches
 * @param userId - Optional user ID to invalidate specific user
 * @example
 * invalidateUserCaches() // Invalidates all users
 * invalidateUserCaches('123') // Invalidates only user 123
 */
export function invalidateUserCaches(userId?: string): void {
  if (userId) {
    // Invalidate specific user
    invalidateCacheByPattern(usersCache, userId);
    invalidateCacheByPattern(responsesCache, userId);
    invalidateCacheByPattern(certificatesCache, userId);
  } else {
    // Invalidate all users
    usersCache.clear();
  }
}

/**
 * TTL constants (in milliseconds)
 * @deprecated Use CACHE_TTL from @/lib/config instead
 */
export { CACHE_TTL as TTL } from '../config';

// Export CacheManager class for custom cache instances
export { CacheManager };
