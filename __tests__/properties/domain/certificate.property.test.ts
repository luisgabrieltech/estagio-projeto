/**
 * Property-Based Tests for Certificate Domain
 *
 * Feature: domain-layer, Property 1: Schema Validation Consistency (certificate)
 * Feature: domain-layer, Property 4: Certificate Code Uniqueness
 * Validates: Requirements 2.4, 5.5
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  createCertificateSchema,
  validateCertificateSchema,
  certificateFiltersSchema,
  certificateMetadataSchema,
} from '@/lib/domain/certificate/certificate.schema'
import {
  generateValidationCode,
  generateCertificateHash,
} from '@/lib/domain/certificate/certificate.service'

// Helper: Generate valid non-whitespace strings (alphanumeric with some special chars)
const nonEmptyStringArb = (minLength: number, maxLength: number) =>
  fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(
    (s) => s.length >= minLength && s.length <= maxLength
  )

// Helper: Generate valid dates that can be converted to ISO string
const validDateArb = fc
  .date({
    min: new Date('2000-01-01'),
    max: new Date('2100-12-31'),
  })
  .filter((d) => !isNaN(d.getTime()))

// Helper: Generate valid email addresses that Zod will accept
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/),
    fc.stringMatching(/^[a-z]{2,10}$/),
    fc.constantFrom('com', 'org', 'net', 'edu', 'br', 'io')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

describe('Certificate Domain Properties', () => {
  /**
   * Feature: domain-layer, Property 1: Schema Validation Consistency (certificate)
   * Validates: Requirements 2.4
   *
   * For any certificate data that conforms to the entity's constraints
   * (required fields present, correct types, valid ranges), the corresponding
   * Zod schema SHALL accept the data; otherwise, the schema SHALL reject
   * with appropriate error messages.
   */
  describe('Property 1: Schema Validation Consistency', () => {
    it('should accept all valid certificate creation data', () => {
      // Arbitrary for valid certificate creation data
      const validCertificateArb = fc.record({
        userId: nonEmptyStringArb(1, 50),
        formId: nonEmptyStringArb(1, 50),
        validationCode: nonEmptyStringArb(1, 50),
        hash: nonEmptyStringArb(1, 100),
        metadata: fc.option(
          fc.record({
            completionDate: validDateArb.map((d) => d.toISOString()),
            formTitle: nonEmptyStringArb(1, 100),
            formDescription: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
            userName: nonEmptyStringArb(1, 50),
            userEmail: validEmailArb,
            workload: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
          }),
          { nil: undefined }
        ),
      })

      fc.assert(
        fc.property(validCertificateArb, (data) => {
          const result = createCertificateSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject certificate creation data with empty userId', () => {
      const invalidDataArb = fc.record({
        userId: fc.constant(''), // Empty userId
        formId: nonEmptyStringArb(1, 50),
        validationCode: nonEmptyStringArb(1, 50),
        hash: nonEmptyStringArb(1, 100),
      })

      fc.assert(
        fc.property(invalidDataArb, (data) => {
          const result = createCertificateSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should reject certificate creation data with empty formId', () => {
      const invalidDataArb = fc.record({
        userId: nonEmptyStringArb(1, 50),
        formId: fc.constant(''), // Empty formId
        validationCode: nonEmptyStringArb(1, 50),
        hash: nonEmptyStringArb(1, 100),
      })

      fc.assert(
        fc.property(invalidDataArb, (data) => {
          const result = createCertificateSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should accept all valid certificate validation data', () => {
      const validValidationArb = fc.record({
        validationCode: nonEmptyStringArb(1, 50),
        ipAddress: fc.option(fc.ipV4(), { nil: undefined }),
        userAgent: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
      })

      fc.assert(
        fc.property(validValidationArb, (data) => {
          const result = validateCertificateSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject certificate validation data with empty validationCode', () => {
      const invalidDataArb = fc.record({
        validationCode: fc.constant(''), // Empty validation code
        ipAddress: fc.option(fc.ipV4(), { nil: undefined }),
      })

      fc.assert(
        fc.property(invalidDataArb, (data) => {
          const result = validateCertificateSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should accept all valid certificate filter data', () => {
      const validFiltersArb = fc.record({
        userId: fc.option(nonEmptyStringArb(1, 50), { nil: undefined }),
        formId: fc.option(nonEmptyStringArb(1, 50), { nil: undefined }),
        page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
        pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
      })

      fc.assert(
        fc.property(validFiltersArb, (data) => {
          const result = certificateFiltersSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject certificate filter data with invalid pageSize (> 100)', () => {
      const invalidFiltersArb = fc.record({
        userId: fc.option(nonEmptyStringArb(1, 50), { nil: undefined }),
        formId: fc.option(nonEmptyStringArb(1, 50), { nil: undefined }),
        page: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
        pageSize: fc.integer({ min: 101, max: 500 }), // Invalid: > 100
      })

      fc.assert(
        fc.property(invalidFiltersArb, (data) => {
          const result = certificateFiltersSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })

    it('should accept all valid certificate metadata', () => {
      const validMetadataArb = fc.record({
        completionDate: validDateArb.map((d) => d.toISOString()),
        formTitle: nonEmptyStringArb(1, 100),
        formDescription: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
        userName: nonEmptyStringArb(1, 50),
        userEmail: validEmailArb,
        workload: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
      })

      fc.assert(
        fc.property(validMetadataArb, (data) => {
          const result = certificateMetadataSchema.safeParse(data)
          return result.success === true
        }),
        { numRuns: 100 }
      )
    })

    it('should reject certificate metadata with invalid email', () => {
      const invalidMetadataArb = fc.record({
        completionDate: validDateArb.map((d) => d.toISOString()),
        formTitle: nonEmptyStringArb(1, 100),
        userName: nonEmptyStringArb(1, 50),
        userEmail: fc.string().filter((s) => !s.includes('@')), // Invalid email
      })

      fc.assert(
        fc.property(invalidMetadataArb, (data) => {
          const result = certificateMetadataSchema.safeParse(data)
          return result.success === false
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: domain-layer, Property 4: Certificate Code Uniqueness
   * Validates: Requirements 5.5
   *
   * For any certificate generated by CertificateService, the validation code
   * SHALL be unique across all certificates in the system.
   *
   * We test this by generating multiple codes with different inputs and
   * verifying they are all unique.
   */
  describe('Property 4: Certificate Code Uniqueness', () => {
    it('should generate unique validation codes for different user/form combinations', () => {
      // Generate pairs of (formId, userId) and verify all codes are unique
      const inputPairsArb = fc.array(
        fc.record({
          formId: fc.uuid(),
          userId: fc.uuid(),
        }),
        { minLength: 10, maxLength: 50 }
      )

      fc.assert(
        fc.property(inputPairsArb, (pairs) => {
          const codes = pairs.map((pair) => generateValidationCode(pair.formId, pair.userId))
          const uniqueCodes = new Set(codes)
          // All generated codes should be unique
          return uniqueCodes.size === codes.length
        }),
        { numRuns: 100 }
      )
    })

    it('should generate codes with consistent format (AVALIA-XXXXX-XXXX)', () => {
      const inputArb = fc.record({
        formId: fc.uuid(),
        userId: fc.uuid(),
      })

      fc.assert(
        fc.property(inputArb, ({ formId, userId }) => {
          const code = generateValidationCode(formId, userId)
          // Code should match the expected format
          const formatRegex = /^AVALIA-[A-Z0-9]{5}-[A-Z0-9]{1,4}$/
          return formatRegex.test(code)
        }),
        { numRuns: 100 }
      )
    })

    it('should generate unique hashes for different certificate data', () => {
      const certificateDataArb = fc.array(
        fc.record({
          userId: fc.uuid(),
          formId: fc.uuid(),
          validationCode: fc.string({ minLength: 10, maxLength: 20 }),
          issuedAt: validDateArb,
        }),
        { minLength: 10, maxLength: 50 }
      )

      fc.assert(
        fc.property(certificateDataArb, (dataList) => {
          const hashes = dataList.map((data) => generateCertificateHash(data))
          const uniqueHashes = new Set(hashes)
          // All generated hashes should be unique
          return uniqueHashes.size === hashes.length
        }),
        { numRuns: 100 }
      )
    })

    it('should generate deterministic hashes for same input data', () => {
      const certificateDataArb = fc.record({
        userId: fc.uuid(),
        formId: fc.uuid(),
        validationCode: fc.string({ minLength: 10, maxLength: 20 }),
        issuedAt: validDateArb,
      })

      fc.assert(
        fc.property(certificateDataArb, (data) => {
          const hash1 = generateCertificateHash(data)
          const hash2 = generateCertificateHash(data)
          // Same input should produce same hash
          return hash1 === hash2
        }),
        { numRuns: 100 }
      )
    })

    it('should generate different codes even for same user/form when called multiple times', () => {
      // This tests that the randomness in code generation works
      const inputArb = fc.record({
        formId: fc.uuid(),
        userId: fc.uuid(),
      })

      fc.assert(
        fc.property(inputArb, ({ formId, userId }) => {
          // Generate multiple codes for the same input
          const codes = Array.from({ length: 5 }, () => generateValidationCode(formId, userId))
          const uniqueCodes = new Set(codes)
          // Due to timestamp and random components, codes should be unique
          // (with very high probability)
          return uniqueCodes.size === codes.length
        }),
        { numRuns: 50 }
      )
    })
  })
})
