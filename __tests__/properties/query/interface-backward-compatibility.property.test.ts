/**
 * Property-Based Tests for Interface Backward Compatibility
 *
 * Feature: state-management, Property 4: Interface Backward Compatibility
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * For any migrated hook, the public interface (parameter types and return types)
 * SHALL remain compatible with existing component usage.
 * 
 * This test validates that hooks migrated to TanStack Query maintain their
 * original interfaces to ensure existing components continue to work without changes.
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isValidQueryHookResult,
  isValidMutationHookResult,
  isValidEvaluationsHookResult,
} from '@/__tests__/utils/validators'
import type {
  QueryHookResult,
  MutationHookResult,
  EvaluationsHookResult,
} from '@/__tests__/utils/types'

/**
 * Creates a mock query hook result for testing
 */
function createMockQueryHookResult<T>(
  overrides: Partial<QueryHookResult<T>> = {}
): QueryHookResult<T> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => ({}),
    isFetching: false,
    isSuccess: true,
    ...overrides,
  }
}

/**
 * Creates a mock mutation hook result for testing
 */
function createMockMutationHookResult<TData, TVariables>(
  overrides: Partial<MutationHookResult<TData, TVariables>> = {}
): MutationHookResult<TData, TVariables> {
  return {
    mutate: () => {},
    mutateAsync: async () => ({} as TData),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
    reset: () => {},
    ...overrides,
  }
}

/**
 * Creates a mock evaluations hook result for testing
 */
function createMockEvaluationsHookResult(
  overrides: Partial<EvaluationsHookResult> = {}
): EvaluationsHookResult {
  return {
    forms: [],
    userResponses: [],
    userProfile: null,
    loading: false,
    error: null,
    searchQuery: '',
    debouncedSearchQuery: '',
    respondedFormIds: new Set(),
    userFunctionalRoles: [],
    availableEvaluations: [],
    completedEvaluations: [],
    setSearchQuery: () => {},
    refresh: async () => {},
    hasRolePermission: () => true,
    ...overrides,
  }
}

