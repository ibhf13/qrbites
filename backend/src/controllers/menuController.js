const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const Restaurant = require('@models/restaurant')
const mongoose = require('mongoose')
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
const { generateMenuQRCode } = require('@services/qrCodeService')
const { createSafeRegexQuery } = require('@utils/sanitization')

/**
 * Get all menus with optional filtering
 * @route GET /api/menus
 * @access Private (users see only their own restaurant menus)
 */
const getMenus = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, name, restaurantId, sortBy = 'createdAt', order = 'desc' } = req.query

    // Build query
    const query = {}

    // Add name filter if provided (with sanitization to prevent ReDoS attacks)
    if (name) {
        const safeRegexQuery = createSafeRegexQuery(name)
        if (safeRegexQuery) {
            query.name = safeRegexQuery
        }
    }

    if (req.user && req.user.role !== 'admin') {
        if (restaurantId) {
            // Validate restaurant ownership
            const owns = await Restaurant.exists({ _id: restaurantId, userId: req.user._id })
            if (!owns) {
                throw forbidden(errorMessages.forbidden('access', 'restaurant'))
            }
            query.restaurantId = restaurantId
        } else {
            // Get all restaurants owned by the user
            const userRestaurants = await Restaurant.find({ userId: req.user._id }).select('_id')
            const userRestaurantIds = userRestaurants.map(r => r._id)
            query.restaurantId = { $in: userRestaurantIds }
        }
    } else if (restaurantId) {
        // Admin can access any restaurant
        query.restaurantId = restaurantId
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
 * @access Private
 */
const getMenuById = asyncHandler(async (req, res) => {
    const { id } = req.params

    try {
        // Menu and ownership already validated by middleware, but we need to populate menuItems
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
            throw notFound(errorMessages.notFound('Menu', id))
        }

        res.json({
            success: true,
            data: menu
        })
    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
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
        // Restaurant ownership already validated by middleware
        const restaurant = req.restaurant

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
        // Menu, restaurant and ownership already validated by middleware
        const menu = req.menu

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
            throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
        }
        logDatabaseError(error, 'UPDATE', { collection: 'menus', id, document: req.body })
        throw error
    }
})

/**
 * Delete menu with related menu items atomically
 * @route DELETE /api/menus/:id
 * @access Private
 */
const deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession()

    try {
        // Menu, restaurant and ownership already validated by middleware
        const menu = req.menu

        // Execute deletion in a transaction to ensure atomicity
        await session.withTransaction(async () => {
            try {
                // First, delete all menu items associated with this menu
                const deleteResult = await MenuItem.deleteMany({ menuId: id }, { session })
                logger.info(`Deleted ${deleteResult.deletedCount} menu items for menu ${menu.name}`)

                // Then delete the menu itself
                await Menu.findByIdAndDelete(id, { session })

                logger.warn(`Menu deleted: ${menu.name} (${deleteResult.deletedCount} menu items) by user ${req.user._id}`)

            } catch (transactionError) {
                logger.error(`Error in menu deletion transaction: ${transactionError.message}`)
                throw transactionError
            }
        }, {
            // Transaction options
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' },
            maxCommitTimeMS: 10000 // 10 seconds timeout
        })

        res.status(204).send()

    } catch (error) {
        if (error.name === 'CastError') {
            throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
        }

        logger.error(`Error deleting menu ${id}: ${error.message}`)
        logDatabaseError(error, 'DELETE', {
            collection: 'menus',
            id,
            operation: 'transactional_delete_with_items'
        })

        // Re-throw with more context for transaction failures
        if (error.name === 'MongoTransactionError' || error.name === 'MongoServerError') {
            throw new Error(`Failed to delete menu and associated items: ${error.message}`)
        }

        throw error
    } finally {
        // Always end the session
        await session.endSession()
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
        // Menu, restaurant and ownership already validated by middleware
        const menu = req.menu

        // Check if file was uploaded
        if (!req.file) {
            throw badRequest(errorMessages.common.imageUploadRequired)
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
            throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
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
        // Menu, restaurant and ownership already validated by middleware
        const menu = req.menu
        const restaurant = req.restaurant

        if (!restaurant.userId) {
            throw badRequest(`Restaurant with id ${menu.restaurantId} has no associated user`)
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