const User = require('@models/user')
const {
    asyncHandler,
    badRequest,
    unauthorized,
    notFound,
    forbidden,
    errorMessages
} = require('@utils/errorUtils')
const logger = require('@utils/logger')
const { createSafeSearchQuery } = require('@utils/sanitization')

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query filters
    const query = {}

    if (req.query.role) {
        query.role = req.query.role
    }

    if (req.query.isActive !== undefined) {
        query.isActive = req.query.isActive === 'true'
    }

    if (req.query.search) {
        const safeSearchQueries = createSafeSearchQuery(req.query.search, ['email'])
        if (safeSearchQueries.length > 0) {
            query.$or = safeSearchQueries
        }
    }

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    const total = await User.countDocuments(query)

    logger.info(`Admin ${req.user._id} retrieved ${users.length} users`)

    res.json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    })
})

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Own profile or Admin)
 */
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Check if user is accessing their own profile or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
        throw forbidden('Not authorized to access this user profile')
    }

    const user = await User.findById(id).select('-password')

    if (!user) {
        throw notFound(errorMessages.notFound('User', id))
    }

    logger.info(`User profile accessed: ${id} by ${req.user._id}`)

    res.json({
        success: true,
        data: user
    })
})

/**
 * Update user profile
 * @route PUT /api/users/:id
 * @access Private (Own profile or Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { email, role, isActive } = req.body

    // Check if user is updating their own profile or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
        throw forbidden('Not authorized to update this user profile')
    }

    // Non-admin users cannot update certain fields
    if (req.user.role !== 'admin') {
        if (role !== undefined || isActive !== undefined) {
            throw forbidden('Not authorized to update role or account status')
        }
    }

    const user = await User.findById(id)

    if (!user) {
        throw notFound(errorMessages.notFound('User', id))
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: id } })
        if (emailExists) {
            throw badRequest('Email already exists')
        }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        id,
        req.body,
        {
            new: true,
            runValidators: true,
            select: '-password'
        }
    )

    logger.info(`User updated: ${id} by ${req.user._id}`)

    res.json({
        success: true,
        data: updatedUser
    })
})

/**
 * Delete user account
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Only admin can delete users
    if (req.user.role !== 'admin') {
        throw forbidden('Not authorized to delete user accounts')
    }

    // Prevent admin from deleting their own account
    if (req.user._id.toString() === id) {
        throw badRequest('Cannot delete your own admin account')
    }

    const user = await User.findById(id)

    if (!user) {
        throw notFound(errorMessages.notFound('User', id))
    }

    await user.deleteOne()

    logger.warn(`User deleted: ${id} by admin ${req.user._id}`)

    res.status(204).send()
})

/**
 * Deactivate user account (current user)
 * @route DELETE /api/users/account
 * @access Private
 */
const deactivateAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id

    await User.findByIdAndUpdate(userId, { isActive: false })

    logger.warn(`User deactivated their account: ${userId}`)

    res.json({
        success: true,
        message: 'Account deactivated successfully'
    })
})

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    deactivateAccount
} 