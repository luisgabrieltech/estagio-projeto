/**
 * Validation and error types
 * 
 * Types for validation results and error handling
 */

/**
 * Validation error for a specific field
 */
export interface FieldError {
  /** Field name that has the error */
  field: string
  /** Error message */
  message: string
  /** Error code for programmatic handling */
  code?: string
}

/**
 * Validation result
 * 
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   errors: [
 *     { field: 'email', message: 'Email is required' },
 *     { field: 'password', message: 'Password must be at least 8 characters' }
 *   ]
 * }
 * ```
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** List of validation errors (if any) */
  errors?: FieldError[]
  /** Additional validation data */
  data?: Record<string, any>
}

/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Application error
 * 
 * @example
 * ```typescript
 * const error: AppError = {
 *   code: ErrorCode.NOT_FOUND,
 *   message: 'User not found',
 *   statusCode: 404,
 *   details: { userId: '123' }
 * }
 * ```
 */
export interface AppError {
  /** Error code */
  code: ErrorCode | string
  /** Human-readable error message */
  message: string
  /** HTTP status code */
  statusCode?: number
  /** Additional error details */
  details?: Record<string, any>
  /** Original error (for debugging) */
  originalError?: Error
}
