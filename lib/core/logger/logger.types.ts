export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface RequestContext {
  requestId: string
  method: string
  path: string
  statusCode?: number
  duration?: number
  userId?: string
}

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  child(context: LogContext): Logger
  withRequest(requestContext: RequestContext): Logger
}
