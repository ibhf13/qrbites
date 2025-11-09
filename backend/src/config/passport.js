const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { findOrCreateOAuthUser } = require('@modules/users/services/oauthService')
const { normalizeGoogleProfile } = require('@modules/users/utils/profileHelper')
const logger = require('@commonUtils/logger')

const config = require('./environment')

/**
 * Configure Passport with Google OAuth2 Strategy
 */
const configurePassport = () => {
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          callbackURL: config.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userProfile = normalizeGoogleProfile(profile)
            const tokens = { accessToken, refreshToken }

            const user = await findOrCreateOAuthUser(userProfile, 'google', tokens)

            return done(null, user)
          } catch (error) {
            logger.error('OAuth error:', error)
            return done(error, null)
          }
        }
      )
    )

    logger.info('✅ Google OAuth2 strategy configured')
  } else {
    logger.warn('⚠️  Google OAuth credentials not configured. Google login will not be available.')
  }
}

module.exports = configurePassport
