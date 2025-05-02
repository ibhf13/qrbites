const Restaurant = require('@models/restaurantModel')
const {
  asyncHandler,
  notFound,
  badRequest,
  forbidden
} = require('@utils/errorUtils')
const logger = require('@utils/logger')
const { logDatabaseError } = require('@services/errorLogService')
const { getFileUrl } = require('@services/fileUploadService')

/**
 * Get all restaurants
 * @route GET /api/restaurants
 * @access Public
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, name, sortBy = 'createdAt', order = 'desc' } = req.query

  // Build query
  const query = {}

  // Add name filter if provided
  if (name) {
    query.name = { $regex: name, $options: 'i' }
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
 * @access Public
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const restaurant = await Restaurant.findById(id)
      .select('-__v')
      .populate('userId', 'email')

    if (!restaurant) {
      throw notFound(`Restaurant with id ${id} not found`)
    }

    res.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest('Invalid restaurant ID format')
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
    // Find restaurant
    const restaurant = await Restaurant.findById(id)

    if (!restaurant) {
      throw notFound(`Restaurant with id ${id} not found`)
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
      throw forbidden('Not authorized to update this restaurant')
    }

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
      throw badRequest('Invalid restaurant ID format')
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
    // Find restaurant
    const restaurant = await Restaurant.findById(id)

    if (!restaurant) {
      throw notFound(`Restaurant with id ${id} not found`)
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
      throw forbidden('Not authorized to delete this restaurant')
    }

    // Delete restaurant
    await restaurant.deleteOne()

    logger.warn(`Restaurant deleted: ${restaurant.name} by user ${req.user._id}`)

    res.status(204).send()
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest('Invalid restaurant ID format')
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
    // Find restaurant
    const restaurant = await Restaurant.findById(id)

    if (!restaurant) {
      throw notFound(`Restaurant with id ${id} not found`)
    }

    // Check ownership
    if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
      throw forbidden('Not authorized to update this restaurant')
    }

    // Check if file was uploaded
    if (!req.file) {
      throw badRequest('Please upload a logo image')
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
      throw badRequest('Invalid restaurant ID format')
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