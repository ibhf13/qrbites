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
const { generateMenuQRCode } = require('@services/qrCodeService')

/**
 * Get all menus with optional filtering
 * @route GET /api/menus
 * @access Private (users see only their own restaurant menus)
 */
const getMenus = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, name, restaurantId, sortBy = 'createdAt', order = 'desc' } = req.query

    // Build query
    const query = {}

    // Add name filter if provided
    if (name) {
        query.name = { $regex: name, $options: 'i' }
    }

    // Add restaurant filter if provided
    if (restaurantId) {
        query.restaurantId = restaurantId
    }

    // SECURITY FIX: Filter by user's restaurants only (unless admin)
    if (req.user && req.user.role !== 'admin') {
        // If user provided restaurantId and isn't admin, ensure ownership
        if (restaurantId) {
            const owns = await Restaurant.exists({ _id: restaurantId, userId: req.user._id })
            if (!owns) {
                throw forbidden('Not authorized for this restaurant')
            }
            query.restaurantId = restaurantId
        } else {
            // Get all restaurants owned by the user
            const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
            const userRestaurantIds = userRestaurants.map(r => r._id)
            query.restaurantId = { $in: userRestaurantIds }
        }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = order === 'desc' ? -1 : 1

    try {
        // Calculate pagination
        const skip = (page - 1) * limit

        // Execute query
        const menus = await Menu.find(query)
            .select('-__v')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'restaurantId',
                select: 'name'
            })

        // Get total count
        const total = await Menu.countDocuments(query)

        res.json({
            success: true,
            data: menus,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logDatabaseError(error, 'FIND', { collection: 'menus', query })
        throw error
    }
})

/**
 * Get menu by ID
 * @route GET /api/menus/:id
 * @access Public
 */
const getMenuById = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        const menu = await Menu.findById(id)
            .select('-__v')
            .populate({
                path: 'restaurantId',
                select: 'name'
            })
            .populate({
                path: 'menuItems',
                select: '-__v'
            })

        if (!menu) {
            throw notFound(`Menu with id ${id} not found`)
        }

        res.json({
            success: true,
            data: menu
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu ID format')
        }
        throw error
    }
})

/**
 * Create menu
 * @route POST /api/menus
 * @access Private
 */
const createMenu = asyncHandler(async (req, res) => {
    const { restaurantId } = req.body

    try {
        // Check if restaurant exists and user owns it
        const restaurant = await Restaurant.findById(restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant with id ${restaurantId} not found`)
        }

        // Check restaurant ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to create menu for this restaurant')
        }

        // Add image URLs if files were uploaded
        if (req.files && req.files.length > 0) {
            // For now, use the first image as the main imageUrl for backward compatibility
            req.body.imageUrl = getFileUrl(req.files[0].filename, 'menu')

            // Store all image URLs for future use
            req.body.imageUrls = req.files.map(file => getFileUrl(file.filename, 'menu'))
        }

        // Create menu
        const menu = await Menu.create(req.body)

        // Generate QR code for the menu
        const qrCodeUrl = await generateMenuQRCode(menu._id, restaurantId)

        // Update menu with QR code URL
        menu.qrCodeUrl = qrCodeUrl
        await menu.save()

        logger.success(`Menu created: ${menu.name} for restaurant ${restaurantId} by user ${req.user._id}`)

        res.status(201).json({
            success: true,
            data: menu
        })
    } catch (error) {
        logDatabaseError(error, 'CREATE', { collection: 'menus', document: req.body })
        throw error
    }
})

/**
 * Update menu
 * @route PUT /api/menus/:id
 * @access Private
 */
const updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu
        const menu = await Menu.findById(id)

        if (!menu) {
            throw notFound(`Menu with id ${id} not found`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to update this menu')
        }

        // Add image URLs if files were uploaded
        if (req.files && req.files.length > 0) {
            // For now, use the first image as the main imageUrl for backward compatibility
            req.body.imageUrl = getFileUrl(req.files[0].filename, 'menu')

            // Store all image URLs for future use
            req.body.imageUrls = req.files.map(file => getFileUrl(file.filename, 'menu'))
        }

        // Update menu
        const updatedMenu = await Menu.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )

        logger.info(`Menu updated: ${menu.name} by user ${req.user._id}`)

        res.json({
            success: true,
            data: updatedMenu
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu ID format')
        }
        logDatabaseError(error, 'UPDATE', { collection: 'menus', id, document: req.body })
        throw error
    }
})

/**
 * Delete menu
 * @route DELETE /api/menus/:id
 * @access Private
 */
const deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu
        const menu = await Menu.findById(id)

        if (!menu) {
            throw notFound(`Menu with id ${id} not found`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to delete this menu')
        }

        // Delete menu
        await menu.deleteOne()

        logger.warn(`Menu deleted: ${menu.name} by user ${req.user._id}`)

        res.status(204).send()
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu ID format')
        }
        logDatabaseError(error, 'DELETE', { collection: 'menus', id })
        throw error
    }
})

/**
 * Upload menu image
 * @route POST /api/menus/:id/image
 * @access Private
 */
const uploadImage = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu
        const menu = await Menu.findById(id)

        if (!menu) {
            throw notFound(`Menu with id ${id} not found`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to update this menu')
        }

        // Check if file was uploaded
        if (!req.file) {
            throw badRequest('Please upload an image')
        }

        // Update menu with new image URL
        const imageUrl = getFileUrl(req.file.filename, 'menu')
        const updatedMenu = await Menu.findByIdAndUpdate(
            id,
            { imageUrl },
            { new: true, runValidators: true }
        )

        logger.info(`Menu image updated: ${menu.name} by user ${req.user._id}`)

        res.json({
            success: true,
            data: {
                imageUrl: updatedMenu.imageUrl
            }
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest('Invalid menu ID format')
        }
        logDatabaseError(error, 'UPDATE', { collection: 'menus', id, field: 'imageUrl' })
        throw error
    }
})

/**
 * Generate QR code for a menu
 * @route POST /api/menus/:id/qrcode
 * @access Private
 */
const generateQRCode = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Find menu
        const menu = await Menu.findById(id)

        if (!menu) {
            throw notFound(`Menu with id ${id} not found`)
        }

        // Find restaurant to check ownership
        const restaurant = await Restaurant.findById(menu.restaurantId)

        if (!restaurant) {
            throw notFound(`Restaurant with id ${menu.restaurantId} not found for menu ${id}`)
        }

        if (!restaurant.userId) {
            throw badRequest(`Restaurant with id ${menu.restaurantId} has no associated user`)
        }

        // Check ownership
        if (req.user.role !== 'admin' && restaurant.userId.toString() !== req.user._id.toString()) {
            throw forbidden('Not authorized to generate QR code for this menu')
        }

        // Generate new QR code
        const qrCodeUrl = await generateMenuQRCode(menu._id, menu.restaurantId)

        // Update menu with QR code URL
        menu.qrCodeUrl = qrCodeUrl
        await menu.save()

        logger.info(`QR code generated for menu: ${menu.name} by user ${req.user._id}`)

        res.json({
            success: true,
            data: {
                qrCodeUrl
            }
        })
    } catch (error) {
        logger.error(`Error generating QR code for menu ${id}:`, error)
        throw error
    }
})

module.exports = {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    uploadImage,
    generateQRCode
} 