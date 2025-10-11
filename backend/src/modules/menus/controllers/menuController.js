const MenuItem = require('@modules/menuItems/models/menuItem')
const Restaurant = require('@modules/restaurants/models/restaurant')
const { asyncHandler, notFound, badRequest, forbidden, errorMessages } = require('@errors')
const logger = require('@commonUtils/logger')
const {
  attachFileUrls,
  updateDocumentWithFileUrl,
  validateFileUpload,
} = require('@commonUtils/fileUploadUtils')
const { paginate, buildQueryFilters } = require('@commonUtils/paginationUtils')
const { clearCache } = require('@commonMiddlewares/cacheMiddleware')

const { generateMenuQRCode } = require('../services')
const Menu = require('../models/menu')

// Cache keys for clearing public routes
const CACHE_KEYS = {
  PUBLIC_MENUS: '/api/public/menus/',
  PUBLIC_RESTAURANTS: '/api/public/restaurants/'
}

/**
 * Get all menus with optional filtering
 * @route GET /api/menus
 * @access Private (users see only their own restaurant menus)
 */
const getMenus = asyncHandler(async (req, res) => {
  // Build query filters
  const query = buildQueryFilters(req.query, {
    exactMatch: ['restaurantId'],
    regexMatch: ['name'],
    allowedSortFields: ['name', 'createdAt', 'updatedAt'],
  })

  // Handle user-specific restaurant filtering
  if (req.user && req.user.role !== 'admin') {
    if (req.query.restaurantId) {
      // Validate restaurant ownership using pre-loaded user restaurants if available
      const userRestaurantIds = req.userRestaurantIds || []
      if (!userRestaurantIds.includes(req.query.restaurantId)) {
        throw forbidden(errorMessages.forbidden('access', 'restaurant'))
      }
    } else {
      // Use pre-loaded user restaurant IDs if available, otherwise fetch from database
      if (req.userRestaurantIds) {
        query.restaurantId = { $in: req.userRestaurantIds }
      } else {
        // Fallback to database query (shouldn't happen with proper middleware setup)
        const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
        const userRestaurantIds = userRestaurants.map(r => r._id)
        query.restaurantId = { $in: userRestaurantIds }
      }
    }
  }

  // Execute paginated query
  const result = await paginate(Menu, query, {
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
    select: '-__v',
  })

  res.json(result)
})

/**
 * Get menu by ID
 * @route GET /api/menus/:id
 * @access Private
 */
const getMenuById = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Menu and ownership already validated by middleware, but we need to populate menuItems
  const menu = await Menu.findById(id)
    .select('-__v')
    .populate({
      path: 'restaurantId',
      select: 'name id',
    })
    .populate({
      path: 'menuItems',
      select: '-__v',
    })

  if (!menu) {
    throw notFound(errorMessages.notFound('Menu', id))
  }

  res.json({
    success: true,
    data: menu,
  })
})

/**
 * Create menu
 * @route POST /api/menus
 * @access Private
 */
const createMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.body

  // Restaurant ownership already validated by middleware
  // const restaurant = req.restaurant

  // Add image URLs if files were uploaded
  attachFileUrls(req, 'menu', 'imageUrls', 'imageUrl')

  // Create menu
  const menu = await Menu.create(req.body)

  try {
    // Generate QR code for the menu
    const qrCodeUrl = await generateMenuQRCode(menu._id, restaurantId)

    // Update menu with QR code URL
    menu.qrCodeUrl = qrCodeUrl
    await menu.save()

    logger.success(
      `Menu created: ${menu.name} for restaurant ${restaurantId} by user ${req.user._id}`
    )

    // Clear cache for public menu routes
    clearCache(CACHE_KEYS.PUBLIC_MENUS)
    clearCache(CACHE_KEYS.PUBLIC_RESTAURANTS)

    res.status(201).json({
      success: true,
      data: menu,
    })
  } catch (qrError) {
    // If QR code generation fails, delete the menu and throw error
    logger.error(`QR code generation failed for menu ${menu._id}, rolling back menu creation`)
    await Menu.findByIdAndDelete(menu._id)
    throw qrError
  }
})

/**
 * Update menu
 * @route PUT /api/menus/:id
 * @access Private
 */
const updateMenu = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Add image URLs if files were uploaded
  attachFileUrls(req, 'menu', 'imageUrls', 'imageUrl')

  // Update menu
  const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

  if (!updatedMenu) {
    throw notFound(errorMessages.notFound('Menu', id))
  }

  logger.info(`Menu updated: ${updatedMenu.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache(CACHE_KEYS.PUBLIC_MENUS)
  clearCache(CACHE_KEYS.PUBLIC_RESTAURANTS)

  res.json({
    success: true,
    data: updatedMenu,
  })
})

/**
 * Delete menu with related menu items
 * @route DELETE /api/menus/:id
 * @access Private
 */
const deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.params
  // const menu = req.menu

  // Delete all menu items associated with this menu
  await MenuItem.deleteMany({ menuId: id })

  // Delete the menu
  await Menu.findByIdAndDelete(id)

  // Clear cache for public menu routes
  clearCache(CACHE_KEYS.PUBLIC_MENUS)
  clearCache(CACHE_KEYS.PUBLIC_RESTAURANTS)

  res.status(204).send()
})

/**
 * Upload menu image
 * @route POST /api/menus/:id/image
 * @access Private
 */
const uploadImage = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check if file was uploaded
  validateFileUpload(req, errorMessages.common.imageUploadRequired)

  // Update menu with new image URL
  const updatedMenu = await updateDocumentWithFileUrl(Menu, id, req, 'menu', 'imageUrl')

  if (!updatedMenu) {
    throw notFound(errorMessages.notFound('Menu', id))
  }

  logger.info(`Menu image updated: ${updatedMenu.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache(CACHE_KEYS.PUBLIC_MENUS)
  clearCache(CACHE_KEYS.PUBLIC_RESTAURANTS)

  res.json({
    success: true,
    data: {
      imageUrl: updatedMenu.imageUrl,
    },
  })
})

/**
 * Generate QR code for a menu
 * @route POST /api/menus/:id/qrcode
 * @access Private
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Fetch menu with restaurant information
  const menu = await Menu.findById(id).populate('restaurantId', 'userId')

  if (!menu) {
    throw notFound(errorMessages.notFound('Menu', id))
  }

  if (!menu.restaurantId || !menu.restaurantId.userId) {
    throw badRequest(`Restaurant with id ${menu.restaurantId} has no associated user`)
  }

  // Generate new QR code
  const qrCodeUrl = await generateMenuQRCode(menu._id, menu.restaurantId._id)

  // Update menu with QR code URL
  menu.qrCodeUrl = qrCodeUrl
  await menu.save()

  logger.info(`QR code generated for menu: ${menu.name} by user ${req.user._id}`)

  // Clear cache for public menu routes
  clearCache(CACHE_KEYS.PUBLIC_MENUS)
  clearCache(CACHE_KEYS.PUBLIC_RESTAURANTS)

  // Create QR response data that matches frontend expectations
  const qrResponse = {
    qrCodeUrl,
    qrCodeData: {
      url: `${process.env.API_URL || 'http://localhost:5000'}/r/${menu._id}?restaurant=${menu.restaurantId._id}`,
      downloadUrl: qrCodeUrl,
      publicUrl: qrCodeUrl,
      generatedAt: new Date().toISOString(),
    },
  }

  res.json({
    success: true,
    data: qrResponse,
  })
})

module.exports = {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadImage,
  generateQRCode,
}
