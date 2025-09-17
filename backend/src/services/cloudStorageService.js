const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const logger = require('@utils/logger')

// For production, use memory storage and upload to cloud
// This is a template - you'll need to configure your preferred cloud storage
// Options: AWS S3, Cloudinary, Google Cloud Storage, etc.

const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/
    const mimeType = allowedFileTypes.test(file.mimetype)
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())

    if (mimeType && extname) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false)
    }
}

const upload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter
})

// Cloud upload function - implement based on your chosen service
const uploadToCloud = async (fileBuffer, fileName, type) => {
    try {
        // TODO: Implement your cloud storage upload here
        // Examples:

        // For Cloudinary:
        // const cloudinary = require('cloudinary').v2;
        // const result = await cloudinary.uploader.upload(
        //   `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
        //   { 
        //     folder: `qrbites/${type}`,
        //     public_id: fileName.split('.')[0]
        //   }
        // );
        // return result.secure_url;

        // For AWS S3:
        // const AWS = require('aws-sdk');
        // const s3 = new AWS.S3();
        // const uploadParams = {
        //   Bucket: process.env.AWS_BUCKET_NAME,
        //   Key: `${type}/${fileName}`,
        //   Body: fileBuffer,
        //   ContentType: mimeType
        // };
        // const result = await s3.upload(uploadParams).promise();
        // return result.Location;

        // For now, return a placeholder URL
        logger.warn('Cloud storage not configured. Using placeholder URL.')
        return `https://placeholder.com/${type}/${fileName}`

    } catch (error) {
        logger.error('Cloud upload error:', error)
        throw error
    }
}

const getFileUrl = (filename, type) => {
    if (!filename) return null

    // If using cloud storage, return the direct URL
    if (process.env.CLOUD_STORAGE_URL) {
        return `${process.env.CLOUD_STORAGE_URL}/${type}/${filename}`
    }

    // Fallback to local URL (for development)
    const baseUrl = process.env.BASE_URL || process.env.API_URL || 'http://localhost:5000'
    return `${baseUrl}/uploads/${type}s/${filename}`
}

const processUploadedFile = async (file, type) => {
    if (!file) return null

    const fileExt = path.extname(file.originalname)
    const fileName = `${uuidv4()}${fileExt}`

    if (process.env.NODE_ENV === 'production') {
        // Upload to cloud storage in production
        const cloudUrl = await uploadToCloud(file.buffer, fileName, type)
        return {
            filename: fileName,
            url: cloudUrl,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        }
    } else {
        // For development, you might still want to use local storage
        // This would require the original fileUploadService logic
        return {
            filename: fileName,
            url: getFileUrl(fileName, type),
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        }
    }
}

module.exports = {
    upload,
    uploadToCloud,
    getFileUrl,
    processUploadedFile
}