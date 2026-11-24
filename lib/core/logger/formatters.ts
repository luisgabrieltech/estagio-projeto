import { LogEntry } from './logger.types'

const LEVEL_COLORS = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
}
const RESET = '\x1b[0m'

export function formatDev(entry: LogEntry): string {
  const color = LEVEL_COLORS[entry.level]
  const level = entry.level.toUpperCase().padEnd(5)
  const time = entry.timestamp.split('T')[1].split('.')[0]

  let output = `${color}[${level}]${RESET} ${time} ${entry.message}`

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`
  }

  if (entry.error?.stack) {
    output += `\n${entry.error.stack}`
  }

  return output
}

export function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry)
}
