const {
    memoryUpload,
    processUploadedFiles,
    cleanupUploadedFiles,
    deleteImage,
    generateUrl,
    extractPublicId,
    isCloudinaryConfigured
} = require('./cloudinaryService')
const logger = require('@utils/logger')

// Main upload instance - now uses Cloudinary
const upload = memoryUpload

// Error handler for multer errors - enhanced for Cloudinary
const multerErrorHandler = (err, req, res, next) => {
    if (!err) {
        return next()
    }

    logger.error('File upload error:', err)

    // Cleanup any uploaded files if there was an error
    if (req.uploadResults) {
        cleanupUploadedFiles(req.uploadResults).catch(cleanupErr => {
            logger.error('Error cleaning up uploaded files:', cleanupErr)
        })
    }

    let statusCode = 400
    let message = 'File upload error'

    if (err.code === 'LIMIT_FILE_SIZE') {
        message = `File size too large. Maximum allowed size is ${(err.limit / (1024 * 1024)).toFixed(1)}MB`
    } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = `Too many files. Maximum allowed is ${err.limit} files`
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field'
    } else if (err.code === 'INVALID_FILE_TYPE') {
        message = err.message || 'Invalid file type'
    } else if (err.message) {
        message = err.message
    }

    const error = new Error(message)
    error.statusCode = statusCode
    next(error)
}

// Enhanced file processing with Cloudinary integration
const processFiles = async (req, imageType = 'image') => {
    try {
        if (!isCloudinaryConfigured) {
            throw new Error('Cloud storage not configured. Please set up Cloudinary credentials.')
        }

        const uploadResults = await processUploadedFiles(req, imageType)

        if (uploadResults) {
            // Store results in request for potential cleanup
            req.uploadResults = uploadResults

            // Add convenience methods
            req.getFileUrl = (publicId, options) => generateUrl(publicId, options)
            req.deleteFile = (publicId) => deleteImage(publicId)
        }

        return uploadResults
    } catch (error) {
        logger.error('Error processing uploaded files:', error)

        // Cleanup any partial uploads
        if (req.uploadResults) {
            await cleanupUploadedFiles(req.uploadResults)
        }

        throw error
    }
}

// Get file URL - now uses Cloudinary URLs
const getFileUrl = (publicIdOrUrl, type = null, options = {}) => {
    if (!publicIdOrUrl) return null

    // If it's already a full URL, return as is
    if (publicIdOrUrl.startsWith('http')) {
        return publicIdOrUrl
    }

    // Generate Cloudinary URL with optimizations
    return generateUrl(publicIdOrUrl, {
        quality: 'auto:good',
        fetch_format: 'auto',
        ...options
    })
}

// Delete file - now uses Cloudinary
const deleteFile = async (publicIdOrUrl) => {
    if (!publicIdOrUrl) return false

    let publicId = publicIdOrUrl

    // Extract public ID if a full URL was provided
    if (publicIdOrUrl.startsWith('http')) {
        publicId = extractPublicId(publicIdOrUrl)
    }

    if (!publicId) return false

    return await deleteImage(publicId)
}

// Middleware to handle file uploads and processing
const uploadMiddleware = (fieldName, imageType = 'image') => {
    return [
        upload.single(fieldName),
        async (req, res, next) => {
            try {
                if (req.file) {
                    const result = await processFiles(req, imageType)
                    req.uploadedFile = result
                }
                next()
            } catch (error) {
                multerErrorHandler(error, req, res, next)
            }
        }
    ]
}

// Middleware for multiple file uploads
const uploadMultipleMiddleware = (fieldName, maxCount = 5, imageType = 'image') => {
    return [
        upload.array(fieldName, maxCount),
        async (req, res, next) => {
            try {
                if (req.files && req.files.length > 0) {
                    const results = await processFiles(req, imageType)
                    req.uploadedFiles = results
                }
                next()
            } catch (error) {
                multerErrorHandler(error, req, res, next)
            }
        }
    ]
}

// Middleware for fields with multiple files
const uploadFieldsMiddleware = (fields, imageType = 'image') => {
    return [
        upload.fields(fields),
        async (req, res, next) => {
            try {
                if (req.files && Object.keys(req.files).length > 0) {
                    const results = await processFiles(req, imageType)
                    req.uploadedFiles = results
                }
                next()
            } catch (error) {
                multerErrorHandler(error, req, res, next)
            }
        }
    ]
}

// Enhanced image URL generation with responsive options
const getResponsiveImageUrls = (publicId, sizes = {}) => {
    if (!publicId) return null

    const defaultSizes = {
        thumbnail: { width: 200, height: 150 },
        small: { width: 400, height: 300 },
        medium: { width: 800, height: 600 },
        large: { width: 1200, height: 900 },
        original: {}
    }

    const imageSizes = { ...defaultSizes, ...sizes }
    const urls = {}

    Object.entries(imageSizes).forEach(([size, options]) => {
        urls[size] = generateUrl(publicId, {
            ...options,
            quality: 'auto:good',
            fetch_format: 'auto'
        })
    })

    return urls
}

// Utility to handle old local file URLs during migration
const migrateLocalUrl = (localUrl) => {
    if (!localUrl || localUrl.startsWith('http')) {
        return localUrl
    }

    // Handle old local URLs during transition period
    // This can be removed after full migration to Cloudinary
    logger.warn(`Legacy local file URL detected: ${localUrl}`)
    return localUrl
}

// File validation helper
const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
    if (!file || !file.mimetype) {
        return { valid: false, error: 'No file provided' }
    }

    if (!allowedTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        }
    }

    return { valid: true }
}

// Get optimized image URL for specific use cases
const getOptimizedImageUrl = (publicId, useCase = 'general') => {
    if (!publicId) return null

    const optimizations = {
        avatar: { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        thumbnail: { width: 200, height: 150, crop: 'fill' },
        banner: { width: 1200, height: 400, crop: 'fill' },
        product: { width: 600, height: 400, crop: 'fill' },
        gallery: { width: 800, height: 600, crop: 'fill' },
        general: { quality: 'auto:good' }
    }

    return generateUrl(publicId, {
        ...optimizations[useCase] || optimizations.general,
        fetch_format: 'auto'
    })
}

module.exports = {
    // Main upload instance
    upload,

    // Processing functions
    processFiles,
    deleteFile,
    getFileUrl,

    // Enhanced middleware
    uploadMiddleware,
    uploadMultipleMiddleware,
    uploadFieldsMiddleware,

    // Error handling
    multerErrorHandler,
    cleanupUploadedFiles,

    // URL generation
    getResponsiveImageUrls,
    getOptimizedImageUrl,

    // Utilities
    validateFileType,
    migrateLocalUrl,
    extractPublicId,

    // Configuration check
    isCloudinaryConfigured
}