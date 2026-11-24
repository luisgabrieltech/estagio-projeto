import { LogLevel, LogContext, LogEntry, Logger, RequestContext } from './logger.types'
import { formatDev, formatJson } from './formatters'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export class LoggerImpl implements Logger {
  private level: LogLevel
  private context: LogContext
  private isDev: boolean

  constructor(level: LogLevel = 'info', context: LogContext = {}) {
    this.level = level
    this.context = context
    this.isDev = process.env.NODE_ENV === 'development'
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    try {
      const formatted = this.isDev ? formatDev(entry) : formatJson(entry)

      if (level === 'error') {
        console.error(formatted)
      } else if (level === 'warn') {
        console.warn(formatted)
      } else {
        console.log(formatted)
      }
    } catch {
      console.log(JSON.stringify(entry))
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error)
  }

  child(context: LogContext): Logger {
    return new LoggerImpl(this.level, { ...this.context, ...context })
  }

  withRequest(requestContext: RequestContext): Logger {
    return new LoggerImpl(this.level, {
      ...this.context,
      requestId: requestContext.requestId,
      method: requestContext.method,
      path: requestContext.path,
      ...(requestContext.statusCode !== undefined && { statusCode: requestContext.statusCode }),
      ...(requestContext.duration !== undefined && { duration: requestContext.duration }),
      ...(requestContext.userId !== undefined && { userId: requestContext.userId }),
    })
  }
}

export const logger = new LoggerImpl(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
)

export function createLogger(context: LogContext): Logger {
  return logger.child(context)
}

export function createRequestLogger(requestContext: RequestContext): Logger {
  return logger.withRequest(requestContext)
}
