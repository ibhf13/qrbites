const chalk = require('chalk')

/**
 * Logger utility with colored output for better debugging
 */
const logger = {
    /**
     * Log info message
     * @param {string} message - The message to log
     * @param {Object} data - Optional data to log
     */
    info: (message, data = null) => {
        console.log(chalk.blue('ℹ INFO:'), chalk.blue(message))
        if (data) console.log(chalk.blue('  Data:'), data)
    },

    /**
     * Log success message
     * @param {string} message - The message to log
     * @param {Object} data - Optional data to log
     */
    success: (message, data = null) => {
        console.log(chalk.green('✓ SUCCESS:'), chalk.green(message))
        if (data) console.log(chalk.green('  Data:'), data)
    },

    /**
     * Log warning message
     * @param {string} message - The message to log
     * @param {Object} data - Optional data to log
     */
    warn: (message, data = null) => {
        console.log(chalk.yellow('⚠ WARNING:'), chalk.yellow(message))
        if (data) console.log(chalk.yellow('  Data:'), data)
    },

    /**
     * Log error message
     * @param {string} message - The message to log
     * @param {Error|Object} error - The error object or data
     */
    error: (message, error = null) => {
        console.log(chalk.red('✖ ERROR:'), chalk.red(message))
        if (error) {
            if (error instanceof Error) {
                console.log(chalk.red('  Message:'), error.message)
                console.log(chalk.red('  Stack:'), error.stack)
            } else {
                console.log(chalk.red('  Data:'), error)
            }
        }
    },

    /**
     * Log debug message (only in development environment)
     * @param {string} message - The message to log
     * @param {Object} data - Optional data to log
     */
    debug: (message, data = null) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(chalk.magenta('🔍 DEBUG:'), chalk.magenta(message))
            if (data) console.log(chalk.magenta('  Data:'), data)
        }
    },

    /**
     * Log HTTP request
     * @param {Object} req - Express request object
     * @param {string} status - HTTP status code
     */
    http: (req, status) => {
        const statusCode = parseInt(status, 10)
        let color = chalk.green

        if (statusCode >= 400 && statusCode < 500) color = chalk.yellow
        if (statusCode >= 500) color = chalk.red

        console.log(
            color(`${req.method} ${req.url} ${status}`),
            chalk.gray(`- ${new Date().toISOString()}`)
        )
    }
}

module.exports = logger 