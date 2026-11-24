import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { DomainError } from './domain-error'
import { ValidationError } from './validation-error'
import { NotFoundError } from './not-found-error'
import { ForbiddenError } from './forbidden-error'
import { ConflictError } from './conflict-error'
import { createLogger } from '@/lib/core'
import { formatError, ErrorResponse } from '@/lib/api/response-format'
import { ErrorCode } from '@/lib/api/error-codes'
import { captureException, setTag, isSentryEnabled } from '@/lib/monitoring/sentry'

const errorLogger = createLogger({ module: 'domain-error-handler' })

function getErrorCodeFromDomainError(error: DomainError): ErrorCode {
  if (error instanceof ValidationError) {
    return ErrorCode.VALIDATION_ERROR
  }
  if (error instanceof NotFoundError) {
    return ErrorCode.NOT_FOUND
  }
  if (error instanceof ForbiddenError) {
    return ErrorCode.FORBIDDEN
  }
  if (error instanceof ConflictError) {
    return ErrorCode.CONFLICT
  }
  return ErrorCode.INTERNAL_ERROR
}

export function handleDomainError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof DomainError) {
    const errorCode = getErrorCodeFromDomainError(error)
    
    const details = error instanceof ValidationError && Object.keys(error.details).length > 0
      ? error.details
      : undefined

    return formatError(errorCode, error.message, details)
  }

  if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const path = err.path.join('.') || 'root'
      acc[path] = acc[path] || []
      acc[path].push(err.message)
      return acc
    }, {} as Record<string, string[]>)

    return formatError(ErrorCode.VALIDATION_ERROR, 'Dados inválidos', details)
  }

  errorLogger.error('Unexpected error', error instanceof Error ? error : undefined)
  
  if (isSentryEnabled()) {
    setTag('error_type', 'unhandled')
    captureException(error, {
      errorType: 'unhandled',
      source: 'handleDomainError',
    })
  }
  
  return formatError(ErrorCode.INTERNAL_ERROR, 'Erro interno do servidor')
}
