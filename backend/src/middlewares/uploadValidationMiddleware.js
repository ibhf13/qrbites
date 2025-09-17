const { validateRequest } = require('./validationMiddleware')
const {
    uploadMiddleware,
    uploadMultipleMiddleware,
    cleanupUploadedFiles,
    isCloudinaryConfigured
} = require('@services/fileUploadService')
const logger = require('@utils/logger')

/**
 * Enhanced middleware that combines validation with Cloudinary file upload
 * @param {Object} schema - Joi validation schema
 * @param {string} type - Type of entity (restaurant, menu, menuItem, profile)
 * @param {string} fieldName - Name of the file field
 * @param {boolean} required - Whether file is required
 * @param {string} imageType - Specific image type for Cloudinary optimization
 * @returns {Array} Array of middleware functions
 */
const validateAndUpload = (schema, type, fieldName = 'image', required = false, imageType = 'image') => {
    return [
        // Check if Cloudinary is configured
        (req, res, next) => {
            if (!isCloudinaryConfigured) {
                logger.error('Cloudinary not configured for file uploads')
                return res.status(500).json({
                    success: false,
                    error: 'File upload service not available. Please contact administrator.'
                })
            }
            next()
        },

        // Handle file upload to Cloudinary
        ...uploadMiddleware(fieldName, imageType),

        // Validate request data (including file validation)
        (req, res, next) => {
            // Add uploaded file info to req.body for validation
            if (req.uploadedFile) {
                req.body[fieldName] = req.uploadedFile.url
                req.body[`${fieldName}PublicId`] = req.uploadedFile.publicId

                // Store file metadata for potential use
                req.fileMetadata = {
                    publicId: req.uploadedFile.publicId,
                    url: req.uploadedFile.url,
                    originalname: req.uploadedFile.originalname,
                    size: req.uploadedFile.size,
                    format: req.uploadedFile.format,
                    width: req.uploadedFile.width,
                    height: req.uploadedFile.height
                }
            } else if (required) {
                return res.status(400).json({
                    success: false,
                    error: `${fieldName} is required`
                })
            }

            next()
        },

        // Apply Joi validation
        validateRequest(schema),

        // Additional file-specific validation
        (req, res, next) => {
            if (req.uploadedFile) {
                // Validate image dimensions if needed
                const { width, height } = req.uploadedFile

                // Restaurant logo validation
                if (type === 'restaurant' && imageType === 'logo') {
                    if (width < 100 || height < 100) {
                        // Cleanup uploaded file
                        cleanupUploadedFiles(req.uploadedFile)
                        return res.status(400).json({
                            success: false,
                            error: 'Logo must be at least 100x100 pixels'
                        })
                    }
                }

                // Menu item image validation
                if (type === 'menuItem') {
                    if (width < 200 || height < 150) {
                        cleanupUploadedFiles(req.uploadedFile)
                        return res.status(400).json({
                            success: false,
                            error: 'Menu item image must be at least 200x150 pixels'
                        })
                    }
                }

                // Profile avatar validation
                if (type === 'profile' && imageType === 'avatar') {
                    if (width < 150 || height < 150) {
                        cleanupUploadedFiles(req.uploadedFile)
                        return res.status(400).json({
                            success: false,
                            error: 'Profile avatar must be at least 150x150 pixels'
                        })
                    }
                }

                logger.info(`File uploaded successfully: ${req.uploadedFile.publicId} (${width}x${height})`)
            }

            next()
        }
    ]
}

/**
 * Middleware for multiple file uploads with validation
 * @param {Object} schema - Joi validation schema
 * @param {string} type - Type of entity
 * @param {string} fieldName - Name of the file field
 * @param {number} maxCount - Maximum number of files
 * @param {boolean} required - Whether files are required
 * @param {string} imageType - Specific image type for Cloudinary optimization
 * @returns {Array} Array of middleware functions
 */
const validateAndUploadMultiple = (schema, type, fieldName = 'images', maxCount = 5, required = false, imageType = 'image') => {
    return [
        // Check if Cloudinary is configured
        (req, res, next) => {
            if (!isCloudinaryConfigured) {
                logger.error('Cloudinary not configured for file uploads')
                return res.status(500).json({
                    success: false,
                    error: 'File upload service not available. Please contact administrator.'
                })
            }
            next()
        },

        // Handle multiple file uploads to Cloudinary
        ...uploadMultipleMiddleware(fieldName, maxCount, imageType),

        // Process uploaded files
        (req, res, next) => {
            if (req.uploadedFiles && req.uploadedFiles.length > 0) {
                // Add file URLs to req.body for validation
                req.body[fieldName] = req.uploadedFiles.map(file => file.url)
                req.body[`${fieldName}PublicIds`] = req.uploadedFiles.map(file => file.publicId)

                // Store file metadata
                req.filesMetadata = req.uploadedFiles.map(file => ({
                    publicId: file.publicId,
                    url: file.url,
                    originalname: file.originalname,
                    size: file.size,
                    format: file.format,
                    width: file.width,
                    height: file.height
                }))

                logger.info(`${req.uploadedFiles.length} files uploaded successfully`)
            } else if (required) {
                return res.status(400).json({
                    success: false,
                    error: `At least one ${fieldName.slice(0, -1)} is required`
                })
            }

            next()
        },

        // Apply Joi validation
        validateRequest(schema)
    ]
}

