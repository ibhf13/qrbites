const QRCode = require('qrcode')
const { uploadBase64, deleteImage, generateUrl } = require('./cloudinaryService')
const logger = require('@utils/logger')

/**
 * QR Code generation options with enhanced customization
 */
const defaultQROptions = {
    type: 'png',
    quality: 0.92,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    width: 512,
    errorCorrectionLevel: 'M'
}

/**
 * Generate QR code and upload to Cloudinary
 * @param {string} data - Data to encode in QR code
 * @param {Object} options - QR code generation options
 * @param {Object} uploadOptions - Cloudinary upload options
 * @returns {Object} QR code information with Cloudinary URL
 */
const generateAndUploadQRCode = async (data, options = {}, uploadOptions = {}) => {
    try {
        // Validate input data
        if (!data || typeof data !== 'string') {
            throw new Error('QR code data is required and must be a string')
        }

        // Merge options with defaults
        const qrOptions = { ...defaultQROptions, ...options }

        // Generate QR code as base64 data URL
        const qrCodeDataUrl = await QRCode.toDataURL(data, qrOptions)

        logger.info(`Generated QR code for data: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`)

        // Extract restaurant ID or other identifier for naming
        const identifier = extractIdentifier(data)
        const publicId = `qr_${identifier}_${Date.now()}`

        // Upload to Cloudinary
        const cloudinaryResult = await uploadBase64(qrCodeDataUrl, {
            folder: 'qrbites/qrcodes',
            publicId,
            tags: ['qrbites', 'qrcode', identifier ? `restaurant_${identifier}` : 'general'],
            ...uploadOptions
        })

        logger.info(`QR code uploaded to Cloudinary: ${cloudinaryResult.publicId}`)

        return {
            publicId: cloudinaryResult.publicId,
            url: cloudinaryResult.url,
            data: data,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            bytes: cloudinaryResult.bytes,
            options: qrOptions
        }

    } catch (error) {
        logger.error('Error generating and uploading QR code:', error)
        throw new Error(`Failed to generate QR code: ${error.message}`)
    }
}

/**
 * Generate QR code for restaurant
 * @param {Object} restaurant - Restaurant object
 * @param {Object} options - Generation options
 * @returns {Object} QR code information
 */
const generateRestaurantQRCode = async (restaurant, options = {}) => {
    try {
        if (!restaurant || !restaurant._id) {
            throw new Error('Valid restaurant object with _id is required')
        }

        // Build restaurant URL
        const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000'
        const restaurantUrl = `${baseUrl}/restaurants/${restaurant._id}`

        // Enhanced QR options for restaurant
        const qrOptions = {
            ...defaultQROptions,
            width: 600,
            margin: 3,
            errorCorrectionLevel: 'H', // Higher error correction for better scanning
            color: {
                dark: restaurant.primaryColor || '#000000',
                light: restaurant.backgroundColor || '#FFFFFF'
            },
            ...options
        }

        const uploadOptions = {
            tags: ['restaurant', 'menu', restaurant._id.toString(), restaurant.slug || 'restaurant'],
        }

        const qrResult = await generateAndUploadQRCode(restaurantUrl, qrOptions, uploadOptions)

        logger.info(`Restaurant QR code generated for: ${restaurant.name} (${restaurant._id})`)

        return {
            ...qrResult,
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            targetUrl: restaurantUrl
        }

    } catch (error) {
        logger.error('Error generating restaurant QR code:', error)
        throw error
    }
}

/**
 * Generate QR code for specific menu
 * @param {Object} menu - Menu object
 * @param {Object} restaurant - Restaurant object
 * @param {Object} options - Generation options
 * @returns {Object} QR code information
 */
const generateMenuQRCode = async (menu, restaurant, options = {}) => {
    try {
        if (!menu || !menu._id) {
            throw new Error('Valid menu object with _id is required')
        }

        if (!restaurant || !restaurant._id) {
            throw new Error('Valid restaurant object is required')
        }

        // Build menu URL
        const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000'
        const menuUrl = `${baseUrl}/restaurants/${restaurant._id}/menus/${menu._id}`

        const qrOptions = {
            ...defaultQROptions,
            width: 512,
            margin: 2,
            ...options
        }

        const uploadOptions = {
            tags: ['menu', 'restaurant', restaurant._id.toString(), menu._id.toString()],
        }

        const qrResult = await generateAndUploadQRCode(menuUrl, qrOptions, uploadOptions)

        logger.info(`Menu QR code generated for: ${menu.name} at ${restaurant.name}`)

        return {
            ...qrResult,
            menuId: menu._id,
            menuName: menu.name,
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            targetUrl: menuUrl
        }

    } catch (error) {
        logger.error('Error generating menu QR code:', error)
        throw error
    }
}

/**
 * Generate custom QR code with branding
 * @param {string} data - Data to encode
 * @param {Object} branding - Branding options
 * @param {Object} options - Additional options
 * @returns {Object} QR code information
 */
