const { v2: cloudinary } = require('cloudinary')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require('path')

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Determine folder based on request URL
        let folder = 'qrbites/general'

        if (req.originalUrl.includes('/restaurants')) {
            folder = 'qrbites/restaurants'
        } else if (req.originalUrl.includes('/menus')) {
            folder = 'qrbites/menus'
        } else if (req.originalUrl.includes('/menu-items')) {
            folder = 'qrbites/menu-items'
        } else if (req.originalUrl.includes('/profile')) {
            folder = 'qrbites/profiles'
        }

        return {
            folder: folder,
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            transformation: [
                {
                    width: 1000,
                    height: 1000,
                    crop: 'limit',
                    quality: 'auto:good'
                }
            ]
        }
    }
})

// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false)
    }
}

// Configure multer with Cloudinary storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
})

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        return result
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error)
        throw error
    }
}

// Upload base64 image (for QR codes, etc.)
const uploadBase64 = async (base64Data, folder = 'qrbites/qrcodes') => {
    try {
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: folder,
            public_id: `qr-${Date.now()}`,
            resource_type: 'image'
        })
        return result
    } catch (error) {
        console.error('Error uploading base64 to Cloudinary:', error)
        throw error
    }
}

module.exports = {
    cloudinary,
    upload,
    deleteImage,
    uploadBase64
}

// Alternative: Memory upload for processing before cloud upload
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
})

// Process and upload buffer to Cloudinary
const uploadBuffer = async (buffer, originalName, type) => {
    try {
        const folder = `qrbites/${type}`
        const publicId = `${type}-${Date.now()}-${Math.round(Math.random() * 1E9)}`

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    public_id: publicId,
                    resource_type: 'image',
                    transformation: [
                        {
                            width: 1000,
                            height: 1000,
                            crop: 'limit',
                            quality: 'auto:good'
                        }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            ).end(buffer)
        })
    } catch (error) {
        console.error('Error uploading buffer to Cloudinary:', error)
        throw error
    }
}

module.exports.memoryUpload = memoryUpload
module.exports.uploadBuffer = uploadBuffer