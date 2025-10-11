const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')
const { asyncHandler, notFound, errorMessages } = require('@errors')
const logger = require('@commonUtils/logger')
const {
  attachFileUrl,
  updateDocumentWithFileUrl,
  validateFileUpload,
} = require('@commonUtils/fileUploadUtils')
const { paginate, buildQueryFilters } = require('@commonUtils/paginationUtils')
const { clearCache } = require('@commonMiddlewares/cacheMiddleware')

const Restaurant = require('../models/restaurant')

/**
 * Get all restaurants
 * @route GET /api/restaurants
 * @access Private (users see only their own restaurants)
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const query = buildQueryFilters(req.query, {
    regexMatch: ['name'],
    allowedSortFields: ['name', 'createdAt', 'updatedAt'],
  })

  if (req.user && req.user.role !== 'admin') {
    // Use pre-loaded user restaurant IDs if available for filtering
    if (req.userRestaurantIds && req.userRestaurantIds.length > 0) {
      query._id = { $in: req.userRestaurantIds }
    } else {
      // Fallback to userId filter (shouldn't happen with proper middleware setup)
      query.userId = req.user._id
    }
  }

  const result = await paginate(Restaurant, query, {
    pagination: {
      page: req.query.page,
      limit: req.query.limit,
    },
    sort: {
      sortBy: req.query.sortBy,
      order: req.query.order,
      defaultSortBy: 'createdAt',
      defaultOrder: 'desc',
      allowedSortFields: ['name', 'createdAt', 'updatedAt'],
    },
    populate: [{ path: 'userId', select: 'email' }],
    select: '-__v',
  })

  res.json(result)
})

/**
 * Get restaurant by ID
 * @route GET /api/restaurants/:id
 * @access Private
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const restaurant = await Restaurant.findById(id).select('-__v').populate('userId', 'email')

  if (!restaurant) {
    throw notFound(errorMessages.notFound('Restaurant', id))
  }

  res.json({
    success: true,
    data: restaurant,
  })
})

/**
 * Create restaurant
 * @route POST /api/restaurants
 * @access Private
 */
const createRestaurant = asyncHandler(async (req, res) => {
  // Add user ID from authenticated user
  req.body.userId = req.user._id

  // Add logo URL if file was uploaded
  attachFileUrl(req, 'restaurant', 'logoUrl')

  // Create restaurant
  const restaurant = await Restaurant.create(req.body)

  logger.success(`Restaurant created: ${restaurant.name} by user ${req.user._id}`)

  // Clear cache for public restaurant routes
  clearCache('/api/public/restaurants/')
  clearCache('/api/public/menus/')

  res.status(201).json({
    success: true,
    data: restaurant,
  })
})

/**
 * Update restaurant
 * @route PUT /api/restaurants/:id
 * @access Private
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Add logo URL if file was uploaded
  attachFileUrl(req, 'restaurant', 'logoUrl')

  // Update restaurant
  const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })

  logger.info(`Restaurant updated: ${updatedRestaurant.name} by user ${req.user._id}`)

  // Clear cache for public restaurant routes
  clearCache('/api/public/restaurants/')
  clearCache('/api/public/menus/')

  res.json({
    success: true,
    data: updatedRestaurant,
  })
})

/**
 * Delete restaurant with related menus and menu items
 * @route DELETE /api/restaurants/:id
 * @access Private
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Get all menus for this restaurant
  const menus = await Menu.find({ restaurantId: id })
  const menuIds = menus.map(menu => menu._id)

  // Delete all menu items associated with restaurant's menus
  await MenuItem.deleteMany({ menuId: { $in: menuIds } })

  // Delete all menus for this restaurant
  await Menu.deleteMany({ restaurantId: id })

  // Delete the restaurant
  await Restaurant.deleteOne({ _id: id })

  logger.warn(
    `Restaurant deleted: all it related menus and menu items by user ${req.user._id}`
  )

  // Clear cache for public restaurant routes
  clearCache('/api/public/restaurants/')
  clearCache('/api/public/menus/')

  res.status(204).send()
})

/**
 * Upload restaurant logo
 * @route POST /api/restaurants/:id/logo
 * @access Private
 */
const uploadLogo = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check if file was uploaded
  validateFileUpload(req, errorMessages.common.imageUploadRequired)

  // Update restaurant with new logo URL
  const updatedRestaurant = await updateDocumentWithFileUrl(
    Restaurant,
    id,
    req,
    'restaurant',
    'logoUrl'
  )

  logger.info(`Restaurant logo updated: ${updatedRestaurant.name} by user ${req.user._id}`)

  // Clear cache for public restaurant routes
  clearCache('/api/public/restaurants/')
  clearCache('/api/public/menus/')

  res.json({
    success: true,
    data: {
      logoUrl: updatedRestaurant.logoUrl,
    },
  })
})

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadLogo,
}
