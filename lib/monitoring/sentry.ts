/**
 * Sentry Wrapper Module
 * Provides a unified interface for error tracking with Sentry.
 *
 * Requirements: 5.3.1, 5.3.2
 */

import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"

/**
 * User context for Sentry
 */
export interface SentryUser {
  id: string
  email?: string
  username?: string
  role?: string
}

/**
 * Request context for Sentry
 */
export interface SentryRequestContext {
  requestId?: string
  method?: string
  path?: string
  userAgent?: string
  ip?: string
}

export function isSentryEnabled(): boolean {
  return Boolean(
    typeof window === 'undefined'
      ? process.env.SENTRY_DSN
      : process.env.NEXT_PUBLIC_SENTRY_DSN,
  )
}

/**
 * Get the Sentry logger for structured logging
 * Use this for logging events that should be tracked in Sentry
 *
 * @example
 * ```typescript
 * const { logger } = getSentryLogger()
 * logger.info("User logged in", { userId: "123" })
 * logger.error("Payment failed", { orderId: "456", amount: 99.99 })
 * ```
 */
export function getSentryLogger() {
  return { logger: Sentry.logger }
}

/**
 * Set user context for Sentry
 * This helps identify which user experienced an error.
 *
 * Requirements: 5.3.2
 *
 * @example
 * ```typescript
 * setUser({ id: 'user-123', email: 'user@example.com', role: 'admin' })
 * ```
 */
export function setUser(user: SentryUser | null): void {
  if (!isSentryEnabled()) return

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Clear user context from Sentry
 * Call this when user logs out.
 */
export function clearUser(): void {
  if (!isSentryEnabled()) return
  Sentry.setUser(null)
}

/**
 * Set request context for Sentry
 * This adds request information to error reports.
 *
 * Requirements: 5.3.2
 */
export function setRequestContext(context: SentryRequestContext): void {
  if (!isSentryEnabled()) return

  Sentry.setContext("request", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    userAgent: context.userAgent,
    ip: context.ip,
  })

  // Also set as tags for easier filtering
  if (context.requestId) {
    Sentry.setTag("request_id", context.requestId)
  }
  if (context.method) {
    Sentry.setTag("http_method", context.method)
  }
  if (context.path) {
    Sentry.setTag("http_path", context.path)
  }
}

/**
 * Extract request context from NextRequest
 */
export function extractRequestContext(request: NextRequest): SentryRequestContext {
  const url = new URL(request.url)

  return {
    requestId: request.headers.get("x-request-id") || undefined,
    method: request.method,
    path: url.pathname,
    userAgent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
  }
}

/**
 * Capture an exception and send it to Sentry
 *
 * Requirements: 5.3.1
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation()
 * } catch (error) {
 *   captureException(error, { userId: 'user-123', action: 'riskyOperation' })
 * }
 * ```
 */
export function captureException(error: unknown, context?: Record<string, unknown>): string | undefined {
  if (!isSentryEnabled()) {
    // Log to console in development when Sentry is not configured
    console.error("[Sentry disabled] Exception:", error, context)
    return undefined
  }

  // Add extra context if provided
  if (context) {
    Sentry.setContext("extra", context)
  }

  // Capture the exception
  const eventId = Sentry.captureException(error)

  return eventId
}

/**
 * Capture a message and send it to Sentry
 * Use this for non-error events that you want to track.
 *
 * Requirements: 5.3.1
 *
 * @example
 * ```typescript
 * captureMessage('User performed unusual action', 'warning', { userId: 'user-123' })
 * ```
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
): string | undefined {
  if (!isSentryEnabled()) {
    // Log to console in development when Sentry is not configured
    console.log(`[Sentry disabled] Message (${level}):`, message, context)
    return undefined
  }

  // Add extra context if provided
  if (context) {
    Sentry.setContext("extra", context)
  }

  // Capture the message
  const eventId = Sentry.captureMessage(message, level)

  return eventId
}

/**
 * Add a breadcrumb to the current Sentry scope
 * Breadcrumbs help understand what happened before an error.
 *
 * @example
 * ```typescript
 * addBreadcrumb({
 *   category: 'user',
 *   message: 'User clicked submit button',
 *   level: 'info',
 * })
 * ```
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isSentryEnabled()) return
  Sentry.addBreadcrumb(breadcrumb)
}

/**
 * Set a tag on the current Sentry scope
 * Tags are indexed and searchable in Sentry.
 */
