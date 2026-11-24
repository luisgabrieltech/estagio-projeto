import type { IRateLimitStore, RateLimitEntry } from './rate-limit.types'

export class MemoryRateLimitStore implements IRateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(cleanupIntervalMs = 60_000) {
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, cleanupIntervalMs)
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now()
    const existing = this.store.get(key)

    if (!existing || now > existing.resetAt) {
      const entry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowMs,
      }
      this.store.set(key, entry)
      return entry
    }

    existing.count++
    return existing
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.resetAt) {
      this.store.delete(key)
      return null
    }
    
    return entry
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  get size(): number {
    return this.store.size
  }
}

let globalStore: MemoryRateLimitStore | null = null

export function getRateLimitStore(): MemoryRateLimitStore {
  if (!globalStore) {
    globalStore = new MemoryRateLimitStore()
  }
  return globalStore
}

export function resetRateLimitStore(): void {
  if (globalStore) {
    globalStore.destroy()
    globalStore = null
  }
}
