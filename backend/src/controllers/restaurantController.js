const Restaurant = require('@models/restaurant')
const {
  asyncHandler,
  notFound,
  badRequest,
  forbidden,
  errorMessages
} = require('@utils/errorUtils')
const logger = require('@utils/logger')
const { logDatabaseError } = require('@services/errorLogService')
const { getFileUrl } = require('@services/fileUploadService')
const { createSafeRegexQuery } = require('@utils/sanitization')

/**
 * Get all restaurants
 * @route GET /api/restaurants
 * @access Private (users see only their own restaurants)
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, name, sortBy = 'createdAt', order = 'desc' } = req.query

  // Build query
  const query = {}

  // Add name filter if provided (with sanitization to prevent ReDoS attacks)
  if (name) {
    const safeRegexQuery = createSafeRegexQuery(name)
    if (safeRegexQuery) {
      query.name = safeRegexQuery
    }
  }

  // SECURITY FIX: Filter by user ownership (unless admin)
  if (req.user && req.user.role !== 'admin') {
    query.userId = req.user._id
  }

  // Build sort object
  const sort = {}
  sort[sortBy] = order === 'desc' ? -1 : 1

  try {
    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const restaurants = await Restaurant.find(query)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email')

    // Get total count
    const total = await Restaurant.countDocuments(query)

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logDatabaseError(error, 'FIND', { collection: 'restaurants', query })
    throw error
  }
})

/**
 * Get restaurant by ID
 * @route GET /api/restaurants/:id
 * @access Private
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const restaurant = await Restaurant.findById(id)
      .select('-__v')
      .populate('userId', 'email')

    if (!restaurant) {
      throw notFound(errorMessages.notFound('Restaurant', id))
    }

    res.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Restaurant'))
    }
    throw error
  }
})

/**
 * Create restaurant
 * @route POST /api/restaurants
 * @access Private
 */
const createRestaurant = asyncHandler(async (req, res) => {
  try {
    // Add user ID from authenticated user
    req.body.userId = req.user._id

    // Add logo URL if file was uploaded
    if (req.file) {
      req.body.logoUrl = getFileUrl(req.file.filename, 'restaurant')
    }

    // Create restaurant
    const restaurant = await Restaurant.create(req.body)

    logger.success(`Restaurant created: ${restaurant.name} by user ${req.user._id}`)

    res.status(201).json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    logDatabaseError(error, 'CREATE', { collection: 'restaurants', document: req.body })
    throw error
  }
})

/**
 * Update restaurant
 * @route PUT /api/restaurants/:id
 * @access Private
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    // Restaurant and ownership already validated by middleware
    const restaurant = req.restaurant

    // Add logo URL if file was uploaded
    if (req.file) {
      req.body.logoUrl = getFileUrl(req.file.filename, 'restaurant')
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    logger.info(`Restaurant updated: ${restaurant.name} by user ${req.user._id}`)

    res.json({
      success: true,
      data: updatedRestaurant
    })
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Restaurant'))
    }
    logDatabaseError(error, 'UPDATE', { collection: 'restaurants', id, document: req.body })
    throw error
  }
})

/**
 * Delete restaurant
 * @route DELETE /api/restaurants/:id
 * @access Private
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    // Restaurant and ownership already validated by middleware
    const restaurant = req.restaurant

    // Delete restaurant
    await restaurant.deleteOne()

    logger.warn(`Restaurant deleted: ${restaurant.name} by user ${req.user._id}`)

    res.status(204).send()
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Restaurant'))
    }
    logDatabaseError(error, 'DELETE', { collection: 'restaurants', id })
    throw error
  }
})

/**
 * Upload restaurant logo
 * @route POST /api/restaurants/:id/logo
 * @access Private
 */
const uploadLogo = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    // Restaurant and ownership already validated by middleware
    const restaurant = req.restaurant

    // Check if file was uploaded
    if (!req.file) {
      throw badRequest(errorMessages.common.imageUploadRequired)
    }

    // Update restaurant with new logo URL
    const logoUrl = getFileUrl(req.file.filename, 'restaurant')
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { logoUrl },
      { new: true, runValidators: true }
    )

    logger.info(`Restaurant logo updated: ${restaurant.name} by user ${req.user._id}`)

    res.json({
      success: true,
      data: {
        logoUrl: updatedRestaurant.logoUrl
      }
    })
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Restaurant'))
    }
    logDatabaseError(error, 'UPDATE', { collection: 'restaurants', id, field: 'logoUrl' })
    throw error
  }
})

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadLogo
} 