/**
 * Monitoring Infrastructure
 * Sistema CPA
 *
 * Provides monitoring and observability features:
 * - Health checks for application and dependencies
 * - Request logging for HTTP requests
 * - Error tracking with Sentry
 * - (Future) Metrics collection for API performance
 */

// Health check exports
export { checkHealth, checkDatabase } from './health'
export type { HealthStatus, ComponentHealth } from './health'

// Request logging exports
export {
  generateRequestId,
  extractRequestMetadata,
  logRequestStart,
  logRequestEnd,
  createApiRequestLogger,
  withRequestLogging,
  logRequestError,
} from './request-logger'
export type { RequestLogEntry } from './request-logger'

// Sentry error tracking exports
export {
  isSentryEnabled,
  getSentryLogger,
  setUser,
  clearUser,
  setRequestContext,
  extractRequestContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  setTag,
  setExtra,
  startSpan,
  startSpanAsync,
  withSentry,
  withSentrySpan,
  flush,
  Sentry,
} from './sentry'
export type { SentryUser, SentryRequestContext } from './sentry'
