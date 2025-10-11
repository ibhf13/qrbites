const Menu = require('@modules/menus/models/menu')
const Restaurant = require('@modules/restaurants/models/restaurant')
const { asyncHandler, notFound, errorMessages } = require('@errors')
const logger = require('@commonUtils/logger')
const {
  attachFileUrl,
  updateDocumentWithFileUrl,
  validateFileUpload,
} = require('@commonUtils/fileUploadUtils')
const { paginate, buildQueryFilters } = require('@commonUtils/paginationUtils')
const { clearCache } = require('@commonMiddlewares/cacheMiddleware')

const MenuItem = require('../models/menuItem')

/**
 * Get all menu items with optional filtering
 * @route GET /api/menu-items
 * @access Private
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const query = buildQueryFilters(req.query, {
    exactMatch: ['menuId', 'category'],
    regexMatch: ['name'],
    allowedSortFields: ['name', 'category', 'price', 'createdAt', 'updatedAt'],
  })

  // For non-admin users, filter by user's restaurants
  if (req.user.role !== 'admin') {
    // Use pre-loaded user restaurant IDs if available, otherwise fetch from database
    let userRestaurantIds
    if (req.userRestaurantIds) {
      userRestaurantIds = req.userRestaurantIds
    } else {
      // Fallback to database query (shouldn't happen with proper middleware setup)
      const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
      userRestaurantIds = userRestaurants.map(r => r._id)
    }

    const userMenus = await Menu.find({ restaurantId: { $in: userRestaurantIds } }).select('_id')
    const userMenuIds = userMenus.map(m => m._id)

    // Only show menu items from user's menus
    query.menuId = { $in: userMenuIds }
  }

  const result = await paginate(MenuItem, query, {
    pagination: {
      page: req.query.page,
      limit: req.query.limit,
    },
    sort: {
      sortBy: req.query.sortBy,
      order: req.query.order,
      defaultSortBy: 'createdAt',
      defaultOrder: 'desc',
      allowedSortFields: ['name', 'category', 'price', 'createdAt', 'updatedAt'],
    },
    populate: [{ path: 'menuId', select: 'name restaurantId' }],
    select: '-__v',
  })

  res.json(result)
})

/**
 * Get menu item by ID
 * @route GET /api/menu-items/:id
 * @access Private
 */
const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const menuItem = await MenuItem.findById(id)
    .select('-__v')
    .populate({
      path: 'menuId',
      select: 'name restaurantId',
      populate: {
        path: 'restaurantId',
        select: 'name',
      },
    })

  if (!menuItem) {
    throw notFound(errorMessages.notFound('Menu item', id))
  }

  res.json({
    success: true,
    data: menuItem,
  })
})

/**
 * Create menu item
 * @route POST /api/menu-items
 * @access Private
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const { menuId } = req.body

  // testing
  // Menu, restaurant and ownership already validated by middleware
  // const menu = req.menu

  // Add image URL if file was uploaded
  attachFileUrl(req, 'menuItem', 'imageUrl')

  // Create menu item
  const menuItem = await MenuItem.create(req.body)

  logger.success(`Menu item created: ${menuItem.name} for menu ${menuId} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache('/api/public/menus/')
  clearCache('/api/public/restaurants/')

  res.status(201).json({
    success: true,
    data: menuItem,
  })
})

/**
 * Update menu item
 * @route PUT /api/menu-items/:id
 * @access Private
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Add image URL if file was uploaded
  attachFileUrl(req, 'menuItem', 'imageUrl')

  // Update menu item
  const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!updatedMenuItem) {
    throw notFound(errorMessages.notFound('Menu item', id))
  }

  logger.info(`Menu item updated: ${updatedMenuItem.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache('/api/public/menus/')
  clearCache('/api/public/restaurants/')

  res.json({
    success: true,
    data: updatedMenuItem,
  })
})

/**
 * Delete menu item
 * @route DELETE /api/menu-items/:id
 * @access Private
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Find and delete menu item
  const menuItem = await MenuItem.findByIdAndDelete(id)

  if (!menuItem) {
    throw notFound(errorMessages.notFound('Menu item', id))
  }

  logger.warn(`Menu item deleted: ${menuItem.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache('/api/public/menus/')
  clearCache('/api/public/restaurants/')

  res.status(204).send()
})

/**
 * Upload menu item image
 * @route POST /api/menu-items/:id/image
 * @access Private
 */
const uploadImage = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check if file was uploaded
  validateFileUpload(req, errorMessages.common.imageUploadRequired)

  // Update menu item with new image URL
  const updatedMenuItem = await updateDocumentWithFileUrl(MenuItem, id, req, 'menuItem', 'imageUrl')

  if (!updatedMenuItem) {
    throw notFound(errorMessages.notFound('Menu item', id))
  }

  logger.info(`Menu item image updated: ${updatedMenuItem.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache('/api/public/menus/')
  clearCache('/api/public/restaurants/')

  res.json({
    success: true,
    data: {
      imageUrl: updatedMenuItem.imageUrl,
    },
  })
})

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
}
