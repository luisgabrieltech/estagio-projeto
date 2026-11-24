import { DomainError } from './domain-error'

/**
 * Error thrown when a user doesn't have permission to perform an action.
 */
export class ForbiddenError extends DomainError {
  readonly statusCode = 403
  readonly code = 'FORBIDDEN'

  constructor(message: string = 'Acesso negado') {
    super(message)
  }
}
