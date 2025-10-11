const cloudinary = require('cloudinary').v2
const logger = require('@commonUtils/logger')

/**
 * Initialize Cloudinary configuration
 */
const initializeCloudinary = () => {
    try {
        const config = {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        }

        // Validate configuration
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            throw new Error('Cloudinary configuration is incomplete. Check environment variables.')
        }

        cloudinary.config(config)
        logger.success('✅ Cloudinary configured successfully')
    } catch (error) {
        logger.error('❌ Failed to configure Cloudinary:', error)
        throw error
    }
}

// Initialize on module load
initializeCloudinary()

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} publicId - Optional public ID
 * @returns {Promise<Object>}
 */
const uploadToCloudinary = (buffer, folder, publicId = null) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: `qrbites/${folder}`,
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
            timeout: 60000,
        }

        if (publicId) {
            uploadOptions.public_id = publicId
            uploadOptions.overwrite = true
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    logger.error('Cloudinary upload failed:', error.message)
                    reject(error)
                } else {
                    logger.info(`✅ Uploaded to Cloudinary: ${result.secure_url}`)
                    resolve(result)
                }
            }
        )

        uploadStream.end(buffer)
    })
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async publicId => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,
        })
        logger.info(`Deleted from Cloudinary: ${publicId}`)
        return result
    } catch (error) {
        logger.error('Cloudinary delete failed:', error.message)
        throw error
    }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url
 * @returns {string|null}
 */
const getPublicIdFromUrl = url => {
    if (!url || typeof url !== 'string') return null

    try {
        const regex = /\/qrbites\/([^/]+)\/([^.]+)/
        const matches = url.match(regex)
        if (matches) {
            return `qrbites/${matches[1]}/${matches[2]}`
        }
        return null
    } catch (error) {
        logger.error('Error extracting public ID:', error)
        return null
    }
}

/**
 * Check if configured
 * @returns {boolean}
 */
const isCloudinaryConfigured = () => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
}

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary,
    getPublicIdFromUrl,
    isCloudinaryConfigured,
}