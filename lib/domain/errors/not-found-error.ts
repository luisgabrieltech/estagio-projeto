import { DomainError } from './domain-error'

/**
 * Error thrown when a requested resource is not found.
 */
export class NotFoundError extends DomainError {
  readonly statusCode = 404
  readonly code = 'NOT_FOUND'

  constructor(resource: string, id?: string) {
    super(id ? `${resource} com ID ${id} não encontrado` : `${resource} não encontrado`)
  }
}