/**
 * Middleware for handling file updates (replacing existing files)
 * @param {Object} schema - Joi validation schema
 * @param {string} type - Type of entity
 * @param {string} fieldName - Name of the file field
 * @param {string} imageType - Specific image type for Cloudinary optimization
 * @returns {Array} Array of middleware functions
 */
const validateAndUpdateFile = (schema, type, fieldName = 'image', imageType = 'image') => {
    return [
        // Check if Cloudinary is configured
        (req, res, next) => {
            if (!isCloudinaryConfigured) {
                logger.error('Cloudinary not configured for file uploads')
                return res.status(500).json({
                    success: false,
                    error: 'File upload service not available. Please contact administrator.'
                })
            }
            next()
        },

        // Handle optional file upload
        ...uploadMiddleware(fieldName, imageType),

        // Process uploaded file (if any)
        (req, res, next) => {
            if (req.uploadedFile) {
                req.body[fieldName] = req.uploadedFile.url
                req.body[`${fieldName}PublicId`] = req.uploadedFile.publicId

                req.fileMetadata = {
                    publicId: req.uploadedFile.publicId,
                    url: req.uploadedFile.url,
                    originalname: req.uploadedFile.originalname,
                    size: req.uploadedFile.size,
                    format: req.uploadedFile.format,
                    width: req.uploadedFile.width,
                    height: req.uploadedFile.height
                }

                // Mark that we have a new file to replace the old one
                req.hasNewFile = true
            }

            next()
        },

        // Apply Joi validation
        validateRequest(schema)
    ]
}

/**
 * Error cleanup middleware - handles cleanup if validation fails after upload
 */
const cleanupOnError = (err, req, res, next) => {
    if (err) {
        // Cleanup uploaded files if validation or processing failed
        const cleanupTasks = []

        if (req.uploadedFile) {
            cleanupTasks.push(cleanupUploadedFiles(req.uploadedFile))
        }

        if (req.uploadedFiles && req.uploadedFiles.length > 0) {
            cleanupTasks.push(cleanupUploadedFiles(req.uploadedFiles))
        }

        if (cleanupTasks.length > 0) {
            Promise.all(cleanupTasks).catch(cleanupErr => {
                logger.error('Error cleaning up uploaded files:', cleanupErr)
            })
        }
    }

    next(err)
}

/**
 * Middleware to validate file upload without processing
 * Useful for endpoints that only accept files
 */
const fileOnlyUpload = (fieldName = 'image', imageType = 'image') => {
    return [
        (req, res, next) => {
            if (!isCloudinaryConfigured) {
                return res.status(500).json({
                    success: false,
                    error: 'File upload service not available'
                })
            }
            next()
        },

        ...uploadMiddleware(fieldName, imageType),

        (req, res, next) => {
            if (!req.uploadedFile) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                })
            }

            next()
        }
    ]
}

/**
 * Middleware to handle QR code image uploads
 */
const qrCodeUpload = () => {
    return [
        (req, res, next) => {
            if (!isCloudinaryConfigured) {
                return res.status(500).json({
                    success: false,
                    error: 'File upload service not available'
                })
            }
            next()
        },

        ...uploadMiddleware('qrcode', 'qrcode'),

        (req, res, next) => {
            if (req.uploadedFile) {
                // QR codes should be square and at least 256x256
                const { width, height } = req.uploadedFile

                if (width < 256 || height < 256) {
                    cleanupUploadedFiles(req.uploadedFile)
                    return res.status(400).json({
                        success: false,
                        error: 'QR code image must be at least 256x256 pixels'
                    })
                }

                if (Math.abs(width - height) > 10) {
                    cleanupUploadedFiles(req.uploadedFile)
                    return res.status(400).json({
                        success: false,
                        error: 'QR code image should be square (width ≈ height)'
                    })
                }
            }

            next()
        }
    ]
}

module.exports = {
    validateAndUpload,
    validateAndUploadMultiple,
    validateAndUpdateFile,
    fileOnlyUpload,
    qrCodeUpload,
    cleanupOnError
}