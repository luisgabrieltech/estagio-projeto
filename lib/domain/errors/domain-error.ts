export abstract class DomainError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
