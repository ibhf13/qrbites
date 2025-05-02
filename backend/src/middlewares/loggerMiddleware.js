const logger = require('@utils/logger')

/**
 * HTTP request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const loggerMiddleware = (req, res, next) => {
    // Store original end method
    const originalEnd = res.end

    // Current timestamp
    const startTime = Date.now()

    // Log request information
    logger.debug(`Incoming request: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        headers: req.headers,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined
    })

    // Override end method
    res.end = function (chunk, encoding) {
        // Calculate request processing time
        const responseTime = Date.now() - startTime

        // Restore original end method
        res.end = originalEnd

        // Call original end method
        res.end(chunk, encoding)

        // Log response information
        logger.http(req, res.statusCode)

        if (res.statusCode >= 400) {
            logger.warn(`Response completed in ${responseTime}ms with status ${res.statusCode}`)
        } else {
            logger.debug(`Response completed in ${responseTime}ms with status ${res.statusCode}`)
        }
    }

    next()
}

module.exports = loggerMiddleware 