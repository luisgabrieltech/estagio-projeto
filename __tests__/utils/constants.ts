/**
 * Test Constants
 * 
 * Centralized constants for test data to avoid magic strings
 * and ensure consistency across tests.
 * 
 * @module __tests__/utils/constants
 */

/**
 * Default test IDs used across factories and tests
 */
export const TEST_IDS = {
  USER: {
    DEFAULT: 'user-1',
    ADMIN: 'admin-1',
    CSA: 'csa-1',
    CURRENT: 'current-user',
    CREATOR: 'creator-1',
  },
  FORM: {
    DEFAULT: 'form-1',
  },
  QUESTION: {
    DEFAULT: 'question-1',
  },
  RESPONSE: {
    DEFAULT: 'response-1',
  },
  CERTIFICATE: {
    DEFAULT: 'certificate-1',
  },
} as const

/**
 * Default test emails
 */
export const TEST_EMAILS = {
  DEFAULT: 'user@test.com',
  ADMIN: 'admin@test.com',
  CREATOR: 'creator@test.com',
} as const

/**
 * Default test names
 */
export const TEST_NAMES = {
  DEFAULT: 'Test User',
  ADMIN: 'Test Admin',
  CREATOR: 'Test Creator',
} as const

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
  TOTAL: 0,
  TOTAL_PAGES: 0,
} as const

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  SEARCH: '',
  ROLE: 'all',
  FUNCTIONAL_ROLE: 'all',
} as const
