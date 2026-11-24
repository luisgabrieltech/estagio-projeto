/**
 * User Factory
 * 
 * Factory functions for creating test user data
 * 
 * @module __tests__/utils/factories/user.factory
 * Requirements: 3.3
 */
import { Role, FunctionalRole } from '@prisma/client'
import type { User, UserCreateData, UserWithCounts } from '@/types/entities/user'
import { TEST_IDS, TEST_EMAILS, TEST_NAMES } from '../constants'

let userIdCounter = 0

/**
 * Creates a test user with default values
 * 
 * @param overrides - Partial user data to override defaults
 * @returns Complete User object
 */
export function createUser(overrides: Partial<User> = {}): User {
  userIdCounter++
  const now = new Date()
  
  return {
    id: `user-${userIdCounter}`,
    name: `Test User ${userIdCounter}`,
    email: `user${userIdCounter}@test.com`,
    role: 'USER' as Role,
    functionalRoles: [] as FunctionalRole[],
    active: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Creates a test admin user
 * 
 * @param overrides - Partial user data to override defaults
 * @returns Complete User object with ADMIN role
 */
export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'ADMIN' as Role, ...overrides })
}

/**
 * Creates a test CSA user
 * 
 * @param overrides - Partial user data to override defaults
 * @returns Complete User object with CSA role
 */
export function createCSA(overrides: Partial<User> = {}): User {
  return createUser({ role: 'CSA' as Role, ...overrides })
}

/**
 * Creates multiple test users
 * 
 * @param count - Number of users to create
 * @param overrides - Partial user data to apply to all users
 * @returns Array of User objects
 */
export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides))
}

/**
 * Creates user creation data for API calls
 * 
 * @param overrides - Partial data to override defaults
 * @returns UserCreateData object
 */
export function createUserCreateData(overrides: Partial<UserCreateData> = {}): UserCreateData {
  userIdCounter++
  
  return {
    name: `New User ${userIdCounter}`,
    email: `newuser${userIdCounter}@test.com`,
    password: 'password123',
    role: 'USER' as Role,
    functionalRoles: [],
    ...overrides,
  }
}

/**
 * Creates a user with response and certificate counts
 * 
 * @param overrides - Partial data to override defaults
 * @returns UserWithCounts object
 */
export function createUserWithCounts(overrides: Partial<UserWithCounts> = {}): UserWithCounts {
  const user = createUser()
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    _count: {
      responses: 0,
      certificates: 0,
    },
    ...overrides,
  }
}

/**
 * Resets the user ID counter
 * Useful for test isolation
 */
export function resetUserFactory(): void {
  userIdCounter = 0
}
