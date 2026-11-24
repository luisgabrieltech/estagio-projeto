/**
 * Logger Module - Barrel Export
 * Core Infrastructure - Sistema CPA
 *
 * Requirements: 1.1, 5.1.1, 5.1.2
 */

// Types and interfaces
export type { LogLevel, LogContext, LogEntry, Logger, RequestContext } from './logger.types'

// Logger implementation and factory
export { LoggerImpl, logger, createLogger, createRequestLogger } from './logger'

// Formatters
export { formatDev, formatJson } from './formatters'
