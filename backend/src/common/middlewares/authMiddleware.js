const jwt = require('jsonwebtoken')
const User = require('@modules/users/models/user')
const {
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
  asyncHandler,
} = require('@errors')
const logger = require('@commonUtils/logger')

/**
 * Middleware to protect routes by requiring authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // No token provided
  if (!token) {
    throw new UnauthorizedError('Not authorized, no token')
  }

  // Verify token - let JWT errors be caught by the centralized error handler
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  if (!decoded || !decoded.id) {
    throw new UnauthorizedError('Invalid token payload')
  }
  // Find user from token
  const user = await User.findById(decoded.id).select('-password')

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is disabled')
  }

  // Set user in request
  req.user = user
  next()
})

/**
 * Middleware to restrict routes to specific user roles
 * @param {...string} roles - User roles allowed to access the route
 * @returns {Function} Express middleware
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated')
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user._id} (${req.user.role}) attempted to access restricted route`)
      throw new ForbiddenError('Not authorized to access this route')
    }

    next()
  }
}

/**
 * Configuration for different resource types and their ownership relationships
 */
const OWNERSHIP_CONFIG = {
  Restaurant: {
    model: () => require('@modules/restaurants/models/restaurant'),
    ownerField: 'userId',
    populate: null,
    errorMessages: {
      notFound: 'Restaurant not found',
      forbidden: 'Not authorized to access this restaurant',
      idRequired: 'Restaurant ID is required',
    },
  },
  Menu: {
    model: () => require('@modules/menus/models/menu'),
    ownerField: 'restaurantId.userId',
    populate: {
      path: 'restaurantId',
      select: 'userId',
    },
    errorMessages: {
      notFound: 'Menu not found',
      forbidden: 'Not authorized to access this menu',
      idRequired: 'Menu ID is required',
    },
  },
  MenuItem: {
    model: () => require('@modules/menuItems/models/menuItem'),
    ownerField: 'menuId.restaurantId.userId',
    populate: {
      path: 'menuId',
      select: 'restaurantId',
      populate: {
        path: 'restaurantId',
        select: 'userId',
      },
    },
    errorMessages: {
      notFound: 'Menu item not found',
      forbidden: 'Not authorized to access this menu item',
      idRequired: 'Menu item ID is required',
    },
  },
}

/**
 * Helper function to safely get the owner ID from a resource
 * @param {Object} resource - The resource to get the owner ID from
 * @param {string} ownerField - The field containing the owner ID
 * @param {string} resourceType - The type of resource
 * @returns {string} The owner ID
 */
const getOwnerIdSafely = (resource, ownerField, resourceType) => {
  const fields = ownerField.split('.')
  let current = resource

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]

    if (!current) {
      throw new Error(`${resourceType} ownership chain broken: ${field} is null at step ${i + 1}`)
    }

    if (typeof current !== 'object') {
      throw new Error(
        `${resourceType} ownership chain broken: expected object at ${field}, got ${typeof current}`
      )
    }

    if (!(field in current)) {
      throw new Error(`${resourceType} ownership chain broken: missing field '${field}'`)
    }

    current = current[field]
  }

  if (!current) {
    throw new Error(`${resourceType} owner ID is null or undefined`)
  }

  return current.toString()
}

/**
 * Generic ownership check helper that can handle different resource types
 * @param {string} resourceType - Type of resource (Restaurant, Menu, MenuItem)
 * @param {string} paramName - Name of the parameter containing the resource ID
 * @param {string} source - Where to get the ID from ('params' or 'body')
 * @returns {Function} Express middleware
 */
