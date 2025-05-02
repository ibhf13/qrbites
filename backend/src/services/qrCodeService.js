const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const logger = require('@utils/logger')
const { dirs } = require('@services/fileUploadService')

/**
 * Generate a QR code image for a given URL
 * @param {string} url - The URL to encode in the QR code
 * @param {Object} options - QR code generation options
 * @returns {Promise<string>} - The filename of the generated QR code
 */
const generateQRCode = async (url, options = {}) => {
    try {
        // Default options
        const defaultOptions = {
            errorCorrectionLevel: 'H',
            type: 'png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }

        // Merge options
        const qrOptions = { ...defaultOptions, ...options }

        // Ensure QR code directory exists
        if (!fs.existsSync(dirs.qrcode)) {
            fs.mkdirSync(dirs.qrcode, { recursive: true })
            logger.info(`Created QR code directory: ${dirs.qrcode}`)
        }

        // Generate a unique filename
        const filename = `${uuidv4()}.png`
        const filePath = path.join(dirs.qrcode, filename)

        // Generate the QR code
        await QRCode.toFile(filePath, url, qrOptions)

        logger.info(`QR code generated successfully: ${filename}`)
        return filename
    } catch (error) {
        logger.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

/**
 * Get the URL for a QR code
 * @param {string} filename - The filename of the QR code
 * @returns {string|null} - The URL of the QR code or null if filename is not provided
 */
const getQRCodeUrl = (filename) => {
    if (!filename) return null

    // Create URL that can be used in the frontend
    const baseUrl = process.env.BASE_URL || process.env.API_URL || 'http://localhost:5000'
    return `${baseUrl}/uploads/qrcodes/${filename}`
}

/**
 * Generate QR code for menu access
 * @param {string} menuId - The ID of the menu
 * @param {string} restaurantId - The ID of the restaurant
 * @returns {Promise<string>} - The URL of the generated QR code
 */
const generateMenuQRCode = async (menuId, restaurantId) => {
    try {
        // The URL that the QR code will point to - Using new redirect endpoint
        const baseUrl = process.env.API_URL || 'http://localhost:5000'
        const url = `${baseUrl}/r/${menuId}?restaurant=${restaurantId}`

        // Generate the QR code
        const filename = await generateQRCode(url)

        // Return the URL to access the QR code
        return getQRCodeUrl(filename)
    } catch (error) {
        logger.error(`Error generating menu QR code for menu ${menuId}:`, error)
        throw new Error('Failed to generate menu QR code')
    }
}

module.exports = {
    generateQRCode,
    getQRCodeUrl,
    generateMenuQRCode
} 