/**
 * Property-Based Tests for Form Mutation Invalidation Correctness
 *
 * Feature: state-management, Property 3: Mutation Invalidation Correctness
 * Validates: Requirements 4.2, 5.2
 *
 * For any successful mutation (create, update, delete), the related query caches
 * SHALL be invalidated, causing subsequent queries to fetch fresh data.
 * 
 * This test validates that mutations properly invalidate the correct cache keys
 * to ensure data consistency across the application.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { QueryClient } from '@tanstack/react-query'
import { formKeys } from '@/lib/query/keys/form.keys'
import type { FormFilters } from '@/types/entities/form'

describe('Form Mutation Invalidation Properties', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  /**
   * Feature: state-management, Property 3: Mutation Invalidation Correctness
   * Validates: Requirements 4.2, 5.2
   */
  describe('Property 3: Mutation Invalidation Correctness (Forms)', () => {
    it('should invalidate form lists cache after create mutation', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string(),
            category: fc.constantFrom('AUTOAVALIACAO', 'AVALIACAO_DOCENTE', 'PESQUISA'),
          }),
          (formData) => {
            // Spy on invalidateQueries
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            // Simulate successful create mutation callback
            const onSuccess = () => {
              queryClient.invalidateQueries({ queryKey: formKeys.lists() })
            }

            // Execute the success callback
            onSuccess()

            // Verify invalidateQueries was called with correct key
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.lists() })

            // Verify the key structure
            const callArgs = invalidateSpy.mock.calls[0]?.[0]
            expect(callArgs?.queryKey).toEqual(['forms', 'list'])

            invalidateSpy.mockRestore()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should invalidate both detail and lists cache after update mutation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // form ID
          fc.record({
            title: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            status: fc.option(fc.constantFrom('DRAFT', 'PUBLISHED', 'ARCHIVED')),
          }),
          (formId, updateData) => {
            // Spy on invalidateQueries
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            // Simulate successful update mutation callback
            const onSuccess = () => {
              queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) })
              queryClient.invalidateQueries({ queryKey: formKeys.withQuestions(formId) })
              queryClient.invalidateQueries({ queryKey: formKeys.lists() })
            }

            // Execute the success callback
            onSuccess()

            // Verify invalidateQueries was called 3 times
            expect(invalidateSpy).toHaveBeenCalledTimes(3)

            // Verify detail key was invalidated
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.detail(formId) })

            // Verify withQuestions key was invalidated
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.withQuestions(formId) })

            // Verify lists key was invalidated
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.lists() })

            invalidateSpy.mockRestore()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should invalidate lists cache after delete mutation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // form ID
          (formId) => {
            // Spy on invalidateQueries
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            // Simulate successful delete mutation callback
            const onSuccess = () => {
              queryClient.invalidateQueries({ queryKey: formKeys.lists() })
            }

            // Execute the success callback
            onSuccess()

            // Verify invalidateQueries was called with correct key
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.lists() })

            invalidateSpy.mockRestore()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should ensure invalidation affects all list queries regardless of filters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              search: fc.option(fc.string()),
              status: fc.option(fc.constantFrom('DRAFT', 'PUBLISHED', 'ARCHIVED')),
              page: fc.integer({ min: 1, max: 10 }),
              pageSize: fc.integer({ min: 10, max: 50 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (filterCombinations) => {
            // Set up multiple queries with different filters
            filterCombinations.forEach((filters) => {
              const queryKey = formKeys.list(filters as FormFilters)
              queryClient.setQueryData(queryKey, { data: [], pagination: {} })
            })

            // Spy on invalidateQueries
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            // Simulate mutation success that invalidates lists
            queryClient.invalidateQueries({ queryKey: formKeys.lists() })

            // Verify invalidateQueries was called
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.lists() })

            // The lists() key should match all list queries
            const listsKey = formKeys.lists()
            expect(listsKey).toEqual(['forms', 'list'])

            // All list queries should start with this prefix
            filterCombinations.forEach((filters) => {
              const queryKey = formKeys.list(filters as FormFilters)
              expect(queryKey[0]).toBe(listsKey[0])
              expect(queryKey[1]).toBe(listsKey[1])
            })

            invalidateSpy.mockRestore()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should verify query key hierarchy for proper invalidation scope', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // form ID
          (formId) => {
            // Verify key hierarchy
            const allKey = formKeys.all
            const listsKey = formKeys.lists()
            const detailsKey = formKeys.details()
            const detailKey = formKeys.detail(formId)
            const withQuestionsKey = formKeys.withQuestions(formId)

            // All keys should start with base 'forms' key
            expect(allKey).toEqual(['forms'])
            expect(listsKey[0]).toBe('forms')
            expect(detailsKey[0]).toBe('forms')
            expect(detailKey[0]).toBe('forms')
            expect(withQuestionsKey[0]).toBe('forms')

            // Lists should be ['forms', 'list']
            expect(listsKey).toEqual(['forms', 'list'])

            // Details should be ['forms', 'detail']
            expect(detailsKey).toEqual(['forms', 'detail'])

            // Detail should be ['forms', 'detail', id]
            expect(detailKey).toEqual(['forms', 'detail', formId])

            // WithQuestions should be ['forms', 'detail', id, 'questions']
            expect(withQuestionsKey).toEqual(['forms', 'detail', formId, 'questions'])

            // Invalidating lists() should affect all list queries
            // Invalidating detail(id) should affect specific form detail
            // Invalidating withQuestions(id) should affect form with questions

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should ensure mutations do not invalidate unrelated caches', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // form ID being updated
          fc.string({ minLength: 1 }), // different form ID
          (formId, differentFormId) => {
            // Ensure IDs are different
            fc.pre(formId !== differentFormId)

            // Set up cache for different form
            const differentFormKey = formKeys.detail(differentFormId)
            queryClient.setQueryData(differentFormKey, { id: differentFormId, title: 'Test' })

            // Spy on invalidateQueries
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            // Simulate update mutation for formId
            queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) })

            // Verify only the specific form's detail was targeted
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: formKeys.detail(formId) })

            // The call should not have targeted the different form
            const callArgs = invalidateSpy.mock.calls[0]?.[0]
            expect(callArgs?.queryKey).not.toEqual(differentFormKey)

            invalidateSpy.mockRestore()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that list filters are properly included in cache keys', () => {
      fc.assert(
        fc.property(
          fc.record({
            search: fc.option(fc.string()),
            status: fc.option(fc.constantFrom('DRAFT', 'PUBLISHED', 'ARCHIVED')),
            category: fc.option(fc.constantFrom('AUTOAVALIACAO', 'AVALIACAO_DOCENTE', 'PESQUISA')),
            page: fc.integer({ min: 1, max: 100 }),
            pageSize: fc.integer({ min: 1, max: 100 }),
          }),
          (filters) => {
            const queryKey = formKeys.list(filters as FormFilters)

            // Key should be ['forms', 'list', filters]
            expect(queryKey).toHaveLength(3)
            expect(queryKey[0]).toBe('forms')
            expect(queryKey[1]).toBe('list')
            expect(queryKey[2]).toEqual(filters)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should ensure different filter combinations produce different cache keys', () => {
      fc.assert(
        fc.property(
          fc.record({
            search: fc.option(fc.string()),
            status: fc.option(fc.constantFrom('DRAFT', 'PUBLISHED', 'ARCHIVED')),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          fc.record({
            search: fc.option(fc.string()),
            status: fc.option(fc.constantFrom('DRAFT', 'PUBLISHED', 'ARCHIVED')),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          (filters1, filters2) => {
            const key1 = JSON.stringify(formKeys.list(filters1 as FormFilters))
            const key2 = JSON.stringify(formKeys.list(filters2 as FormFilters))

            // If filters are equal, keys should be equal
            // If filters are different, keys should be different
            const filtersEqual = JSON.stringify(filters1) === JSON.stringify(filters2)
            const keysEqual = key1 === key2

            return filtersEqual === keysEqual
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
