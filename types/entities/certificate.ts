/**
 * Certificate entity types
 * 
 * Types related to certificates generated for form completion
 */

/**
 * Certificate metadata stored in the database
 */
export interface CertificateMetadata {
  /** Date when the form was completed */
  completionDate: string
  /** Title of the completed form */
  formTitle: string
  /** Optional description of the form */
  formDescription?: string
  /** Name of the user who completed the form */
  userName: string
  /** Email of the user who completed the form */
  userEmail: string
  /** Optional workload hours for the certificate */
  workload?: string
}

/**
 * Certificate entity from database
 */
export interface Certificate {
  id: string
  validationCode: string
  userId: string
  formId: string
  issuedAt: Date
  hash: string
  metadata?: CertificateMetadata
  createdAt: Date
  updatedAt: Date
}

/**
 * Certificate with user and form details
 */
export interface CertificateWithDetails extends Certificate {
  user: {
    id: string
    name: string
    email: string
  }
  form: {
    id: string
    title: string
    description: string
  }
}

/**
 * Certificate validation result
 */
export interface CertificateValidation {
  valid: boolean
  certificate?: CertificateWithDetails
  message?: string
}

/** Minimal confirmation returned by the public certificate lookup. */
export interface PublicCertificateVerification {
  isValid: true
  certificate: {
    validationCode: string
    issuedAt: string
    formTitle: string
  }
}
