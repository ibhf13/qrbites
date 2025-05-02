const asyncHandler = require('@middlewares/asyncHandler')
const Menu = require('@models/menuModel')
const Restaurant = require('@models/restaurantModel')
const MenuItem = require('@models/menuItemModel')
const { notFound, badRequest } = require('@utils/errorUtils')

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
        throw notFound('Restaurant not found')
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
        throw notFound('Menu not found')
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
        throw notFound('Menu not found')
    }

    // Build query
    const query = { menuId }

    // Add category filter if provided
    if (category) {
        query.category = category
    }

    // Add search filter if provided
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ]
    }

    // Pagination options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        select: 'name description price imageUrl category dietary',
        sort: { category: 1, name: 1 }
    }

    // Get menu items with pagination
    const menuItems = await MenuItem.paginate(query, options)

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

    // Find menu by ID
    const menu = await Menu.findById(menuId)
        .select('name description imageUrl restaurantId qrCodeUrl')
        .populate('restaurantId', 'name description logoUrl address contacts')

    if (!menu) {
        throw notFound('Menu not found')
    }

    // Get all menu items for this menu (without pagination)
    const menuItems = await MenuItem.find({ menuId })
        .select('name description price imageUrl category dietary')
        .sort({ category: 1, name: 1 })

    // Get distinct categories
    const categories = await MenuItem.distinct('category', { menuId })

    // Group menu items by category
    const itemsByCategory = categories.reduce((acc, category) => {
        acc[category] = menuItems.filter(item => item.category === category)
        return acc
    }, {})

    res.json({
        success: true,
        data: {
            menu,
            categories,
            itemsByCategory
        }
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
        throw notFound('Menu not found')
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