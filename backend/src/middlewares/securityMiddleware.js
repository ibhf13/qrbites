
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const crypto = require('crypto')
const logger = require('@utils/logger')

/**
 * Advanced rate limiting with different strategies
 */
const createAdvancedRateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // requests per window
        message = 'Too many requests from this IP',
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        keyGenerator = (req) => req.ip,
        skip = () => false,
        onLimitReached = (req, res, options) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
                url: req.originalUrl,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            })
        }
    } = options

    return rateLimit({
        windowMs,
        max,
        message: { success: false, error: message },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skipFailedRequests,
        keyGenerator,
        skip,
        onLimitReached
    })
}

/**
 * Progressive delay for suspicious behavior
 */
const createProgressiveDelay = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        delayAfter = 50,
        delayMs = 500,
        maxDelayMs = 20000
    } = options

    return slowDown({
        windowMs,
        delayAfter,
        delayMs,
        maxDelayMs,
        onLimitReached: (req, res, options) => {
            logger.warn(`Progressive delay applied for IP: ${req.ip}`, {
                delay: options.delay,
                url: req.originalUrl
            })
        }
    })
}

/**
 * Brute force protection for authentication endpoints
 */
const bruteForceProtection = createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts. Please try again later.',
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        // Combine IP and email for more targeted limiting
        const email = req.body?.email || 'unknown'
        return `${req.ip}:${email}`
    },
    onLimitReached: (req, res, options) => {
        logger.error(`🚨 SECURITY ALERT: Brute force attack detected`, {
            ip: req.ip,
            email: req.body?.email,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            timestamp: new Date()
        })

        // Could integrate with external security services here
        // e.g., Cloudflare, AWS WAF, etc.
    }
})

/**
 * API abuse protection
 */
const apiAbuseProtection = createAdvancedRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'API rate limit exceeded',
    keyGenerator: (req) => {
        // Consider user ID if authenticated, otherwise IP
        return req.user?.id || req.ip
    }
})

/**
 * File upload protection
 */
const fileUploadProtection = createAdvancedRateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 uploads per 10 minutes
    message: 'Too many file uploads. Please wait and try again.',
    keyGenerator: (req) => req.user?.id || req.ip
})

/**
 * Advanced input sanitization
 */
const sanitizeInput = () => {
    return [
        // Remove data, prevent NoSQL injection attacks
        mongoSanitize({
            replaceWith: '_',
            onSanitize: ({ req, key }) => {
                logger.warn(`🛡️  Input sanitized: ${key} in ${req.originalUrl}`)
            }
        }),

        // Clean user input from malicious XSS attacks
        xss(),

        // Protect against HTTP Parameter Pollution attacks
        hpp({
            whitelist: ['tags', 'categories', 'sort', 'fields'] // Allow arrays for these params
        })
    ]
}

/**
 * Request signature validation (for webhooks)
 */
const validateSignature = (secret, headerName = 'x-signature-256') => {
    return (req, res, next) => {
        const signature = req.get(headerName)

        if (!signature) {
            logger.warn(`Missing signature header: ${headerName}`, {
                ip: req.ip,
                url: req.originalUrl
            })
            return res.status(401).json({ success: false, error: 'Missing signature' })
        }

        const body = req.rawBody || JSON.stringify(req.body)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body, 'utf8')
            .digest('hex')

        const providedSignature = signature.replace('sha256=', '')

        if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
            logger.error(`🚨 SECURITY ALERT: Invalid signature detected`, {
                ip: req.ip,
                url: req.originalUrl,
                userAgent: req.get('User-Agent')
            })
            return res.status(401).json({ success: false, error: 'Invalid signature' })
        }

        next()
    }
}

/**
 * IP whitelist/blacklist middleware
 */
const ipAccessControl = (options = {}) => {
    const { whitelist = [], blacklist = [], mode = 'whitelist' } = options

    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress

        // Check blacklist first
        if (blacklist.includes(clientIP)) {
            logger.error(`🚫 Blocked IP attempted access: ${clientIP}`, {
                url: req.originalUrl,
                userAgent: req.get('User-Agent')
            })
            return res.status(403).json({ success: false, error: 'Access denied' })
        }

        // Check whitelist if in whitelist mode
        if (mode === 'whitelist' && whitelist.length > 0) {
            if (!whitelist.includes(clientIP)) {
                logger.warn(`🔒 Non-whitelisted IP attempted access: ${clientIP}`)
                return res.status(403).json({ success: false, error: 'Access denied' })
            }
        }

        next()
    }
}

/**
 * Request size limiting
 */
const requestSizeLimit = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = req.get('Content-Length')

        if (contentLength) {
            const sizeInBytes = parseInt(contentLength)
            const maxSizeInBytes = parseSize(maxSize)

            if (sizeInBytes > maxSizeInBytes) {
                logger.warn(`🚫 Request too large: ${sizeInBytes} bytes`, {
                    ip: req.ip,
                    url: req.originalUrl,
                    maxAllowed: maxSizeInBytes
                })
                return res.status(413).json({
                    success: false,
                    error: 'Request entity too large'
                })
            }
        }

        next()
    }
}

/**
 * Suspicious activity detection
 */
