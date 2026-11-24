import { DomainError } from './domain-error'

/**
 * Error thrown when an operation conflicts with the current state.
 * Example: trying to create a user with an email that already exists.
 */
export class ConflictError extends DomainError {
  readonly statusCode = 409
  readonly code = 'CONFLICT'

  constructor(message: string) {
    super(message)
  }
}