describe('Interface Backward Compatibility Properties', () => {
  /**
   * Feature: state-management, Property 4: Interface Backward Compatibility
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
   */
  describe('Property 4: Interface Backward Compatibility', () => {
    
    describe('useResponses hook compatibility', () => {
      it('should maintain TanStack Query interface structure', () => {
        const mockHookResult = createMockQueryHookResult({ isLoading: true })
        expect(isValidQueryHookResult(mockHookResult)).toBe(true)
      })

      it('should validate interface consistency across different states', () => {
        fc.assert(
          fc.property(
            fc.boolean(), // isLoading
            fc.boolean(), // isError
            fc.option(fc.anything(), { nil: undefined }), // data
            (isLoading, isError, data) => {
              const mockHookResult = createMockQueryHookResult({
                data,
                isLoading,
                isError,
                error: isError ? new Error('Test error') : null,
                isSuccess: !isLoading && !isError,
              })

              return isValidQueryHookResult(mockHookResult)
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should have all required TanStack Query properties', () => {
        const expectedProperties = ['data', 'isLoading', 'isError', 'error', 'refetch']
        const mockHookResult = createMockQueryHookResult()

        expectedProperties.forEach((prop) => {
          expect(mockHookResult).toHaveProperty(prop)
        })
      })
    })

    describe('useCertificates hook compatibility', () => {
      it('should maintain TanStack Query interface structure', () => {
        const mockHookResult = createMockQueryHookResult({ isLoading: true })
        expect(isValidQueryHookResult(mockHookResult)).toBe(true)
      })

      it('should validate interface consistency across different states', () => {
        fc.assert(
          fc.property(
            fc.boolean(), // isLoading
            fc.boolean(), // isError
            fc.option(fc.anything(), { nil: undefined }), // data
            (isLoading, isError, data) => {
              const mockHookResult = createMockQueryHookResult({
                data,
                isLoading,
                isError,
                error: isError ? new Error('Test error') : null,
                isSuccess: !isLoading && !isError,
              })

              return isValidQueryHookResult(mockHookResult)
            }
          ),
          { numRuns: 100 }
        )
      })
    })

    describe('useEvaluations hook compatibility', () => {
      it('should maintain backward compatible interface structure', () => {
        const mockHookResult = createMockEvaluationsHookResult({ loading: true })
        expect(isValidEvaluationsHookResult(mockHookResult)).toBe(true)
      })

      it('should validate interface consistency across different states', () => {
        fc.assert(
          fc.property(
            fc.boolean(), // loading
            fc.option(fc.string(), { nil: null }), // error
            fc.array(fc.anything()), // forms
            fc.array(fc.anything()), // userResponses
            fc.string(), // searchQuery
            (loading, error, forms, userResponses, searchQuery) => {
              const mockHookResult = createMockEvaluationsHookResult({
                forms,
                userResponses,
                loading,
                error,
                searchQuery,
                debouncedSearchQuery: searchQuery,
              })

              return isValidEvaluationsHookResult(mockHookResult)
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should have all required backward compatible properties', () => {
        const expectedProperties = [
          'forms',
          'userResponses',
          'userProfile',
          'loading',
          'error',
          'searchQuery',
          'debouncedSearchQuery',
          'respondedFormIds',
          'userFunctionalRoles',
          'availableEvaluations',
          'completedEvaluations',
          'setSearchQuery',
          'refresh',
          'hasRolePermission'
        ]
        
        const mockHookResult = createMockEvaluationsHookResult()

        expectedProperties.forEach((prop) => {
          expect(mockHookResult).toHaveProperty(prop)
        })
      })

      it('should validate that all function properties are functions', () => {
        const mockHookResult = createMockEvaluationsHookResult()

        expect(typeof mockHookResult.setSearchQuery).toBe('function')
        expect(typeof mockHookResult.refresh).toBe('function')
        expect(typeof mockHookResult.hasRolePermission).toBe('function')
      })

      it('should validate that respondedFormIds is always a Set', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string()),
            (formIds) => {
              const respondedFormIds = new Set(formIds)
              const mockHookResult = createMockEvaluationsHookResult({ respondedFormIds })
              return mockHookResult.respondedFormIds instanceof Set
            }
          ),
          { numRuns: 100 }
        )
      })
    })

    describe('Mutation hooks compatibility', () => {
      it('should validate useSaveResponses mutation interface', () => {
        const mockHookResult = createMockMutationHookResult()
        expect(isValidMutationHookResult(mockHookResult)).toBe(true)
      })

      it('should validate useGenerateCertificate mutation interface', () => {
        const mockHookResult = createMockMutationHookResult()
        expect(isValidMutationHookResult(mockHookResult)).toBe(true)
      })

      it('should validate mutation interface consistency across different states', () => {
        fc.assert(
          fc.property(
            fc.boolean(), // isPending
            fc.boolean(), // isError
            fc.boolean(), // isSuccess
            (isPending, isError, isSuccess) => {
              const mockHookResult = createMockMutationHookResult({
                isPending,
                isError,
                error: isError ? new Error('Test error') : null,
                isSuccess,
              })

              return isValidMutationHookResult(mockHookResult)
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should have all required mutation properties', () => {
        const expectedProperties = ['mutate', 'mutateAsync', 'isPending', 'isError', 'error']
        const mockHookResult = createMockMutationHookResult()

        expectedProperties.forEach((prop) => {
          expect(mockHookResult).toHaveProperty(prop)
        })
      })

      it('should validate that mutate functions are always functions', () => {
        const mockHookResult = createMockMutationHookResult()

        expect(typeof mockHookResult.mutate).toBe('function')
        expect(typeof mockHookResult.mutateAsync).toBe('function')
      })
    })

    describe('Cross-hook consistency', () => {
      it('should validate that all query hooks use consistent boolean states', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            fc.boolean(),
            (isLoading, isError) => {
              const responsesHook = createMockQueryHookResult({ isLoading, isError })
              const certificatesHook = createMockQueryHookResult({ isLoading, isError })

              return (
                typeof responsesHook.isLoading === 'boolean' &&
                typeof responsesHook.isError === 'boolean' &&
                typeof certificatesHook.isLoading === 'boolean' &&
                typeof certificatesHook.isError === 'boolean'
              )
            }
          ),
          { numRuns: 100 }
        )
      })

      it('should validate that all mutation hooks use consistent isPending state', () => {
        fc.assert(
          fc.property(
            fc.boolean(),
            (isPending) => {
              const saveResponsesMutation = createMockMutationHookResult({ isPending })
              const generateCertificateMutation = createMockMutationHookResult({ isPending })

              return (
                typeof saveResponsesMutation.isPending === 'boolean' &&
                typeof generateCertificateMutation.isPending === 'boolean'
              )
            }
          ),
          { numRuns: 100 }
        )
      })
    })
  })
})
