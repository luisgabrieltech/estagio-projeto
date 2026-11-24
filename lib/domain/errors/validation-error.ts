import { DomainError } from './domain-error'

/**
 * Error thrown when data validation fails.
 * Contains details about which fields failed validation.
 */
export class ValidationError extends DomainError {
  readonly statusCode = 400
  readonly code = 'VALIDATION_ERROR'
  readonly details: Record<string, string[]>

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message)
    this.details = details
  }
}
