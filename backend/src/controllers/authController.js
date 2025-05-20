const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('@models/user')
const {
  asyncHandler,
  badRequest,
  unauthorized,
  notFound
} = require('@utils/errorUtils')
const logger = require('@utils/logger')

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    throw badRequest('User already exists')
  }

  // Create user
  const user = await User.create({
    email,
    password
  })

  // Generate token
  const token = generateToken(user._id)

  logger.info(`New user registered: ${email}`)

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
      role: user.role,
      token
    }
  })
})

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email })

  if (!user) {
    throw unauthorized('Invalid credentials')
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    throw unauthorized('Invalid credentials')
  }

  // Check if user is active
  if (!user.isActive) {
    throw unauthorized('Account is disabled')
  }

  // Generate token
  const token = generateToken(user._id)

  logger.info(`User logged in: ${email}`)

  res.json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
      role: user.role,
      token
    }
  })
})

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is already set by auth middleware
  // Populate with profile data
  const userWithProfile = await User.findById(req.user._id)
    .select('-password')
    .populate('profile')

  res.json({
    success: true,
    data: userWithProfile
  })
})

/**
 * Change password
 * @route PUT /api/auth/password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  // Get user with password
  const user = await User.findById(req.user._id)

  if (!user) {
    throw notFound('User not found')
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword)

  if (!isMatch) {
    throw badRequest('Current password is incorrect')
  }

  // Update password
  user.password = newPassword
  await user.save()

  logger.info(`Password changed for user: ${user.email}`)

  res.json({
    success: true,
    message: 'Password updated successfully'
  })
})

module.exports = {
  register,
  login,
  getMe,
  changePassword
} 