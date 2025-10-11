const User = require('@modules/users/models/user')
const { asyncHandler, badRequest, notFound, forbidden, errorMessages } = require('@errors')
const logger = require('@commonUtils/logger')
const { paginate, buildQueryFilters } = require('@commonUtils/paginationUtils')

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  // Build query filters
  const query = buildQueryFilters(req.query, {
    exactMatch: ['role'],
    searchFields: ['email', 'name'],
    customFilters: {
      isActive: value => (value === 'true' ? true : value === 'false' ? false : null),
    },
    allowedSortFields: ['name', 'email', 'role', 'createdAt', 'updatedAt'],
  })

  // Execute paginated query
  const result = await paginate(User, query, {
    pagination: {
      page: req.query.page,
      limit: req.query.limit,
    },
    sort: {
      sortBy: req.query.sortBy,
      order: req.query.order,
      defaultSortBy: 'createdAt',
      defaultOrder: 'desc',
      allowedSortFields: ['name', 'email', 'role', 'createdAt', 'updatedAt'],
    },
    select: '-password',
  })

  logger.info(`Admin ${req.user._id} retrieved ${result.data.length} users`)

  res.json(result)
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
    data: user,
  })
})

/**
 * Update user profile
 * @route PUT /api/users/:id
 * @access Private (Own profile or Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, role, isActive } = req.body

  const email = req.body.email?.toLowerCase().trim()

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

  // Prepare update data
  const updateData = {}

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: id } })
    if (emailExists) {
      throw badRequest('Email already exists')
    }
  }
  updateData.email = email

  // Handle name update
  if (name !== undefined) {
    updateData.name = name.trim()
  }

  // Handle role update (admin only)
  if (role !== undefined && req.user.role === 'admin') {
    updateData.role = role
  }

  // Handle isActive update (admin only)
  if (isActive !== undefined && req.user.role === 'admin') {
    updateData.isActive = isActive
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    select: '-password',
  })

  logger.info(`User updated: ${id} by ${req.user._id}`)

  res.json({
    success: true,
    data: updatedUser,
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
    message: 'Account deactivated successfully',
  })
})

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateAccount,
}
