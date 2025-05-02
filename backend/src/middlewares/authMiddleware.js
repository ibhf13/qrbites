const jwt = require('jsonwebtoken')
const User = require('@models/userModel')
const { unauthorized, forbidden } = require('@utils/errorUtils')
const logger = require('@utils/logger')

/**
 * Middleware to protect routes by requiring authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
    try {
        let token

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        // No token provided
        if (!token) {
            return next(unauthorized('Not authorized, no token'))
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find user from token
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            return next(unauthorized('User not found'))
        }

        if (!user.isActive) {
            return next(unauthorized('User account is disabled'))
        }

        // Set user in request
        req.user = user
        next()
    } catch (error) {
        logger.error('Authentication error', error)

        if (error.name === 'JsonWebTokenError') {
            return next(unauthorized('Invalid token'))
        }

        if (error.name === 'TokenExpiredError') {
            return next(unauthorized('Token expired'))
        }

        next(error)
    }
}

/**
 * Middleware to restrict routes to specific user roles
 * @param {...string} roles - User roles allowed to access the route
 * @returns {Function} Express middleware
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(unauthorized('User not authenticated'))
        }

        if (!roles.includes(req.user.role)) {
            logger.warn(`User ${req.user._id} (${req.user.role}) attempted to access restricted route`)
            return next(forbidden('Not authorized to access this route'))
        }

        next()
    }
}

/**
 * Middleware to check if user owns the resource
 * @param {Function} getResourceUserId - Function to get resource user ID from request
 * @returns {Function} Express middleware
 */
const checkOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            // Skip for admin users
            if (req.user.role === 'admin') {
                return next()
            }

            const resourceUserId = await getResourceUserId(req)

            if (!resourceUserId) {
                return next(forbidden('Resource not found or permission denied'))
            }

            const isOwner = resourceUserId.toString() === req.user._id.toString()

            if (!isOwner) {
                logger.warn(`User ${req.user._id} attempted to access unauthorized resource`)
                return next(forbidden('Not authorized to access this resource'))
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    protect,
    restrictTo,
    checkOwnership
} 