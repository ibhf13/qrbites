const { v2: cloudinary } = require('cloudinary')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const logger = require('@utils/logger')

// Initialize Cloudinary configuration
const initCloudinary = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        logger.warn('⚠️  Cloudinary credentials missing. File uploads will not work.')
        return false
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    })

    logger.info('✅ Cloudinary configured successfully')
    return true
}

// Initialize on module load
const isCloudinaryConfigured = initCloudinary()

// Transformation presets for different image types
const transformationPresets = {
    restaurant: {
        logo: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
        banner: [
            { width: 1200, height: 400, crop: 'fill', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    },
    menu: {
        image: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    },
    menuItem: {
        image: [
            { width: 600, height: 400, crop: 'fill', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
        thumbnail: [
            { width: 200, height: 150, crop: 'fill', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    },
    profile: {
        avatar: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    },
    qrcode: {
        standard: [
            { width: 512, height: 512, crop: 'fit', quality: 'auto:best' },
            { fetch_format: 'png' }
        ]
    }
}

// Get folder and transformation based on request context
const getUploadConfig = (req, file, imageType = 'image') => {
    const url = req.originalUrl || req.url || ''
    let folder = 'qrbites/general'
    let transformation = [{ quality: 'auto:good' }, { fetch_format: 'auto' }]

    // Determine folder and transformations based on URL
    if (url.includes('/restaurants')) {
        folder = 'qrbites/restaurants'
        transformation = imageType === 'logo'
            ? transformationPresets.restaurant.logo
            : transformationPresets.restaurant.banner
    } else if (url.includes('/menus') && !url.includes('/menu-items')) {
        folder = 'qrbites/menus'
        transformation = transformationPresets.menu.image
    } else if (url.includes('/menu-items')) {
        folder = 'qrbites/menu-items'
        transformation = transformationPresets.menuItem.image
    } else if (url.includes('/profile')) {
        folder = 'qrbites/profiles'
        transformation = transformationPresets.profile.avatar
    } else if (url.includes('/qr')) {
        folder = 'qrbites/qrcodes'
        transformation = transformationPresets.qrcode.standard
    }

    return { folder, transformation }
}

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/gif', 'image/webp', 'image/svg+xml'
    ]

    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg)$/i

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.test(file.originalname)) {
        cb(null, true)
    } else {
        const error = new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed')
        error.code = 'INVALID_FILE_TYPE'
        cb(error, false)
    }
}

// Memory storage for processing before upload
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5 // Max 5 files per request
    },
    fileFilter
})

// Upload buffer to Cloudinary
const uploadBuffer = async (buffer, options = {}) => {
    if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary not configured')
    }

    const {
        folder = 'qrbites/general',
        transformation = [{ quality: 'auto:good' }],
        publicId = `img_${uuidv4()}`,
        resourceType = 'image',
        tags = ['qrbites']
    } = options

    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: resourceType,
                    transformation,
                    tags,
                    use_filename: true,
                    unique_filename: false,
                    overwrite: false
                },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error)
                        reject(error)
                    } else {
                        logger.info(`Image uploaded successfully: ${result.public_id}`)
                        resolve(result)
                    }
                }
            ).end(buffer)
        })

        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            version: result.version
        }
    } catch (error) {
        logger.error('Error uploading to Cloudinary:', error)
        throw error
    }
}

// Upload base64 data (for QR codes)
const uploadBase64 = async (base64Data, options = {}) => {
    if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary not configured')
    }

    const {
        folder = 'qrbites/qrcodes',
        publicId = `qr_${uuidv4()}`,
        tags = ['qrbites', 'qrcode']
    } = options

    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder,
            public_id: publicId,
            resource_type: 'image',
            transformation: transformationPresets.qrcode.standard,
            tags,
            use_filename: false,
            unique_filename: true
        })

        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        }
    } catch (error) {
        logger.error('Error uploading base64 to Cloudinary:', error)
        throw error
    }
}

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    if (!isCloudinaryConfigured || !publicId) {
        return false
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId)

        if (result.result === 'ok') {
            logger.info(`Image deleted successfully: ${publicId}`)
            return true
        } else if (result.result === 'not found') {
            logger.warn(`Image not found for deletion: ${publicId}`)
            return false
        } else {
            logger.error(`Failed to delete image: ${publicId}`, result)
            return false
        }
    } catch (error) {
        logger.error('Error deleting image from Cloudinary:', error)
        return false
    }
}

