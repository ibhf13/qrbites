const crypto = require('crypto')

const config = require('@config/environment')

const ALGORITHM = 'aes-256-gcm'

// Generate encryption key from JWT secret
const getEncryptionKey = () => {
  return crypto.createHash('sha256').update(config.JWT_SECRET).digest()
}

/**
 * Encrypt sensitive data
 * @param {String} text - Text to encrypt
 * @returns {String|null} Encrypted text with IV and auth tag, or null if input is empty
 */
const encrypt = text => {
  if (!text) return null

  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

/**
 * Decrypt sensitive data
 * @param {String} text - Encrypted text with IV and auth tag
 * @returns {String|null} Decrypted text, or null if input is empty
 */
const decrypt = text => {
  if (!text) return null

  try {
    const [ivHex, authTagHex, encrypted] = text.split(':')

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

module.exports = {
  encrypt,
  decrypt,
}