const checkResourceOwnership = (resourceType, paramName = 'id', source = 'params') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError('User not authenticated')
    }
    // Skip for admin users
    if (req.user.role === 'admin') {
      return next()
    }

    const config = OWNERSHIP_CONFIG[resourceType]
    if (!config) {
      throw new BadRequestError(`Unknown resource type: ${resourceType}`)
    }

    // Get the resource ID from the specified source
    const resourceId = source === 'body' ? req.body[paramName] : req.params[paramName]

    if (!resourceId) {
      throw new BadRequestError(config.errorMessages.idRequired)
    }

    const Model = config.model()
    let query = Model.findById(resourceId)

    // Apply population if configured
    if (config.populate) {
      query = query.populate(config.populate)
    }

    const resource = await query

    if (!resource) {
      throw new NotFoundError(config.errorMessages.notFound)
    }

    // Navigate to the owner field using dot notation
    const ownerId = getOwnerIdSafely(resource, config.ownerField, resourceType)

    if (!ownerId) {
      logger.error(`Owner field not found: ${config.ownerField} for ${resourceType} ${resourceId}`)
      throw new BadRequestError('Ownership validation failed')
    }

    const isOwner = ownerId.toString() === req.user._id.toString()

    if (!isOwner) {
      logger.warn(
        `User ${req.user._id} attempted to access ${resourceType.toLowerCase()} ${resourceId} they don't own`
      )
      throw new ForbiddenError(config.errorMessages.forbidden)
    }

    // Store the resource and related entities in request for use in controllers
    const resourceName = resourceType.toLowerCase()
    req[resourceName] = resource

    // Store related entities based on resource type
    if (resourceType === 'Menu' && resource.restaurantId) {
      req.restaurant = resource.restaurantId
    } else if (resourceType === 'MenuItem' && resource.menuId) {
      req.menu = resource.menuId
      if (resource.menuId.restaurantId) {
        req.restaurant = resource.menuId.restaurantId
      }
    }

    next()
  })
}

/**
 * Middleware to add user's restaurant IDs to request for filtering
 * Helps ensure users only see their own restaurant data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addUserRestaurants = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    const Restaurant = require('@modules/restaurants/models/restaurant')
    const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
    req.userRestaurantIds = userRestaurants.map(r => r._id.toString())
  }
  next()
})

/**
 * Middleware to check if a restaurant belongs to the authenticated user
 * @param {string} paramName - Name of the parameter containing restaurant ID (default: 'restaurantId')
 * @returns {Function} Express middleware
 */
const checkRestaurantOwnership = (paramName = 'restaurantId') => {
  return checkResourceOwnership('Restaurant', paramName, 'params')
}

/**
 * Middleware to check if a menu belongs to the authenticated user through restaurant ownership
 * @param {string} paramName - Name of the parameter containing menu ID (default: 'id')
 * @returns {Function} Express middleware
 */
const checkMenuOwnership = (paramName = 'id') => {
  return checkResourceOwnership('Menu', paramName, 'params')
}

/**
 * Middleware to check if a menu item belongs to the authenticated user through menu and restaurant ownership
 * @param {string} paramName - Name of the parameter containing menu item ID (default: 'id')
 * @returns {Function} Express middleware
 */
const checkMenuItemOwnership = (paramName = 'id') => {
  return checkResourceOwnership('MenuItem', paramName, 'params')
}

/**
 * Middleware to check menu ownership for menu item creation (checks menuId from body)
 * @returns {Function} Express middleware
 */
const checkMenuOwnershipForCreation = () => {
  return checkResourceOwnership('Menu', 'menuId', 'body')
}

/**
 * Middleware to check restaurant ownership for menu creation (checks restaurantId from body)
 * @returns {Function} Express middleware
 */
const checkRestaurantOwnershipForCreation = () => {
  return checkResourceOwnership('Restaurant', 'restaurantId', 'body')
}

/**
 * Optional authentication middleware - sets req.user if token is provided but doesn't fail if not
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // If no token, continue without setting user
  if (!token) return next()

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || !decoded.id) {
      // Invalid token payload, continue without setting user
      return next()
    }

    // Find user from token
    const user = await User.findById(decoded.id).select('-password')

    if (user && user.isActive) {
      // Set user in request if found and active
      req.user = user
    }
  } catch (error) {
    // Invalid, expired, or malformed token - silently continue without setting user
    logger.debug('Optional auth failed:', error.message)
  }

  next()
})

module.exports = {
  protect,
  restrictTo,
  addUserRestaurants,
  checkResourceOwnership,
  checkRestaurantOwnership,
  checkMenuOwnership,
  checkMenuItemOwnership,
  checkMenuOwnershipForCreation,
  checkRestaurantOwnershipForCreation,
  optionalAuth,
}
