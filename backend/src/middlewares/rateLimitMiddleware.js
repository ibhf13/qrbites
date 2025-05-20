const rateLimit = require('express-rate-limit')
const { tooManyRequests } = require('@utils/errorUtils')
const logger = require('@utils/logger')

/**
 * Creates a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes by default
        max: 100, // Limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests from this IP, please try again later',
        statusCode: 429,
        skipSuccessfulRequests: false, // Count successful requests
        skip: (req) => false, // Don't skip any requests by default
    }

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options }

    // Create and return the rate limiter middleware
    return rateLimit({
        ...mergedOptions,
        // Custom handler for rate limit exceeded
        handler: (req, res, next, options) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`)

            // Use our error format
            res.status(options.statusCode).json({
                success: false,
                error: options.message,
                details: {
                    retryAfter: Math.ceil(options.windowMs / 1000 / 60) // in minutes
                }
            })
        }
    })
}

/**
 * API global rate limiter
 */
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: 'Too many API requests from this IP, please try again after 15 minutes'
})

/**
 * Auth routes rate limiter (more restrictive)
 */
const authLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 10 requests per IP
    message: 'Too many authentication attempts, please try again after an hour'
})

/**
 * User creation routes rate limiter
 */
const createUserLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per IP
    message: 'Too many accounts created from this IP, please try again after an hour'
})

module.exports = {
    apiLimiter,
    authLimiter,
    createUserLimiter,
    createRateLimiter
} 