// Delete multiple images
const deleteImages = async (publicIds) => {
    if (!isCloudinaryConfigured || !Array.isArray(publicIds) || publicIds.length === 0) {
        return []
    }

    try {
        const result = await cloudinary.api.delete_resources(publicIds)

        const results = Object.entries(result.deleted).map(([publicId, status]) => ({
            publicId,
            success: status === 'deleted',
            status
        }))

        logger.info(`Bulk delete completed: ${results.filter(r => r.success).length}/${publicIds.length} successful`)
        return results
    } catch (error) {
        logger.error('Error bulk deleting images from Cloudinary:', error)
        return publicIds.map(id => ({ publicId: id, success: false, error: error.message }))
    }
}

// Generate optimized URLs with transformations
const generateUrl = (publicId, options = {}) => {
    if (!publicId || !isCloudinaryConfigured) {
        return null
    }

    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto:good',
        format = 'auto',
        gravity = 'center'
    } = options

    try {
        const transformation = []

        if (width || height) {
            transformation.push({
                width,
                height,
                crop,
                gravity,
                quality
            })
        }

        transformation.push({ fetch_format: format })

        return cloudinary.url(publicId, {
            transformation,
            secure: true
        })
    } catch (error) {
        logger.error('Error generating Cloudinary URL:', error)
        return null
    }
}

// Get image info
const getImageInfo = async (publicId) => {
    if (!isCloudinaryConfigured || !publicId) {
        return null
    }

    try {
        const result = await cloudinary.api.resource(publicId)

        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            createdAt: result.created_at,
            version: result.version,
            tags: result.tags
        }
    } catch (error) {
        logger.error('Error getting image info from Cloudinary:', error)
        return null
    }
}

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    if (!url || typeof url !== 'string') return null

    try {
        const regex = /\/(?:v\d+\/)?([^\.]+)/
        const match = url.match(regex)
        return match ? match[1] : null
    } catch (error) {
        logger.error('Error extracting public ID from URL:', error)
        return null
    }
}

// Process uploaded files from request
const processUploadedFiles = async (req, imageType = 'image') => {
    if (!req.files && !req.file) {
        return null
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file]
    const { folder, transformation } = getUploadConfig(req, files[0], imageType)

    const uploadPromises = files.map(async (file) => {
        const publicId = `${folder.split('/').pop()}_${uuidv4()}`

        const result = await uploadBuffer(file.buffer, {
            folder,
            transformation,
            publicId,
            tags: ['qrbites', folder.split('/').pop()]
        })

        return {
            ...result,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const results = await Promise.all(uploadPromises)
    return req.file ? results[0] : results
}

// Cleanup helper for error handling
const cleanupUploadedFiles = async (uploadResults) => {
    if (!uploadResults) return

    const results = Array.isArray(uploadResults) ? uploadResults : [uploadResults]
    const publicIds = results.map(result => result.publicId).filter(Boolean)

    if (publicIds.length > 0) {
        await deleteImages(publicIds)
        logger.info(`Cleaned up ${publicIds.length} uploaded files due to error`)
    }
}

module.exports = {
    // Core upload functions
    memoryUpload,
    uploadBuffer,
    uploadBase64,
    processUploadedFiles,

    // Image management
    deleteImage,
    deleteImages,
    generateUrl,
    getImageInfo,

    // Utilities
    extractPublicId,
    cleanupUploadedFiles,
    fileFilter,
    getUploadConfig,

    // Configuration
    isCloudinaryConfigured,
    transformationPresets,

    // Direct cloudinary access
    cloudinary
}