export function setTag(key: string, value: string): void {
  if (!isSentryEnabled()) return
  Sentry.setTag(key, value)
}

/**
 * Set extra context on the current Sentry scope
 * Extra context is not indexed but provides additional information.
 */
export function setExtra(key: string, value: unknown): void {
  if (!isSentryEnabled()) return
  Sentry.setExtra(key, value)
}

/**
 * Start a span for performance monitoring
 * Use this to measure the duration of operations.
 *
 * @example
 * ```typescript
 * // UI interaction
 * startSpan({ op: "ui.click", name: "Submit Form" }, (span) => {
 *   span.setAttribute("formId", "contact-form")
 *   submitForm()
 * })
 *
 * // API call
 * const data = await startSpan(
 *   { op: "http.client", name: "GET /api/users" },
 *   async () => {
 *     const response = await fetch("/api/users")
 *     return response.json()
 *   }
 * )
 * ```
 */
export function startSpan<T>(
  options: { op: string; name: string },
  callback: (span: Sentry.Span) => T
): T {
  if (!isSentryEnabled()) {
    // Execute callback without span when Sentry is disabled
    return callback({} as Sentry.Span)
  }

  return Sentry.startSpan(options, callback)
}

/**
 * Start an async span for performance monitoring
 * Use this to measure the duration of async operations.
 *
 * @example
 * ```typescript
 * const userData = await startSpanAsync(
 *   { op: "db.query", name: "Fetch User" },
 *   async (span) => {
 *     span.setAttribute("userId", userId)
 *     return await db.user.findUnique({ where: { id: userId } })
 *   }
 * )
 * ```
 */
export async function startSpanAsync<T>(
  options: { op: string; name: string },
  callback: (span: Sentry.Span) => Promise<T>
): Promise<T> {
  if (!isSentryEnabled()) {
    // Execute callback without span when Sentry is disabled
    return callback({} as Sentry.Span)
  }

  return Sentry.startSpan(options, callback)
}

/**
 * Wrap an async function with Sentry error handling
 * Automatically captures any errors thrown by the function.
 *
 * Requirements: 5.3.1, 5.3.2
 *
 * @example
 * ```typescript
 * const result = await withSentry(
 *   async () => await riskyOperation(),
 *   { operation: 'riskyOperation', userId: 'user-123' }
 * )
 * ```
 */
export async function withSentry<T>(fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    captureException(error, context)
    throw error
  }
}

/**
 * Wrap an async function with Sentry span and error handling
 * Combines performance monitoring with error tracking.
 *
 * @example
 * ```typescript
 * const result = await withSentrySpan(
 *   { op: "api.call", name: "Create User" },
 *   async (span) => {
 *     span.setAttribute("email", email)
 *     return await userService.create(data)
 *   }
 * )
 * ```
 */
export async function withSentrySpan<T>(
  options: { op: string; name: string },
  callback: (span: Sentry.Span) => Promise<T>
): Promise<T> {
  if (!isSentryEnabled()) {
    return callback({} as Sentry.Span)
  }

  return Sentry.startSpan(options, async (span) => {
    try {
      return await callback(span)
    } catch (error) {
      captureException(error, { spanOp: options.op, spanName: options.name })
      throw error
    }
  })
}

/**
 * Flush Sentry events before the process exits
 * Call this in serverless environments to ensure events are sent.
 */
export async function flush(timeout = 2000): Promise<boolean> {
  if (!isSentryEnabled()) return true
  return Sentry.flush(timeout)
}

// Re-export Sentry for advanced usage
export { Sentry }
