/**
 * Property-Based Tests for Logger
 *
 * Feature: core-infrastructure, Property 1: Log Entry Completeness
 * Feature: core-infrastructure, Property 2: Log Level Filtering
 * Feature: core-infrastructure, Property 3: Context Inheritance
 * Validates: Requirements 1.1, 1.2, 2.1-2.4, 3.1, 3.2
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { LoggerImpl } from '@/lib/core/logger/logger'
import type { LogLevel, LogContext, LogEntry } from '@/lib/core/logger/logger.types'

// Log level ordering for filtering tests
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Arbitraries for generating test data
const logLevelArb = fc.constantFrom<LogLevel>('debug', 'info', 'warn', 'error')

const nonEmptyMessageArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0)

// Exclude special JavaScript property names that exist on all objects
const RESERVED_KEYS = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString', 'valueOf']

const contextKeyArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !RESERVED_KEYS.includes(s))

const contextValueArb = fc.oneof(
  fc.string({ maxLength: 100 }),
  fc.integer(),
  fc.boolean(),
  fc.constant(null)
)

const contextArb: fc.Arbitrary<LogContext> = fc.dictionary(contextKeyArb, contextValueArb, {
  minKeys: 0,
  maxKeys: 5,
})

describe('Logger Properties', () => {
  let consoleLogs: string[] = []
  let consoleWarns: string[] = []
  let consoleErrors: string[] = []

  beforeEach(() => {
    consoleLogs = []
    consoleWarns = []
    consoleErrors = []

    // Set to production to get JSON output (easier to parse)
    vi.stubEnv('NODE_ENV', 'production')

    vi.spyOn(console, 'log').mockImplementation((msg: string) => {
      consoleLogs.push(msg)
    })
    vi.spyOn(console, 'warn').mockImplementation((msg: string) => {
      consoleWarns.push(msg)
    })
    vi.spyOn(console, 'error').mockImplementation((msg: string) => {
      consoleErrors.push(msg)
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  /**
   * Feature: core-infrastructure, Property 1: Log Entry Completeness
   * Validates: Requirements 1.1, 2.1, 2.2, 2.3, 2.4
   *
   * For any log call (debug, info, warn, error), the generated log entry
   * SHALL contain timestamp (ISO 8601), level, and message fields.
   */
  describe('Property 1: Log Entry Completeness', () => {
    it('should include timestamp, level, and message in all log entries', () => {
      fc.assert(
        fc.property(logLevelArb, nonEmptyMessageArb, (level, message) => {
          // Reset captured logs
          consoleLogs = []
          consoleWarns = []
          consoleErrors = []

          // Create logger with debug level to capture all logs
          const testLogger = new LoggerImpl('debug')
          testLogger[level](message)

          // Get the output from the appropriate console method
          let output: string
          if (level === 'error') {
            output = consoleErrors[0]
          } else if (level === 'warn') {
            output = consoleWarns[0]
          } else {
            output = consoleLogs[0]
          }

          expect(output).toBeDefined()

          // Parse the JSON output
          const parsed: LogEntry = JSON.parse(output)

          // Verify required fields
          expect(typeof parsed.timestamp).toBe('string')
          expect(parsed.level).toBe(level)
          expect(parsed.message).toBe(message)

          // Verify timestamp is valid ISO 8601
          const timestampDate = new Date(parsed.timestamp)
          expect(timestampDate.toISOString()).toBe(parsed.timestamp)

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should include context when provided', () => {
      fc.assert(
        fc.property(
          logLevelArb,
          nonEmptyMessageArb,
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          (level, message, context) => {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const testLogger = new LoggerImpl('debug')
            
            if (level === 'error') {
              testLogger.error(message, undefined, context)
            } else {
              testLogger[level](message, context)
            }

            let output: string
            if (level === 'error') {
              output = consoleErrors[0]
            } else if (level === 'warn') {
              output = consoleWarns[0]
            } else {
              output = consoleLogs[0]
            }

            const parsed: LogEntry = JSON.parse(output)

            // Verify context is included
            expect(parsed.context).toBeDefined()
            for (const key of Object.keys(context)) {
              expect(parsed.context?.[key]).toEqual(context[key])
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should include error details when error is provided', () => {
      fc.assert(
        fc.property(nonEmptyMessageArb, nonEmptyMessageArb, (logMessage, errorMessage) => {
          consoleLogs = []
          consoleWarns = []
          consoleErrors = []

          const testLogger = new LoggerImpl('debug')
          const testError = new Error(errorMessage)
          testLogger.error(logMessage, testError)

          const output = consoleErrors[0]
          const parsed: LogEntry = JSON.parse(output)

          // Verify error details are included
          expect(parsed.error).toBeDefined()
          expect(parsed.error?.name).toBe('Error')
          expect(parsed.error?.message).toBe(errorMessage)
          expect(typeof parsed.error?.stack).toBe('string')

          return true
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: core-infrastructure, Property 2: Log Level Filtering
   * Validates: Requirements 1.2
   *
   * For any configured log level L, logs with level below L SHALL NOT be output,
   * while logs with level >= L SHALL be output.
   */
  describe('Property 2: Log Level Filtering', () => {
    it('should filter logs below configured level', () => {
      fc.assert(
        fc.property(logLevelArb, logLevelArb, nonEmptyMessageArb, (configuredLevel, logLevel, message) => {
          consoleLogs = []
          consoleWarns = []
          consoleErrors = []

          const shouldLog = LOG_LEVELS[logLevel] >= LOG_LEVELS[configuredLevel]

          const testLogger = new LoggerImpl(configuredLevel)
          testLogger[logLevel](message)

          const totalLogs = consoleLogs.length + consoleWarns.length + consoleErrors.length

          if (shouldLog) {
            expect(totalLogs).toBe(1)
          } else {
            expect(totalLogs).toBe(0)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should output logs at or above configured level', () => {
      fc.assert(
        fc.property(logLevelArb, nonEmptyMessageArb, (configuredLevel, message) => {
          // Test all levels at or above configured level
          const levelsToTest: LogLevel[] = ['debug', 'info', 'warn', 'error']
          const configuredLevelNum = LOG_LEVELS[configuredLevel]

          for (const testLevel of levelsToTest) {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const testLogger = new LoggerImpl(configuredLevel)
            testLogger[testLevel](message)

            const totalLogs = consoleLogs.length + consoleWarns.length + consoleErrors.length
            const shouldLog = LOG_LEVELS[testLevel] >= configuredLevelNum

            if (shouldLog) {
              expect(totalLogs).toBe(1)
            } else {
              expect(totalLogs).toBe(0)
            }
          }

          return true
        }),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Feature: core-infrastructure, Property 3: Context Inheritance
   * Validates: Requirements 3.1, 3.2
   *
   * For any child logger created with context C, all logs from that child
   * SHALL include context C merged with any additional context passed to the log call.
   */
  describe('Property 3: Context Inheritance', () => {
    it('should inherit parent context in child logger', () => {
      fc.assert(
        fc.property(
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          nonEmptyMessageArb,
          logLevelArb,
          (parentContext, message, level) => {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const parentLogger = new LoggerImpl('debug')
            const childLogger = parentLogger.child(parentContext)

            if (level === 'error') {
              childLogger.error(message)
            } else {
              childLogger[level](message)
            }

            let output: string
            if (level === 'error') {
              output = consoleErrors[0]
            } else if (level === 'warn') {
              output = consoleWarns[0]
            } else {
              output = consoleLogs[0]
            }

            const parsed: LogEntry = JSON.parse(output)

            // Verify parent context is inherited
            for (const key of Object.keys(parentContext)) {
              expect(parsed.context?.[key]).toEqual(parentContext[key])
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should merge parent context with additional context', () => {
      fc.assert(
        fc.property(
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          nonEmptyMessageArb,
          (parentContext, additionalContext, message) => {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const parentLogger = new LoggerImpl('debug')
            const childLogger = parentLogger.child(parentContext)
            childLogger.info(message, additionalContext)

            const output = consoleLogs[0]
            const parsed: LogEntry = JSON.parse(output)

            // Verify both parent and additional context are present
            // Additional context should override parent context for same keys
            const expectedContext = { ...parentContext, ...additionalContext }
            for (const key of Object.keys(expectedContext)) {
              expect(parsed.context?.[key]).toEqual(expectedContext[key])
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should support multiple levels of context inheritance', () => {
      fc.assert(
        fc.property(
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          nonEmptyMessageArb,
          (ctx1, ctx2, ctx3, message) => {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const logger1 = new LoggerImpl('debug')
            const logger2 = logger1.child(ctx1)
            const logger3 = logger2.child(ctx2)
            logger3.info(message, ctx3)

            const output = consoleLogs[0]
            const parsed: LogEntry = JSON.parse(output)

            // Verify all contexts are merged (later contexts override earlier)
            const expectedContext = { ...ctx1, ...ctx2, ...ctx3 }
            for (const key of Object.keys(expectedContext)) {
              expect(parsed.context?.[key]).toEqual(expectedContext[key])
            }

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should not affect parent logger when child logs', () => {
      fc.assert(
        fc.property(
          contextArb.filter((ctx) => Object.keys(ctx).length > 0),
          nonEmptyMessageArb,
          nonEmptyMessageArb,
          (childContext, parentMessage, childMessage) => {
            consoleLogs = []
            consoleWarns = []
            consoleErrors = []

            const parentLogger = new LoggerImpl('debug')
            const childLogger = parentLogger.child(childContext)

            // Log from child first
            childLogger.info(childMessage)
            const childOutput = consoleLogs[0]
            const childParsed: LogEntry = JSON.parse(childOutput)

            // Log from parent
            consoleLogs = []
            parentLogger.info(parentMessage)
            const parentOutput = consoleLogs[0]
            const parentParsed: LogEntry = JSON.parse(parentOutput)

            // Child should have context
            for (const key of Object.keys(childContext)) {
              expect(childParsed.context?.[key]).toEqual(childContext[key])
            }

            // Parent should NOT have child's context
            for (const key of Object.keys(childContext)) {
              expect(parentParsed.context?.[key]).toBeUndefined()
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
