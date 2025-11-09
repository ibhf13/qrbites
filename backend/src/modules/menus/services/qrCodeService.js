const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid')
const logger = require('@commonUtils/logger')
const { uploadToCloudinary } = require('@config/cloudinary')
const { badRequest, errorMessages, logDatabaseError } = require('@errors')

/**
 * Generate a QR code image as a buffer and upload to Cloudinary
 * @param {string} url - The URL to encode in the QR code
 * @param {Object} options - QR code generation options
 * @returns {Promise<string>} - The Cloudinary URL of the generated QR code
 */
const generateQRCode = async (url, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }

    const qrOptions = { ...defaultOptions, ...options }

    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(url, qrOptions)
    logger.debug(`QR code buffer generated for URL: ${url}`)

    // Generate unique filename
    const filename = `${uuidv4()}.png`

    // Upload to Cloudinary
    const result = await uploadToCloudinary(qrBuffer, 'qrcodes', filename)
    logger.info(`QR code uploaded to Cloudinary: ${result.secure_url}`)

    return result.secure_url
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('QR code'))
    }
    logDatabaseError(error, 'CREATE', { operation: 'generate_qr_code', url })
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Get the URL for a QR code (for backward compatibility)
 * @param {string} urlOrFilename - The URL or filename of the QR code
 * @returns {string|null} - The URL of the QR code or null if not provided
 */
const getQRCodeUrl = urlOrFilename => {
  // If it's already a full URL (from Cloudinary), return as-is
  if (
    urlOrFilename &&
    (urlOrFilename.startsWith('http://') || urlOrFilename.startsWith('https://'))
  ) {
    return urlOrFilename
  }

  // For backward compatibility with old local storage format
  if (urlOrFilename) {
    const baseUrl = process.env.BASE_URL || process.env.API_URL || 'http://localhost:5000'
    return `${baseUrl}/uploads/qrcodes/${urlOrFilename}`
  }

  return null
}

/**
 * Generate QR code for menu access
 * @param {string} menuId - The ID of the menu
 * @param {string} restaurantId - The ID of the restaurant
 * @returns {Promise<string>} - The Cloudinary URL of the generated QR code
 */
const generateMenuQRCode = async (menuId, restaurantId) => {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:5000'
    const url = `${baseUrl}/r/${menuId}?restaurant=${restaurantId}`

    // generateQRCode now returns Cloudinary URL directly
    const qrCodeUrl = await generateQRCode(url)

    return qrCodeUrl
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Menu'))
    }
    logDatabaseError(error, 'CREATE', { operation: 'generate_menu_qr_code', menuId, restaurantId })
    throw new Error('Failed to generate menu QR code')
  }
}

module.exports = {
  generateQRCode,
  getQRCodeUrl,
  generateMenuQRCode,
}
