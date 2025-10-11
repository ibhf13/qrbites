const jwt = require('jsonwebtoken')
const User = require('@modules/users/models/user')
const { asyncHandler, badRequest, unauthorized, notFound, errorMessages } = require('@errors')
const logger = require('@commonUtils/logger')

/**
 * Generate JWT token
 * @param {String} id - User ID
 * @returns {String} JWT token
 */
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim()
  const { password, name } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    throw badRequest('User already exists')
  }

  const user = await User.create({
    email,
    password,
    name,
  })
  const token = generateToken(user._id)
  logger.info(`New user registered: ${email}`)

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      token,
    },
  })
})

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim()
  const { password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw unauthorized('Invalid credentials')
  }

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    throw unauthorized('Invalid credentials')
  }

  if (!user.isActive) {
    throw unauthorized('Account is disabled')
  }

  const token = generateToken(user._id)

  logger.info(`User logged in: ${email}`)

  res.json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      token,
    },
  })
})

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')

  res.json({
    success: true,
    data: user,
  })
})

/**
 * Change password
 * @route PUT /api/auth/password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id)

  if (!user) {
    throw notFound(errorMessages.notFound('User'))
  }

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    throw badRequest('Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  logger.info(`Password changed for user: ${user.email}`)

  res.json({
    success: true,
    message: 'Password updated successfully',
  })
})

module.exports = {
  register,
  login,
  getMe,
  changePassword,
}
