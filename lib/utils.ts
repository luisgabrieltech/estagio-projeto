import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export all utilities from utils folder
export * from './utils/api-utils'
export * from './utils/cache-utils'
export * from './utils/fetch-with-retry'
export * from './utils/format'
export * from './utils/user-utils'
export * from './utils/validation-utils'
