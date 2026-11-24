import type { Certificate, CertificateWithDetails } from '@/types/entities/certificate'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { CreateCertificateDTO, CertificateFiltersDTO } from './certificate.schema'

/**
 * Data for logging a certificate validation
 */
export interface ValidationLogData {
  certificateId: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Interface for Certificate repository operations
 * Abstracts data access layer from business logic
 */
export interface ICertificateRepository {
  /**
   * Find a certificate by its unique ID
   * @param id - Certificate's unique identifier
   * @returns Certificate or null if not found
   */
  findById(id: string): Promise<Certificate | null>

  /**
   * Find a certificate by its validation code
   * @param validationCode - Certificate's unique validation code
   * @returns Certificate with user and form details or null if not found
   */
  findByCode(validationCode: string): Promise<CertificateWithDetails | null>

  /**
   * Find certificates by user ID with pagination
   * @param userId - User's unique identifier
   * @param filters - Pagination options
   * @returns Paginated list of certificates with details
   */
  findByUser(userId: string, filters?: CertificateFiltersDTO): Promise<PaginatedResponse<CertificateWithDetails>>

  /**
   * Find a certificate by user and form combination
   * @param userId - User's unique identifier
   * @param formId - Form's unique identifier
   * @returns Certificate or null if not found
   */
  findByUserAndForm(userId: string, formId: string): Promise<Certificate | null>

  /**
   * Create a new certificate
   * @param data - Certificate creation data
   * @returns Created certificate
   */
  create(data: CreateCertificateDTO): Promise<Certificate>

  /**
   * Log a certificate validation attempt
   * @param data - Validation log data
   */
  logValidation(data: ValidationLogData): Promise<void>

  /**
   * Count certificates matching optional filters
   * @param filters - Optional filter criteria
   * @returns Number of matching certificates
   */
  count(filters?: Partial<CertificateFiltersDTO>): Promise<number>

  /**
   * Check if a validation code already exists
   * @param validationCode - Code to check
   * @returns True if code exists, false otherwise
   */
  codeExists(validationCode: string): Promise<boolean>
}
