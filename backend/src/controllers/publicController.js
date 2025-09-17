const { asyncHandler, notFound, badRequest, errorMessages } = require('@utils/errorUtils')
const Menu = require('@models/menu')
const Restaurant = require('@models/restaurant')
const MenuItem = require('@models/menuItem')
const { getCompleteMenuData, processMenuForPublic } = require('@services/menuDataService')
const { createSafeSearchQuery } = require('@utils/sanitization')

/**
 * Get public restaurant information
 * @route GET /api/public/restaurants/:restaurantId
 * @access Public
 */
const getPublicRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params

    // Find restaurant by ID
    const restaurant = await Restaurant.findById(restaurantId)
        .select('name description logoUrl address contacts')

    if (!restaurant) {
        throw notFound(errorMessages.notFound('Restaurant'))
    }

    res.json({
        success: true,
        data: restaurant
    })
})

/**
 * Get public menu information
 * @route GET /api/public/menus/:menuId
 * @access Public
 */
const getPublicMenu = asyncHandler(async (req, res) => {
    const { menuId } = req.params

    // Find menu by ID
    const menu = await Menu.findById(menuId)
        .select('name description imageUrl restaurantId qrCodeUrl')
        .populate('restaurantId', 'name logoUrl')

    if (!menu) {
        throw notFound(errorMessages.notFound('Menu'))
    }

    res.json({
        success: true,
        data: menu
    })
})

/**
 * Get public menu items for a specific menu
 * @route GET /api/public/menus/:menuId/items
 * @access Public
 */
const getPublicMenuItems = asyncHandler(async (req, res) => {
    const { menuId } = req.params
    const { page = 1, limit = 20, category, search } = req.query

    // Validate that menu exists
    const menuExists = await Menu.exists({ _id: menuId })
    if (!menuExists) {
        throw notFound(errorMessages.notFound('Menu'))
    }

    // Build query
    const query = { menuId }

    // Add category filter if provided
    if (category) {
        query.category = category
    }

    // Add search filter if provided (with sanitization to prevent ReDoS attacks)
    if (search) {
        const safeSearchQueries = createSafeSearchQuery(search, ['name', 'description'])
        if (safeSearchQueries.length > 0) {
            query.$or = safeSearchQueries
        }
    }

    // Pagination setup
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    const skip = (pageNum - 1) * limitNum

    // Get total count for pagination metadata
    const totalDocs = await MenuItem.countDocuments(query)
    const totalPages = Math.ceil(totalDocs / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    // Get menu items with manual pagination
    const docs = await MenuItem.find(query)
        .select('name description price imageUrl category')
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean()

    // Create pagination result object to match paginate plugin format
    const menuItems = {
        docs,
        totalDocs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        pagingCounter: skip + 1,
        prevPage: hasPrevPage ? pageNum - 1 : null,
        nextPage: hasNextPage ? pageNum + 1 : null
    }

    // Get distinct categories for filtering UI
    const categories = await MenuItem.distinct('category', { menuId })

    res.json({
        success: true,
        data: {
            ...menuItems,
            categories
        }
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
        data: completeMenuData
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

    // Check if menu exists
    const menu = await Menu.findById(menuId)
    if (!menu) {
        throw notFound(errorMessages.notFound('Menu'))
    }

    // If restaurant ID is not provided in query, get it from menu
    const targetRestaurantId = restaurantId || menu.restaurantId.toString()

    // Redirect to frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/view/menu/${menuId}?restaurant=${targetRestaurantId}`)
})

module.exports = {
    getPublicRestaurant,
    getPublicMenu,
    getPublicMenuItems,
    getCompletePublicMenu,
    redirectToMenu
} 