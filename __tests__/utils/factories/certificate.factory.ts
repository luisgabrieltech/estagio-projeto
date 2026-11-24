/**
 * Certificate Factory
 * 
 * Factory functions for creating test certificate data
 * 
 * @module __tests__/utils/factories/certificate.factory
 * Requirements: 3.3
 */
import type { 
  Certificate, 
  CertificateWithDetails, 
  CertificateMetadata,
  CertificateValidation 
} from '@/types/entities/certificate'
import { TEST_IDS, TEST_EMAILS, TEST_NAMES } from '../constants'

let certificateIdCounter = 0

/**
 * Creates a test certificate with default values
 * 
 * @param overrides - Partial certificate data to override defaults
 * @returns Complete Certificate object
 */
export function createCertificate(overrides: Partial<Certificate> = {}): Certificate {
  certificateIdCounter++
  const now = new Date()
  
  return {
    id: `certificate-${certificateIdCounter}`,
    validationCode: `CERT-${certificateIdCounter.toString().padStart(6, '0')}`,
    userId: TEST_IDS.USER.DEFAULT,
    formId: TEST_IDS.FORM.DEFAULT,
    issuedAt: now,
    hash: `hash-${certificateIdCounter}`,
    metadata: {
      completionDate: now.toISOString(),
      formTitle: 'Test Form',
      userName: TEST_NAMES.DEFAULT,
      userEmail: TEST_EMAILS.DEFAULT,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Creates multiple test certificates
 * 
 * @param count - Number of certificates to create
 * @param overrides - Partial certificate data to apply to all certificates
 * @returns Array of Certificate objects
 */
export function createCertificates(
  count: number, 
  overrides: Partial<Certificate> = {}
): Certificate[] {
  return Array.from({ length: count }, () => createCertificate(overrides))
}

/**
 * Creates a certificate with full details
 * 
 * @param overrides - Partial data to override defaults
 * @returns CertificateWithDetails object
 */
export function createCertificateWithDetails(
  overrides: Partial<CertificateWithDetails> = {}
): CertificateWithDetails {
  const cert = createCertificate()
  
  return {
    ...cert,
    user: {
      id: TEST_IDS.USER.DEFAULT,
      name: TEST_NAMES.DEFAULT,
      email: TEST_EMAILS.DEFAULT,
    },
    form: {
      id: TEST_IDS.FORM.DEFAULT,
      title: 'Test Form',
      description: 'Test form description',
    },
    ...overrides,
  }
}

/**
 * Creates certificate metadata
 * 
 * @param overrides - Partial data to override defaults
 * @returns CertificateMetadata object
 */
export function createCertificateMetadata(
  overrides: Partial<CertificateMetadata> = {}
): CertificateMetadata {
  return {
    completionDate: new Date().toISOString(),
    formTitle: 'Test Form',
    formDescription: 'Test form description',
    userName: TEST_NAMES.DEFAULT,
    userEmail: TEST_EMAILS.DEFAULT,
    workload: '4 horas',
    ...overrides,
  }
}

/**
 * Creates a valid certificate validation result
 * 
 * @param certificate - Optional certificate to include
 * @returns CertificateValidation object with valid=true
 */
export function createValidCertificateValidation(
  certificate?: CertificateWithDetails
): CertificateValidation {
  return {
    valid: true,
    certificate: certificate || createCertificateWithDetails(),
  }
}

/**
 * Creates an invalid certificate validation result
 * 
 * @param message - Error message
 * @returns CertificateValidation object with valid=false
 */
export function createInvalidCertificateValidation(
  message: string = 'Certificate not found'
): CertificateValidation {
  return {
    valid: false,
    message,
  }
}

/**
 * Resets the certificate ID counter
 * Useful for test isolation
 */
export function resetCertificateFactory(): void {
  certificateIdCounter = 0
}
