/**
 * Test Utilities Barrel Export
 * 
 * Re-exports all test utilities for convenient importing
 * 
 * @module __tests__/utils
 * Requirements: 2.4
 * 
 * @example
 * ```typescript
 * import { 
 *   createUser, 
 *   createForm, 
 *   userArb, 
 *   server,
 *   TestWrapper,
 *   TEST_IDS,
 *   isValidQueryHookResult
 * } from '@/__tests__/utils'
 * ```
 */

// Test wrapper utilities
export { 
  createTestQueryClient, 
  TestWrapper, 
  createWrapper 
} from './test-wrapper'

// Factories
export * from './factories'

// Generators
export * from './generators'

// Mocks
export { 
  server,
  handlers,
  userHandlers,
  formHandlers,
  responseHandlers,
  certificateHandlers,
  createErrorHandler,
  createNotFoundHandler,
  createUnauthorizedHandler,
  createForbiddenHandler,
} from './mocks'

// Constants
export {
  TEST_IDS,
  TEST_EMAILS,
  TEST_NAMES,
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
} from './constants'

// Types
export type {
  QueryHookResult,
  MutationHookResult,
  UsersHookResult,
  SingleUserHookResult,
  EvaluationsHookResult,
  PaginationMeta,
} from './types'

// Validators
export {
  isValidQueryHookResult,
  isValidMutationHookResult,
  isValidUsersHookResult,
  isValidSingleUserHookResult,
  isValidEvaluationsHookResult,
  isValidPagination,
} from './validators'
