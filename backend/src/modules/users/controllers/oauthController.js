const config = require('@config/environment')
const { asyncHandler } = require('@errors')
const { generateToken } = require('@commonUtils/tokenUtils')
const logger = require('@commonUtils/logger')

/**
 * Google OAuth callback handler
 * Handles both redirect and JSON response formats
 * @route GET /api/auth/google/callback
 * @route GET /api/auth/google/callback?format=json
 * @access Public
 */
const googleCallback = asyncHandler(async (req, res) => {
  const { user } = req
  const format = req.query.format || 'redirect'

  // Handle authentication failure
  if (!user) {
    logger.error('No user found in OAuth callback')

    if (format === 'json') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
      })
    }

    return res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`)
  }

  // Generate JWT token
  const token = generateToken(user._id)
  logger.info(`Google OAuth successful for user: ${user.email}`)

  // Return JSON format (for mobile apps or API clients)
  if (format === 'json') {
    return res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        role: user.role,
        authProvider: user.authProvider,
        token,
      },
    })
  }

  res.redirect(`${config.FRONTEND_URL}/?token=${token}`)
})

module.exports = {
  googleCallback,
}
