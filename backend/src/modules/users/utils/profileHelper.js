/**
 * Profile Helper Utilities
 * Helper functions for normalizing OAuth provider profiles
 */

/**
 * Extract email from Google profile
 * @param {Object} profile - Google profile object
 * @returns {String|null} Email address or null
 */
const getProfileEmail = profile => {
  return profile.emails?.[0]?.value || null
}

/**
 * Extract photo URL from Google profile
 * @param {Object} profile - Google profile object
 * @returns {String|null} Photo URL or null
 */
const getProfilePhoto = profile => {
  return profile.photos?.[0]?.value || null
}

/**
 * Normalize Google OAuth profile to our standard format
 * @param {Object} profile - Raw Google profile object
 * @returns {Object} Normalized profile
 * @throws {Error} If email is not available
 */
const normalizeGoogleProfile = profile => {
  const email = getProfileEmail(profile)

  if (!email) {
    throw new Error('Email is required from Google')
  }

  return {
    id: profile.id,
    email,
    displayName: profile.displayName,
    picture: getProfilePhoto(profile),
  }
}

module.exports = {
  normalizeGoogleProfile,
  getProfileEmail,
  getProfilePhoto,
}