const generateBrandedQRCode = async (data, branding = {}, options = {}) => {
    try {
        const {
            primaryColor = '#000000',
            backgroundColor = '#FFFFFF',
            logo = null, // Future: support for logo embedding
            margin = 3,
            size = 512
        } = branding

        const qrOptions = {
            ...defaultQROptions,
            width: size,
            margin,
            color: {
                dark: primaryColor,
                light: backgroundColor
            },
            errorCorrectionLevel: 'H', // Higher correction for branded QR codes
            ...options
        }

        const uploadOptions = {
            tags: ['branded', 'custom'],
        }

        return await generateAndUploadQRCode(data, qrOptions, uploadOptions)

    } catch (error) {
        logger.error('Error generating branded QR code:', error)
        throw error
    }
}

/**
 * Regenerate QR code (useful for updating existing QR codes)
 * @param {string} oldPublicId - Public ID of old QR code to replace
 * @param {string} data - New data to encode
 * @param {Object} options - Generation options
 * @returns {Object} New QR code information
 */
const regenerateQRCode = async (oldPublicId, data, options = {}) => {
    try {
        // Generate new QR code
        const newQRCode = await generateAndUploadQRCode(data, options)

        // Delete old QR code from Cloudinary
        if (oldPublicId) {
            const deleteResult = await deleteImage(oldPublicId)
            if (deleteResult) {
                logger.info(`Old QR code deleted: ${oldPublicId}`)
            } else {
                logger.warn(`Failed to delete old QR code: ${oldPublicId}`)
            }
        }

        return newQRCode

    } catch (error) {
        logger.error('Error regenerating QR code:', error)
        throw error
    }
}

/**
 * Get different sizes of QR code
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Different sizes of the QR code
 */
const getQRCodeSizes = (publicId) => {
    if (!publicId) return null

    return {
        small: generateUrl(publicId, { width: 256, height: 256, crop: 'fit' }),
        medium: generateUrl(publicId, { width: 512, height: 512, crop: 'fit' }),
        large: generateUrl(publicId, { width: 1024, height: 1024, crop: 'fit' }),
        print: generateUrl(publicId, { width: 2048, height: 2048, crop: 'fit', quality: 'auto:best' }),
        original: generateUrl(publicId)
    }
}

/**
 * Delete QR code from Cloudinary
 * @param {string} publicId - Public ID of QR code to delete
 * @returns {boolean} Success status
 */
const deleteQRCode = async (publicId) => {
    try {
        if (!publicId) return false

        const result = await deleteImage(publicId)

        if (result) {
            logger.info(`QR code deleted successfully: ${publicId}`)
        } else {
            logger.warn(`Failed to delete QR code: ${publicId}`)
        }

        return result

    } catch (error) {
        logger.error('Error deleting QR code:', error)
        return false
    }
}

/**
 * Batch generate QR codes
 * @param {Array} dataArray - Array of data objects to generate QR codes for
 * @param {Object} commonOptions - Common options for all QR codes
 * @returns {Array} Array of QR code results
 */
const batchGenerateQRCodes = async (dataArray, commonOptions = {}) => {
    try {
        const results = await Promise.allSettled(
            dataArray.map(async (dataItem, index) => {
                const { data, options = {} } = typeof dataItem === 'string'
                    ? { data: dataItem, options: {} }
                    : dataItem

                const mergedOptions = { ...commonOptions, ...options }
                return await generateAndUploadQRCode(data, mergedOptions)
            })
        )

        const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value)
        const failed = results.filter(r => r.status === 'rejected').map(r => r.reason)

        if (failed.length > 0) {
            logger.warn(`Batch QR generation: ${successful.length} successful, ${failed.length} failed`)
        } else {
            logger.info(`Batch QR generation: ${successful.length} QR codes generated successfully`)
        }

        return {
            successful,
            failed,
            total: dataArray.length
        }

    } catch (error) {
        logger.error('Error in batch QR code generation:', error)
        throw error
    }
}

/**
 * Extract identifier from data for naming purposes
 * @param {string} data - QR code data
 * @returns {string|null} Extracted identifier
 */
const extractIdentifier = (data) => {
    try {
        // Extract restaurant ID from URL
        const urlMatch = data.match(/\/restaurants\/([a-fA-F0-9]{24})/)
        if (urlMatch) return urlMatch[1]

        // Extract menu ID from URL
        const menuMatch = data.match(/\/menus\/([a-fA-F0-9]{24})/)
        if (menuMatch) return `menu_${menuMatch[1]}`

        // For other data, create a simple hash-based identifier
        let hash = 0
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16)
    } catch (error) {
        return null
    }
}

/**
 * Validate QR code data
 * @param {string} data - Data to validate
 * @returns {Object} Validation result
 */
const validateQRCodeData = (data) => {
    if (!data || typeof data !== 'string') {
        return { valid: false, error: 'QR code data must be a non-empty string' }
    }

    if (data.length > 2000) {
        return { valid: false, error: 'QR code data is too long (max 2000 characters)' }
    }

    // Check for valid URL format if it looks like a URL
    if (data.startsWith('http')) {
        try {
            new URL(data)
        } catch (error) {
            return { valid: false, error: 'Invalid URL format' }
        }
    }

    return { valid: true }
}

module.exports = {
    // Core functions
    generateAndUploadQRCode,
    generateRestaurantQRCode,
    generateMenuQRCode,
    generateBrandedQRCode,
    regenerateQRCode,
    deleteQRCode,

    // Utilities
    getQRCodeSizes,
    batchGenerateQRCodes,
    validateQRCodeData,

    // Configuration
    defaultQROptions
}