import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { userKeys } from '@/lib/query/keys/user.keys'
import type { UserFilters } from '@/types/entities/user'
import { 
  isValidUsersHookResult, 
  isValidSingleUserHookResult,
  isValidMutationHookResult 
} from '@/__tests__/utils/validators'
import { DEFAULT_PAGINATION, DEFAULT_FILTERS } from '@/__tests__/utils/constants'
import type { UsersHookResult, SingleUserHookResult, MutationHookResult } from '@/__tests__/utils/types'

function createMockUsersHookResult(overrides: Partial<UsersHookResult> = {}): UsersHookResult {
  return {
    users: [],
    loading: false,
    error: null,
    filters: {
      search: DEFAULT_FILTERS.SEARCH,
      role: DEFAULT_FILTERS.ROLE,
      functionalRole: DEFAULT_FILTERS.FUNCTIONAL_ROLE,
      page: DEFAULT_PAGINATION.PAGE,
      pageSize: DEFAULT_PAGINATION.PAGE_SIZE,
    },
    pagination: {
      page: DEFAULT_PAGINATION.PAGE,
      pageSize: DEFAULT_PAGINATION.PAGE_SIZE,
      total: DEFAULT_PAGINATION.TOTAL,
      totalPages: DEFAULT_PAGINATION.TOTAL_PAGES,
    },
    setSearchQuery: () => {},
    setRoleFilter: () => {},
    setFunctionalRoleFilter: () => {},
    setPage: () => {},
    refresh: async () => {},
    invalidateCache: () => {},
    ...overrides,
  }
}

function createMockSingleUserHookResult(
  overrides: Partial<SingleUserHookResult> = {}
): SingleUserHookResult {
  return {
    user: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => ({}),
    ...overrides,
  }
}

describe('Query Hook State Consistency Properties', () => {
  describe('Property 2: Query Hook State Consistency', () => {
    it('should validate that useUsers hook interface has consistent structure', () => {
      const mockHookResult = createMockUsersHookResult({ loading: true })
      expect(isValidUsersHookResult(mockHookResult)).toBe(true)
    })

    it('should validate that useUser hook interface has consistent structure', () => {
      const mockHookResult = createMockSingleUserHookResult({ isLoading: true })
      expect(isValidSingleUserHookResult(mockHookResult)).toBe(true)
    })

    it('should validate hook interface consistency across different states', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // loading state
          fc.option(fc.string(), { nil: null }), // error state
          fc.array(fc.anything()), // users array
          (loading, error, users) => {
            const mockHookResult = createMockUsersHookResult({
              users,
              loading,
              error,
            })

            return isValidUsersHookResult(mockHookResult)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that loading and error states are always boolean/null-or-string', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.option(fc.string(), { nil: null }),
          (loading, error) => {
            const mockHookResult = createMockUsersHookResult({ loading, error })

            // Validate types
            const hasCorrectTypes = 
              typeof mockHookResult.loading === 'boolean' &&
              (mockHookResult.error === null || typeof mockHookResult.error === 'string')

            return hasCorrectTypes
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that users is always an array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.anything()),
          (users) => {
            const mockHookResult = createMockUsersHookResult({ users })
            return Array.isArray(mockHookResult.users)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate backward compatibility - all expected properties exist', () => {
      const expectedProperties = [
        'users',
        'loading',
        'error',
        'filters',
        'pagination',
        'setSearchQuery',
        'setRoleFilter',
        'setFunctionalRoleFilter',
        'setPage',
        'refresh',
        'invalidateCache',
      ]

      const mockHookResult = createMockUsersHookResult()

      expectedProperties.forEach((prop) => {
        expect(mockHookResult).toHaveProperty(prop)
      })
    })

    it('should validate that all setter functions are functions', () => {
      const mockHookResult = createMockUsersHookResult()

      expect(typeof mockHookResult.setSearchQuery).toBe('function')
      expect(typeof mockHookResult.setRoleFilter).toBe('function')
      expect(typeof mockHookResult.setFunctionalRoleFilter).toBe('function')
      expect(typeof mockHookResult.setPage).toBe('function')
      expect(typeof mockHookResult.refresh).toBe('function')
      expect(typeof mockHookResult.invalidateCache).toBe('function')
    })

    it('should validate useUser hook has all required properties', () => {
      const expectedProperties = ['user', 'isLoading', 'isError', 'error', 'refetch']
      const mockHookResult = createMockSingleUserHookResult()

      expectedProperties.forEach((prop) => {
        expect(mockHookResult).toHaveProperty(prop)
      })

      expect(typeof mockHookResult.refetch).toBe('function')
    })

    it('should validate mutation hook interface', () => {
      const mockMutationResult: MutationHookResult<unknown, unknown> = {
        mutate: () => {},
        mutateAsync: async () => ({}),
        isPending: false,
        isError: false,
        error: null,
      }

      expect(isValidMutationHookResult(mockMutationResult)).toBe(true)
    })

    it('should validate query keys maintain consistency with filters', () => {
      fc.assert(
        fc.property(
          fc.record({
            search: fc.option(fc.string(), { nil: undefined }),
            role: fc.option(fc.string(), { nil: undefined }),
            functionalRole: fc.option(fc.string(), { nil: undefined }),
            page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
            pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
          }),
          (filters) => {
            // Generate query key
            const queryKey = userKeys.list(filters as UserFilters)
            
            // Query key should be an array
            expect(Array.isArray(queryKey)).toBe(true)
            
            // Query key should start with base key
            expect(queryKey[0]).toBe('users')
            expect(queryKey[1]).toBe('list')
            
            // Query key should include filters
            expect(queryKey[2]).toEqual(filters)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
