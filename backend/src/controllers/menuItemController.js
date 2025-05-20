const MenuItem = require('@models/menuItem')
const Menu = require('@models/menu')
const Restaurant = require('@models/restaurant')
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
 * Get all menu items with optional filtering
 * @route GET /api/menu-items
 * @access Public
 */
const getMenuItems = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, name, menuId, category, sortBy = 'createdAt', order = 'desc' } = req.query

    // Build query
    const query = {}

    // Add name filter if provided
    if (name) {
        query.name = { $regex: name, $options: 'i' }
    }

    // Add menu filter if provided
    if (menuId) {
        query.menuId = menuId
    }

    // Add category filter if provided
    if (category) {
        query.category = category
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = order === 'desc' ? -1 : 1

    try {
        // Calculate pagination
        const skip = (page - 1) * limit

        // Execute query
        const menuItems = await MenuItem.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'menuId',
                select: 'name restaurantId'
            })

        // Get total count
        const total = await MenuItem.countDocuments(query)

        res.json({
            success: true,
            data: menuItems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logDatabaseError(error, 'FIND', { collection: 'menuItems', query })
        throw error
    }
})

/**
 * Get menu item by ID
 * @route GET /api/menu-items/:id
 * @access Public
 */
const getMenuItemById = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        const menuItem = await MenuItem.findById(id)
            .select('-__v')
            .populate({
                path: 'menuId',
                select: 'name restaurantId',
                populate: {
                    path: 'restaurantId',
                    select: 'name'
                }
            })

        if (!menuItem) {
            throw notFound(`Menu item with id ${id} not found`)
        }

        res.json({
            success: true,
            data: menuItem
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu item ID format')
        }
        throw error
    }
})

/**
 * Create menu item
 * @route POST /api/menu-items
 * @access Private
 */
const createMenuItem = asyncHandler(async (req, res) => {
    const { menuId } = req.body

    try {
        // Check if menu exists
        const menu = await Menu.findById(menuId)

        if (!menu) {
            throw notFound(`Menu with id ${menuId} not found`)
        }

        // Check restaurant ownership through menu
        const restaurant = await Restaurant.findById(menu.restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant not found`)
        }

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to create menu items for this menu')
        }

        // Add image URL if file was uploaded
        if (req.file) {
            req.body.imageUrl = getFileUrl(req.file.filename, 'menuItem')
        }

        // Create menu item
        const menuItem = await MenuItem.create(req.body)

        logger.success(`Menu item created: ${menuItem.name} for menu ${menuId} by user ${req.user._id}`)

        res.status(201).json({
            success: true,
            data: menuItem
        })
    } catch (error) {
        logDatabaseError(error, 'CREATE', { collection: 'menuItems', document: req.body })
        throw error
    }
})

/**
 * Update menu item
 * @route PUT /api/menu-items/:id
 * @access Private
 */
const updateMenuItem = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu item
        const menuItem = await MenuItem.findById(id)

        if (!menuItem) {
            throw notFound(`Menu item with id ${id} not found`)
        }

        // Find menu to get restaurant
        const menu = await Menu.findById(menuItem.menuId)

        if (!menu) {
            throw notFound(`Menu not found for this item`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant not found`)
        }

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to update this menu item')
        }

        // Add image URL if file was uploaded
        if (req.file) {
            req.body.imageUrl = getFileUrl(req.file.filename, 'menuItem')
        }

        // Update menu item
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )

        logger.info(`Menu item updated: ${menuItem.name} by user ${req.user._id}`)

        res.json({
            success: true,
            data: updatedMenuItem
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu item ID format')
        }
        logDatabaseError(error, 'UPDATE', { collection: 'menuItems', id, document: req.body })
        throw error
    }
})

/**
 * Delete menu item
 * @route DELETE /api/menu-items/:id
 * @access Private
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu item
        const menuItem = await MenuItem.findById(id)

        if (!menuItem) {
            throw notFound(`Menu item with id ${id} not found`)
        }

        // Find menu to get restaurant
        const menu = await Menu.findById(menuItem.menuId)

        if (!menu) {
            throw notFound(`Menu not found for this item`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant not found`)
        }

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to delete this menu item')
        }

        // Delete menu item
        await menuItem.deleteOne()

        logger.warn(`Menu item deleted: ${menuItem.name} by user ${req.user._id}`)

        res.status(204).send()
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu item ID format')
        }
        logDatabaseError(error, 'DELETE', { collection: 'menuItems', id })
        throw error
    }
})

/**
 * Upload menu item image
 * @route POST /api/menu-items/:id/image
 * @access Private
 */
const uploadImage = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu item
        const menuItem = await MenuItem.findById(id)

        if (!menuItem) {
            throw notFound(`Menu item with id ${id} not found`)
        }

        // Find menu to get restaurant
        const menu = await Menu.findById(menuItem.menuId)

        if (!menu) {
            throw notFound(`Menu not found for this item`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant not found`)
        }

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to update this menu item')
        }

        // Check if file was uploaded
        if (!req.file) {
            throw badRequest('Please upload an image')
        }

        // Update menu item with new image URL
        const imageUrl = getFileUrl(req.file.filename, 'menuItem')
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id,
            { imageUrl },
            { new: true, runValidators: true }
        )

        logger.info(`Menu item image updated: ${menuItem.name} by user ${req.user._id}`)

        res.json({
            success: true,
            data: {
                imageUrl: updatedMenuItem.imageUrl
            }
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu item ID format')
        }
        logDatabaseError(error, 'UPDATE', { collection: 'menuItems', id, field: 'imageUrl' })
        throw error
    }
})

module.exports = {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadImage
} 