const User = require('@modules/users/models/user')
const FederatedCredential = require('@modules/users/models/FederatedCredential')
const { encrypt } = require('@commonUtils/encryption')
const logger = require('@commonUtils/logger')

/**
 * Find user by federated credential
 * @param {String} provider - OAuth provider (e.g., 'google')
 * @param {String} providerId - Provider-specific user ID
 * @returns {Promise<Object|null>} User object or null
 */
const findUserByFederatedCredential = async (provider, providerId) => {
  const credential = await FederatedCredential.findOne({
    provider,
    providerId,
  }).populate('userId')

  return credential ? credential.userId : null
}

/**
 * Find existing OAuth user by provider credentials
 * @param {String} provider - OAuth provider
 * @param {String} providerId - Provider-specific user ID
 * @returns {Promise<Object|null>} User object or null
 */
const findExistingOAuthUser = async (provider, providerId) => {
  const credential = await FederatedCredential.findOne({
    provider,
    providerId,
  }).populate('userId')

  return credential?.userId || null
}

/**
 * Create new OAuth user with federated credential
 * @param {String} email - User email
 * @param {String} name - User name
 * @param {String} provider - OAuth provider
 * @param {String} providerId - Provider-specific user ID
 * @param {Object} tokens - OAuth tokens
 * @returns {Promise<Object>} Created user
 */
const createOAuthUser = async (email, name, provider, providerId, tokens) => {
  const user = await User.create({
    email,
    name,
    authProvider: provider,
    role: 'user',
    isActive: true,
  })

  await FederatedCredential.create({
    userId: user._id,
    provider,
    providerId,
    email,
    displayName: name,
    accessToken: encrypt(tokens.accessToken),
    refreshToken: encrypt(tokens.refreshToken),
  })

  logger.info(`New ${provider} user created: ${email}`)
  return user
}

/**
 * Save OAuth credential (create or update)
 * @param {String} userId - User ID
 * @param {String} provider - OAuth provider
 * @param {String} providerId - Provider-specific user ID
 * @param {Object} data - Credential data
 * @returns {Promise<Object>} Saved credential
 */
const saveOAuthCredential = async (userId, provider, providerId, data) => {
  const credential = await FederatedCredential.findOneAndUpdate(
    { provider, providerId },
    {
      userId,
      email: data.email,
      displayName: data.displayName,
      profilePicture: data.profilePicture,
      accessToken: encrypt(data.accessToken),
      refreshToken: encrypt(data.refreshToken),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  )

  logger.info(`Saved ${provider} credential for user: ${userId}`)
  return credential
}

/**
 * Find or create OAuth user (main orchestration function)
 * Implements auto-linking: if email exists, link OAuth account to existing user
 * @param {Object} profile - OAuth profile data
 * @param {String} provider - OAuth provider name
 * @param {Object} tokens - OAuth tokens (accessToken, refreshToken)
 * @returns {Promise<Object>} User object
 */
const findOrCreateOAuthUser = async (profile, provider, tokens) => {
  const email = profile.email?.toLowerCase()

  if (!email) {
    throw new Error('Email is required from OAuth provider')
  }

  const existingOAuthUser = await findExistingOAuthUser(provider, profile.id)
  if (existingOAuthUser) {
    logger.info(`Existing ${provider} user logged in: ${email}`)
    return existingOAuthUser
  }

  const existingEmailUser = await User.findOne({ email })
  if (existingEmailUser) {
    await saveOAuthCredential(existingEmailUser._id, provider, profile.id, {
      email,
      displayName: profile.displayName,
      profilePicture: profile.picture,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    logger.info(`Linked ${provider} to existing user: ${email}`)
    return existingEmailUser
  }

  return createOAuthUser(email, profile.displayName, provider, profile.id, tokens)
}

module.exports = {
  findUserByFederatedCredential,
  findOrCreateOAuthUser,
}
