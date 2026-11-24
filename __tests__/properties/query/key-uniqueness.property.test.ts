/**
 * Property-Based Tests for Query Key Uniqueness
 *
 * Feature: state-management, Property 1: Query Key Uniqueness
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 *
 * For any two different filter combinations, the generated query keys SHALL be
 * different, ensuring cache isolation between different queries.
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { userKeys } from '@/lib/query/keys/user.keys'
import { formKeys } from '@/lib/query/keys/form.keys'
import { responseKeys } from '@/lib/query/keys/response.keys'
import { certificateKeys } from '@/lib/query/keys/certificate.keys'
import { Role, FunctionalRole, FormStatus, ExternalStatus, Category } from '@prisma/client'
import type { UserFilters } from '@/types/entities/user'
import type { FormFilters } from '@/types/entities/form'
import type { ResponseFilters } from '@/types/entities/response'

// Helper: Generate valid user filters
const userFiltersArb = fc.record({
  search: fc.option(fc.string(), { nil: undefined }),
  role: fc.option(fc.constantFrom(...Object.values(Role)), { nil: undefined }),
  functionalRole: fc.option(fc.constantFrom(...Object.values(FunctionalRole)), { nil: undefined }),
  active: fc.option(fc.boolean(), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// Helper: Generate valid form filters
const formFiltersArb = fc.record({
  search: fc.option(fc.string(), { nil: undefined }),
  status: fc.option(fc.constantFrom(...Object.values(FormStatus)), { nil: undefined }),
  externalStatus: fc.option(fc.constantFrom(...Object.values(ExternalStatus)), { nil: undefined }),
  category: fc.option(fc.constantFrom(...Object.values(Category)), { nil: undefined }),
  generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
  createdById: fc.option(fc.string(), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// Helper: Generate valid response filters
const responseFiltersArb = fc.record({
  formId: fc.option(fc.string(), { nil: undefined }),
  userId: fc.option(fc.string(), { nil: undefined }),
  questionId: fc.option(fc.string(), { nil: undefined }),
  campus: fc.option(fc.array(fc.string()), { nil: undefined }),
  course: fc.option(fc.array(fc.string()), { nil: undefined }),
  userRole: fc.option(fc.array(fc.string()), { nil: undefined }),
  completionStatus: fc.option(fc.constantFrom('complete', 'partial', 'all'), { nil: undefined }),
  searchTerm: fc.option(fc.string(), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// Helper: Generate valid certificate filters
const certificateFiltersArb = fc.record({
  userId: fc.option(fc.string(), { nil: undefined }),
  formId: fc.option(fc.string(), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// Helper: Serialize query key for comparison
function serializeKey(key: readonly any[]): string {
  return JSON.stringify(key)
}

// Helper: Check if two objects are deeply equal
function areFiltersEqual(filters1: any, filters2: any): boolean {
  return JSON.stringify(filters1) === JSON.stringify(filters2)
}

describe('Query Key Uniqueness Properties', () => {
  /**
   * Feature: state-management, Property 1: Query Key Uniqueness
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
   */
  describe('Property 1: Query Key Uniqueness', () => {
    it('should generate unique keys for different user filters', () => {
      fc.assert(
        fc.property(userFiltersArb, userFiltersArb, (filters1, filters2) => {
          const key1 = serializeKey(userKeys.list(filters1 as UserFilters))
          const key2 = serializeKey(userKeys.list(filters2 as UserFilters))

          // If filters are equal, keys should be equal
          // If filters are different, keys should be different
          const filtersEqual = areFiltersEqual(filters1, filters2)
          const keysEqual = key1 === key2

          return filtersEqual === keysEqual
        }),
        { numRuns: 100 }
      )
    })

    it('should generate unique keys for different form filters', () => {
      fc.assert(
        fc.property(formFiltersArb, formFiltersArb, (filters1, filters2) => {
          const key1 = serializeKey(formKeys.list(filters1 as FormFilters))
          const key2 = serializeKey(formKeys.list(filters2 as FormFilters))

          const filtersEqual = areFiltersEqual(filters1, filters2)
          const keysEqual = key1 === key2

          return filtersEqual === keysEqual
        }),
        { numRuns: 100 }
      )
    })

    it('should generate unique keys for different response filters', () => {
      fc.assert(
        fc.property(responseFiltersArb, responseFiltersArb, (filters1, filters2) => {
          const key1 = serializeKey(responseKeys.list(filters1 as ResponseFilters))
          const key2 = serializeKey(responseKeys.list(filters2 as ResponseFilters))

          const filtersEqual = areFiltersEqual(filters1, filters2)
          const keysEqual = key1 === key2

          return filtersEqual === keysEqual
        }),
        { numRuns: 100 }
      )
    })

    it('should generate unique keys for different certificate filters', () => {
      fc.assert(
        fc.property(certificateFiltersArb, certificateFiltersArb, (filters1, filters2) => {
          const key1 = serializeKey(certificateKeys.list(filters1))
          const key2 = serializeKey(certificateKeys.list(filters2))

          const filtersEqual = areFiltersEqual(filters1, filters2)
          const keysEqual = key1 === key2

          return filtersEqual === keysEqual
        }),
        { numRuns: 100 }
      )
    })

    it('should generate different keys for different user IDs in detail queries', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (id1, id2) => {
          const key1 = serializeKey(userKeys.detail(id1))
          const key2 = serializeKey(userKeys.detail(id2))

          // If IDs are equal, keys should be equal
          // If IDs are different, keys should be different
          return (id1 === id2) === (key1 === key2)
        }),
        { numRuns: 100 }
      )
    })

    it('should generate different keys for different form IDs in detail queries', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (id1, id2) => {
          const key1 = serializeKey(formKeys.detail(id1))
          const key2 = serializeKey(formKeys.detail(id2))

          return (id1 === id2) === (key1 === key2)
        }),
        { numRuns: 100 }
      )
    })

    it('should generate different keys for different response form IDs', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (formId1, formId2) => {
          const key1 = serializeKey(responseKeys.byForm(formId1))
          const key2 = serializeKey(responseKeys.byForm(formId2))

          return (formId1 === formId2) === (key1 === key2)
        }),
        { numRuns: 100 }
      )
    })

    it('should generate different keys for different certificate user IDs', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (userId1, userId2) => {
          const key1 = serializeKey(certificateKeys.byUser(userId1))
          const key2 = serializeKey(certificateKeys.byUser(userId2))

          return (userId1 === userId2) === (key1 === key2)
        }),
        { numRuns: 100 }
      )
    })

    it('should generate hierarchical keys that allow partial invalidation', () => {
      // Test that list keys are prefixed by all keys
      fc.assert(
        fc.property(userFiltersArb, (filters) => {
          const allKey = userKeys.all
          const listKey = userKeys.list(filters as UserFilters)

          // List key should start with all key
          return listKey[0] === allKey[0]
        }),
        { numRuns: 100 }
      )
    })

    it('should generate detail keys that are prefixed by details base key', () => {
      fc.assert(
        fc.property(fc.string(), (id) => {
          const detailsKey = userKeys.details()
          const detailKey = userKeys.detail(id)

          // Detail key should start with details base key
          return (
            detailKey[0] === detailsKey[0] &&
            detailKey[1] === detailsKey[1]
          )
        }),
        { numRuns: 100 }
      )
    })

    it('should generate form withQuestions keys that extend detail keys', () => {
      fc.assert(
        fc.property(fc.string(), (id) => {
          const detailKey = formKeys.detail(id)
          const withQuestionsKey = formKeys.withQuestions(id)

          // withQuestions key should start with detail key
          return (
            withQuestionsKey[0] === detailKey[0] &&
            withQuestionsKey[1] === detailKey[1] &&
            withQuestionsKey[2] === detailKey[2]
          )
        }),
        { numRuns: 100 }
      )
    })

    it('should generate response byFormFiltered keys that extend byForm keys', () => {
      fc.assert(
        fc.property(fc.string(), responseFiltersArb, (formId, filters) => {
          const byFormKey = responseKeys.byForm(formId)
          const byFormFilteredKey = responseKeys.byFormFiltered(formId, filters as ResponseFilters)

          // byFormFiltered key should start with byForm key
          return (
            byFormFilteredKey[0] === byFormKey[0] &&
            byFormFilteredKey[1] === byFormKey[1] &&
            byFormFilteredKey[2] === byFormKey[2]
          )
        }),
        { numRuns: 100 }
      )
    })

    it('should ensure keys from different domains never collide', () => {
      // Test that keys from different domains have different base keys
      const userBase = userKeys.all[0]
      const formBase = formKeys.all[0]
      const responseBase = responseKeys.all[0]
      const certificateBase = certificateKeys.all[0]

      expect(userBase).not.toBe(formBase)
      expect(userBase).not.toBe(responseBase)
      expect(userBase).not.toBe(certificateBase)
      expect(formBase).not.toBe(responseBase)
      expect(formBase).not.toBe(certificateBase)
      expect(responseBase).not.toBe(certificateBase)
    })

    it('should generate consistent keys for same filters across multiple calls', () => {
      fc.assert(
        fc.property(userFiltersArb, (filters) => {
          const key1 = serializeKey(userKeys.list(filters as UserFilters))
          const key2 = serializeKey(userKeys.list(filters as UserFilters))
          const key3 = serializeKey(userKeys.list(filters as UserFilters))

          // All keys should be identical
          return key1 === key2 && key2 === key3
        }),
        { numRuns: 100 }
      )
    })

    it('should handle empty filters consistently', () => {
      const emptyFilters = {}
      const key1 = serializeKey(userKeys.list(emptyFilters))
      const key2 = serializeKey(userKeys.list(emptyFilters))

      expect(key1).toBe(key2)
    })

    it('should handle undefined filter values consistently', () => {
      const filters1 = { search: undefined, page: 1 }
      const filters2 = { search: undefined, page: 1 }

      const key1 = serializeKey(userKeys.list(filters1 as UserFilters))
      const key2 = serializeKey(userKeys.list(filters2 as UserFilters))

      expect(key1).toBe(key2)
    })
  })
})
