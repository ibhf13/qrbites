const { createLogger, format, transports, addColors } = require('winston')

/**
 * Custom levels to mirror your original API (including "success" and "http")
 */
const levels = {
  error: 0,
  warn: 1,
  success: 2,
  info: 3,
  http: 4,
  debug: 5,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'blue',
  http: 'cyan',
  debug: 'magenta',
}

addColors(colors)

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

const EMOJI = {
  info: 'ℹ',
  success: '✓',
  warn: '⚠',
  error: '✖',
  debug: '🔍',
  http: '⇄',
}

const { combine, timestamp, errors, metadata, colorize, printf } = format

const consoleFmt = printf(info => {
  const { level, message, timestamp: ts, stack, metadata: meta } = info
  const label = `${EMOJI[level] || ''} ${level.toUpperCase()}:`.trim()

  const lines = []
  lines.push(`${label} ${message}`)
  if (meta && Object.keys(meta).length > 0) {
    lines.push(`  Data: ${JSON.stringify(meta, null, 2)}`)
  }
  if (stack) {
    lines.push(`  Stack: ${stack}`)
  }
  lines.push(`  - ${ts}`)
  return lines.join('\n')
})

const baseLogger = createLogger({
  levels,
  level,
  format: combine(
    timestamp(),
    errors({ stack: true }),
    metadata({ fillExcept: ['level', 'message', 'timestamp', 'stack'] }),
    colorize({ all: true }),
    consoleFmt
  ),
  transports: [new transports.Console()],
})

/**
 * Public logger API compatible with the original
 */
const logger = {
  /**
   * Log info message
   * @param {string} message
   * @param {Object} data
   */
  info: (message, data) => {
    baseLogger.log('info', message, data)
  },

  /**
   * Log success message
   * @param {string} message
   * @param {Object} data
   */
  success: (message, data) => {
    baseLogger.log('success', message, data)
  },

  /**
   * Log warning message
   * @param {string} message
   * @param {Object} data
   */
  warn: (message, data) => {
    baseLogger.log('warn', message, data)
  },

  /**
   * Log error message
   * @param {string} message
   * @param {Error|Object} error
   */
  error: (message, error = null) => {
    if (error instanceof Error) {
      baseLogger.log('error', message, {
        errorMessage: error.message,
        stack: error.stack,
      })
    } else if (error) {
      baseLogger.log('error', message, error)
    } else {
      baseLogger.log('error', message)
    }
  },

  /**
   * Log debug message (auto-suppressed in production via level)
   * @param {string} message
   * @param {Object} data
   */
  debug: (message, data) => {
    baseLogger.log('debug', message, data)
  },

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {string|number} status - HTTP status code
   */
  http: (req, status) => {
    const statusCode = parseInt(status, 10)
    const lv = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http'

    baseLogger.log(lv, `${req.method} ${req.url} ${statusCode}`, {
      method: req.method,
      url: req.url,
      status: statusCode,
      time: new Date().toISOString(),
    })
  },
}

module.exports = logger
