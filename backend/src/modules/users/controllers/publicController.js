const { asyncHandler, notFound, badRequest, errorMessages } = require('@errors')
const Menu = require('@modules/menus/models/menu')
const Restaurant = require('@modules/restaurants/models/restaurant')
const MenuItem = require('@modules/menuItems/models/menuItem')
const {
  getCompleteMenuData,
  processMenuForPublic,
} = require('@modules/menus/services/menuDataService')
const { paginate, buildQueryFilters } = require('@commonUtils/paginationUtils')

/**
 * Get public restaurant information
 * @route GET /api/public/restaurants/:restaurantId
 * @access Public
 */
const getPublicRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params

  // Find restaurant by ID and ensure it's active
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true,
  }).select('name description logoUrl contact location')

  if (!restaurant) {
    throw notFound(errorMessages.notFound('Restaurant'))
  }

  res.json({
    success: true,
    data: restaurant,
  })
})

/**
 * Get public menu information
 * @route GET /api/public/menus/:menuId
 * @access Public
 */
const getPublicMenu = asyncHandler(async (req, res) => {
  const { menuId } = req.params

  // Find menu by ID and ensure it's active
  const menu = await Menu.findOne({
    _id: menuId,
    isActive: true,
  })
    .select('name description imageUrl restaurantId qrCodeUrl categories updatedAt')
    .populate('restaurantId', 'name logoUrl id')

  if (!menu) {
    throw notFound(errorMessages.notFound('Menu'))
  }

  // Process menu data for public consumption
  const processedMenu = processMenuForPublic(menu)

  res.json({
    success: true,
    data: processedMenu,
  })
})

/**
 * Get public menu items for a specific menu
 * @route GET /api/public/menus/:menuId/items
 * @access Public
 */
const getPublicMenuItems = asyncHandler(async (req, res) => {
  const { menuId } = req.params

  // Validate that menu exists and is active
  const menuExists = await Menu.exists({ _id: menuId, isActive: true })
  if (!menuExists) {
    throw notFound(errorMessages.notFound('Menu'))
  }

  // Build query filters
  const query = buildQueryFilters(req.query, {
    exactMatch: ['category'],
    searchFields: ['name', 'description'],
    allowedSortFields: ['name', 'category', 'price'],
  })

  // Add base query conditions
  query.menuId = menuId
  query.isAvailable = true

  // Execute paginated query
  const result = await paginate(MenuItem, query, {
    pagination: {
      page: req.query.page,
      limit: req.query.limit,
      defaultLimit: 20,
      maxLimit: 50,
    },
    sort: {
      sortBy: req.query.sortBy,
      order: req.query.order,
      defaultSortBy: 'category',
      defaultOrder: 'asc',
      allowedSortFields: ['name', 'category', 'price'],
    },
    select: 'name description price imageUrl category',
    lean: true,
  })

  // Get distinct categories for filtering UI (only from available items)
  const categories = await MenuItem.distinct('category', { menuId, isAvailable: true })

  res.json({
    success: true,
    data: {
      items: result.data,
      pagination: result.pagination,
      categories,
    },
  })
})

/**
 * Get complete public menu with items
 * @route GET /api/public/complete-menu/:menuId
 * @access Public
 */
const getCompletePublicMenu = asyncHandler(async (req, res) => {
  const { menuId } = req.params

  // Use the menu data service to get complete menu data
  const completeMenuData = await getCompleteMenuData(menuId)

  res.json({
    success: true,
    data: completeMenuData,
  })
})

/**
 * Redirect to frontend menu view based on QR code
 * @route GET /r/:menuId
 * @access Public
 */
const redirectToMenu = asyncHandler(async (req, res) => {
  const { menuId } = req.params
  const { restaurant: restaurantId } = req.query

  // Check if menu exists and is active
  const menu = await Menu.findOne({ _id: menuId, isActive: true })
  if (!menu) {
    throw notFound(errorMessages.notFound('Menu'))
  }

  // If restaurant ID is not provided in query, get it from menu
  let targetRestaurantId = restaurantId
  if (!targetRestaurantId && menu.restaurantId) {
    targetRestaurantId =
      typeof menu.restaurantId === 'object'
        ? menu.restaurantId._id?.toString() || menu.restaurantId.toString()
        : menu.restaurantId.toString()
  }

  if (!targetRestaurantId) {
    throw badRequest('Restaurant ID not available')
  }

  // Redirect to frontend URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  res.redirect(`${frontendUrl}/view/menu/${menuId}?restaurant=${targetRestaurantId}`)
})

module.exports = {
  getPublicRestaurant,
  getPublicMenu,
  getPublicMenuItems,
  getCompletePublicMenu,
  redirectToMenu,
}