const suspiciousActivityDetection = () => {
    const suspiciousPatterns = [
        /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection patterns
        /<script|javascript:|onload=|onerror=/i, // XSS patterns
        /\.\.\//g, // Path traversal
        /__proto__|constructor|prototype/i, // Prototype pollution
        /eval\s*\(|Function\s*\(/i // Code injection
    ]

    const activityMap = new Map() // Track suspicious activity per IP

    return (req, res, next) => {
        const ip = req.ip
        const userAgent = req.get('User-Agent') || ''
        const url = req.originalUrl
        const body = JSON.stringify(req.body)
        const query = JSON.stringify(req.query)

        let suspiciousCount = 0
        const suspiciousReasons = []

        // Check for suspicious patterns
        const checkString = `${url} ${body} ${query} ${userAgent}`
        suspiciousPatterns.forEach((pattern, index) => {
            if (pattern.test(checkString)) {
                suspiciousCount++
                suspiciousReasons.push(`Pattern ${index + 1} matched`)
            }
        })

        // Check for rapid requests (simple DOS detection)
        const now = Date.now()
        if (!activityMap.has(ip)) {
            activityMap.set(ip, [])
        }

        const requests = activityMap.get(ip)
        requests.push(now)

        // Keep only requests from last minute
        const oneMinuteAgo = now - 60000
        const recentRequests = requests.filter(time => time > oneMinuteAgo)
        activityMap.set(ip, recentRequests)

        if (recentRequests.length > 100) { // More than 100 requests per minute
            suspiciousCount++
            suspiciousReasons.push('High request frequency')
        }

        // Log suspicious activity
        if (suspiciousCount > 0) {
            logger.error(`🚨 SUSPICIOUS ACTIVITY DETECTED`, {
                ip,
                url,
                userAgent,
                suspiciousCount,
                reasons: suspiciousReasons,
                timestamp: new Date()
            })

            // Could block immediately or flag for review
            if (suspiciousCount >= 3) {
                return res.status(403).json({
                    success: false,
                    error: 'Suspicious activity detected'
                })
            }
        }

        next()
    }
}

/**
 * Content Security Policy header
 */
const contentSecurityPolicy = () => {
    return (req, res, next) => {
        res.setHeader('Content-Security-Policy', [
            "default-src 'self'",
            "img-src 'self' https://res.cloudinary.com data:",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'"
        ].join('; '))

        next()
    }
}

/**
 * Additional security headers
 */
const securityHeaders = () => {
    return (req, res, next) => {
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff')

        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY')

        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block')

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

        // Permissions policy
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

        // HSTS (HTTPS only)
        if (req.secure) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
        }

        next()
    }
}

/**
 * API versioning security
 */
const apiVersionSecurity = (supportedVersions = ['v1']) => {
    return (req, res, next) => {
        const version = req.headers['api-version'] || req.query.version || 'v1'

        if (!supportedVersions.includes(version)) {
            logger.warn(`Unsupported API version requested: ${version}`, {
                ip: req.ip,
                url: req.originalUrl
            })
            return res.status(400).json({
                success: false,
                error: 'Unsupported API version',
                supportedVersions
            })
        }

        req.apiVersion = version
        next()
    }
}

/**
 * Request logging for security analysis
 */
const securityLogger = () => {
    return (req, res, next) => {
        // Log all requests with security-relevant information
        const logData = {
            timestamp: new Date(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            contentType: req.get('Content-Type'),
            contentLength: req.get('Content-Length'),
            authorization: req.get('Authorization') ? 'Bearer [REDACTED]' : undefined,
            userId: req.user?.id
        }

        // Log to security-specific logger (could be separate from main logs)
        logger.info('SECURITY_LOG', logData)

        next()
    }
}

// Helper functions
const parseSize = (size) => {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }
    const match = size.toString().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/)

    if (!match) return 0

    const [, number, unit = 'b'] = match
    return parseFloat(number) * units[unit]
}

/**
 * Security audit middleware - logs security events
 */
const securityAudit = () => {
    const auditEvents = new Map()

    return (req, res, next) => {
        const originalEnd = res.end

        res.end = function (...args) {
            // Log security-relevant events
            const event = {
                timestamp: new Date(),
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id
            }

            // Store for analysis
            const key = `${req.ip}:${new Date().toISOString().slice(0, 10)}`
            if (!auditEvents.has(key)) {
                auditEvents.set(key, [])
            }
            auditEvents.get(key).push(event)

            // Cleanup old events (keep 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            for (const [eventKey, events] of auditEvents.entries()) {
                const eventDate = new Date(eventKey.split(':')[1])
                if (eventDate < weekAgo) {
                    auditEvents.delete(eventKey)
                }
            }

            originalEnd.apply(this, args)
        }

        next()
    }
}

module.exports = {
    // Rate limiting
    createAdvancedRateLimit,
    createProgressiveDelay,
    bruteForceProtection,
    apiAbuseProtection,
    fileUploadProtection,

    // Input validation & sanitization
    sanitizeInput,
    validateSignature,
    requestSizeLimit,
    suspiciousActivityDetection,

    // Access control
    ipAccessControl,
    apiVersionSecurity,

    // Security headers
    contentSecurityPolicy,
    securityHeaders,

    // Logging & monitoring
    securityLogger,
    securityAudit
}