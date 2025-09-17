const jwt = require('jsonwebtoken')
const User = require('@models/user')
const { unauthorized, forbidden, badRequest, notFound } = require('@utils/errorUtils')
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

/**
 * Middleware to add user's restaurant IDs to request for filtering
 * Helps ensure users only see their own restaurant data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const addUserRestaurants = async (req, res, next) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            const Restaurant = require('@models/restaurant')
            const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
            req.userRestaurantIds = userRestaurants.map(r => r._id.toString())
        }
        next()
    } catch (error) {
        logger.error('Error fetching user restaurants:', error)
        next(error)
    }
}

/**
 * Middleware to check if a restaurant belongs to the authenticated user
 * @param {string} paramName - Name of the parameter containing restaurant ID (default: 'restaurantId')
 * @returns {Function} Express middleware
 */
const checkRestaurantOwnership = (paramName = 'restaurantId') => {
    return async (req, res, next) => {
        try {
            // Skip for admin users
            if (req.user.role === 'admin') {
                return next()
            }

            const restaurantId = req.params[paramName] || req.body[paramName]

            if (!restaurantId) {
                return next(badRequest('Restaurant ID is required'))
            }

            const Restaurant = require('@models/restaurant')
            const restaurant = await Restaurant.findById(restaurantId)

            if (!restaurant) {
                return next(notFound('Restaurant not found'))
            }

            const isOwner = restaurant.userId.toString() === req.user._id.toString()

            if (!isOwner) {
                logger.warn(`User ${req.user._id} attempted to access restaurant ${restaurantId} they don't own`)
                return next(forbidden('Not authorized to access this restaurant'))
            }

            // Store restaurant in request for use in controllers
            req.restaurant = restaurant
            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Middleware to check if a menu belongs to the authenticated user through restaurant ownership
 * @param {string} paramName - Name of the parameter containing menu ID (default: 'id')
 * @returns {Function} Express middleware
 */
const checkMenuOwnership = (paramName = 'id') => {
    return async (req, res, next) => {
        try {
            // Skip for admin users
            if (req.user.role === 'admin') {
                return next()
            }

            const menuId = req.params[paramName]

            if (!menuId) {
                return next(badRequest('Menu ID is required'))
            }

            const Menu = require('@models/menu')
            const menu = await Menu.findById(menuId)

            if (!menu) {
                return next(notFound('Menu not found'))
            }

            const Restaurant = require('@models/restaurant')
            const restaurant = await Restaurant.findById(menu.restaurantId)

            if (!restaurant) {
                return next(notFound('Restaurant not found'))
            }

            const isOwner = restaurant.userId.toString() === req.user._id.toString()

            if (!isOwner) {
                logger.warn(`User ${req.user._id} attempted to access menu ${menuId} they don't own`)
                return next(forbidden('Not authorized to access this menu'))
            }

            // Store menu and restaurant in request for use in controllers
            req.menu = menu
            req.restaurant = restaurant
            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Middleware to check if a menu item belongs to the authenticated user through menu and restaurant ownership
 * @param {string} paramName - Name of the parameter containing menu item ID (default: 'id')
 * @returns {Function} Express middleware
 */
const checkMenuItemOwnership = (paramName = 'id') => {
    return async (req, res, next) => {
        try {
            // Skip for admin users
            if (req.user.role === 'admin') {
                return next()
            }

            const menuItemId = req.params[paramName]

            if (!menuItemId) {
                return next(badRequest('Menu item ID is required'))
            }

            const MenuItem = require('@models/menuItem')
            const menuItem = await MenuItem.findById(menuItemId)

            if (!menuItem) {
                return next(notFound('Menu item not found'))
            }

            const Menu = require('@models/menu')
            const menu = await Menu.findById(menuItem.menuId)

            if (!menu) {
                return next(notFound('Menu not found'))
            }

            const Restaurant = require('@models/restaurant')
            const restaurant = await Restaurant.findById(menu.restaurantId)

            if (!restaurant) {
                return next(notFound('Restaurant not found'))
            }

            const isOwner = restaurant.userId.toString() === req.user._id.toString()

            if (!isOwner) {
                logger.warn(`User ${req.user._id} attempted to access menu item ${menuItemId} they don't own`)
                return next(forbidden('Not authorized to access this menu item'))
            }

            // Store menu item, menu and restaurant in request for use in controllers
            req.menuItem = menuItem
            req.menu = menu
            req.restaurant = restaurant
            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Middleware to check menu ownership for menu item creation (checks menuId from body)
 * @returns {Function} Express middleware
 */
const checkMenuOwnershipForCreation = () => {
    return async (req, res, next) => {
        try {
            // Skip for admin users
            if (req.user.role === 'admin') {
                return next()
            }

            const menuId = req.body.menuId

            if (!menuId) {
                return next(badRequest('Menu ID is required'))
            }

            const Menu = require('@models/menu')
            const menu = await Menu.findById(menuId)

            if (!menu) {
                return next(notFound('Menu not found'))
            }

            const Restaurant = require('@models/restaurant')
            const restaurant = await Restaurant.findById(menu.restaurantId)

            if (!restaurant) {
                return next(notFound('Restaurant not found'))
            }

            const isOwner = restaurant.userId.toString() === req.user._id.toString()

            if (!isOwner) {
                logger.warn(`User ${req.user._id} attempted to create menu item for menu ${menuId} they don't own`)
                return next(forbidden('Not authorized to create menu items for this menu'))
            }

            // Store menu and restaurant in request for use in controllers
            req.menu = menu
            req.restaurant = restaurant
            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Optional authentication middleware - sets req.user if token is provided but doesn't fail if not
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        // If no token, continue without setting user
        if (!token) {
            return next()
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Find user from token
        const user = await User.findById(decoded.id).select('-password')

        if (user && user.isActive) {
            // Set user in request if found and active
            req.user = user
        }

        next()
    } catch (error) {
        // If token is invalid, continue without setting user (don't throw error)
        logger.debug('Optional auth failed, continuing without user', error.message)
        next()
    }
}

module.exports = {
    protect,
    restrictTo,
    checkOwnership,
    addUserRestaurants,
    checkRestaurantOwnership,
    checkMenuOwnership,
    checkMenuItemOwnership,
    checkMenuOwnershipForCreation,
    optionalAuth
} 