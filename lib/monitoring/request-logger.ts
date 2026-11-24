/**
 * Request Logger Module
 * Monitoring Infrastructure - Sistema CPA
 *
 * Provides request logging utilities for HTTP requests.
 * Requirements: 5.1.1, 5.1.2, 5.1.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger, RequestContext } from '@/lib/core'
import { randomUUID } from 'crypto'

/**
 * Request log entry with timing information
 */
export interface RequestLogEntry {
  requestId: string
  method: string
  path: string
  statusCode?: number
  duration?: number
  timestamp: Date
  userId?: string
  userAgent?: string
  ip?: string
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID()
}

/**
 * Extract request metadata from NextRequest
 */
export function extractRequestMetadata(request: NextRequest): Omit<RequestLogEntry, 'statusCode' | 'duration'> {
  const url = new URL(request.url)
  
  return {
    requestId: request.headers.get('x-request-id') || generateRequestId(),
    method: request.method,
    path: url.pathname,
    timestamp: new Date(),
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        request.headers.get('x-real-ip') || 
        undefined,
  }
}

/**
 * Log the start of a request
 * Requirements: 5.1.1
 */
export function logRequestStart(metadata: Omit<RequestLogEntry, 'statusCode' | 'duration'>): void {
  const requestContext: RequestContext = {
    requestId: metadata.requestId,
    method: metadata.method,
    path: metadata.path,
    userId: metadata.userId,
  }
  
  const requestLogger = createRequestLogger(requestContext)
  
  requestLogger.info('Request started', {
    userAgent: metadata.userAgent,
    ip: metadata.ip,
  })
}

/**
 * Log the completion of a request
 * Requirements: 5.1.2
 */
export function logRequestEnd(
  metadata: Omit<RequestLogEntry, 'statusCode' | 'duration'>,
  statusCode: number,
  startTime: number
): void {
  const duration = Date.now() - startTime
  
  const requestContext: RequestContext = {
    requestId: metadata.requestId,
    method: metadata.method,
    path: metadata.path,
    statusCode,
    duration,
    userId: metadata.userId,
  }
  
  const requestLogger = createRequestLogger(requestContext)
  
  // Use appropriate log level based on status code
  if (statusCode >= 500) {
    requestLogger.error('Request completed with server error', undefined, {
      userAgent: metadata.userAgent,
      ip: metadata.ip,
    })
  } else if (statusCode >= 400) {
    requestLogger.warn('Request completed with client error', {
      userAgent: metadata.userAgent,
      ip: metadata.ip,
    })
  } else {
    requestLogger.info('Request completed', {
      userAgent: metadata.userAgent,
      ip: metadata.ip,
    })
  }
}

/**
 * Create a request logger context for use in API routes
 * This allows API routes to log with request context
 * Requirements: 5.1.1, 5.1.2
 */
export function createApiRequestLogger(request: NextRequest, userId?: string) {
  const metadata = extractRequestMetadata(request)
  const startTime = Date.now()
  
  const requestContext: RequestContext = {
    requestId: metadata.requestId,
    method: metadata.method,
    path: metadata.path,
    userId,
  }
  
  const requestLogger = createRequestLogger(requestContext)
  
  return {
    logger: requestLogger,
    requestId: metadata.requestId,
    metadata,
    startTime,
    /**
     * Log request completion with response status
     */
    logCompletion: (response: NextResponse | Response) => {
      logRequestEnd(
        { ...metadata, userId },
        response.status,
        startTime
      )
    },
  }
}

/**
 * Wrapper function to add request logging to API route handlers
 * Requirements: 5.1.1, 5.1.2, 5.1.3
 * 
 * @example
 * ```typescript
 * export const GET = withRequestLogging(async (request) => {
 *   // Your handler logic
 *   return Response.json({ data: 'example' })
 * })
 * ```
 */
export function withRequestLogging<T extends NextRequest>(
  handler: (request: T) => Promise<Response | NextResponse>
): (request: T) => Promise<Response | NextResponse> {
  return async (request: T) => {
    const metadata = extractRequestMetadata(request)
    const startTime = Date.now()
    
    // Log request start
    logRequestStart(metadata)
    
    try {
      // Execute the handler
      const response = await handler(request)
      
      // Log request completion
      logRequestEnd(metadata, response.status, startTime)
      
      // Add request ID to response headers for tracing
      const headers = new Headers(response.headers)
      headers.set('x-request-id', metadata.requestId)
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      // Log error
      const requestContext: RequestContext = {
        requestId: metadata.requestId,
        method: metadata.method,
        path: metadata.path,
      }
      
      const requestLogger = createRequestLogger(requestContext)
      requestLogger.error(
        'Request failed with unhandled error',
        error instanceof Error ? error : new Error(String(error)),
        {
          userAgent: metadata.userAgent,
          ip: metadata.ip,
          duration: Date.now() - startTime,
        }
      )
      
      // Re-throw to let the error handler deal with it
      throw error
    }
  }
}

/**
 * Log an error within a request context
 * Requirements: 5.1.3
 */
export function logRequestError(
  metadata: Omit<RequestLogEntry, 'statusCode' | 'duration'>,
  error: Error,
  additionalContext?: Record<string, unknown>
): void {
  const requestContext: RequestContext = {
    requestId: metadata.requestId,
    method: metadata.method,
    path: metadata.path,
    userId: metadata.userId,
  }
  
  const requestLogger = createRequestLogger(requestContext)
  
  requestLogger.error('Request error', error, {
    userAgent: metadata.userAgent,
    ip: metadata.ip,
    ...additionalContext,
  })
}
