const path = require('path')
const crypto = require('crypto')

const multer = require('multer')
const logger = require('@commonUtils/logger')
const { badRequest } = require('@errors')
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  isCloudinaryConfigured,
} = require('@config/cloudinary')

/**
 * Generate unique filename
 */
const generateUniqueFilename = originalName => {
  const fileExt = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  return `${timestamp}-${random}${fileExt}`
}

/**
 * Upload files to Cloudinary
 */
const writeMemoryFilesToDisk = async (files, type) => {
  if (!files) return null

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured')
  }

  const fileArray = Array.isArray(files) ? files : [files]
  const uploadedFiles = []
  const uploadedUrls = []

  const folderMap = {
    restaurant: 'restaurants',
    menu: 'menus',
    menuItem: 'menu-items',
    qrcode: 'qrcodes',
  }

  const folder = folderMap[type] || 'uploads'

  try {
    for (const file of fileArray) {
      const uniqueFilename = generateUniqueFilename(file.originalname)
      const publicId = uniqueFilename.replace(path.extname(uniqueFilename), '')

      logger.debug(`Uploading to Cloudinary: ${folder}/${publicId}`)

      const result = await uploadToCloudinary(file.buffer, folder, publicId)

      const fileInfo = {
        filename: uniqueFilename,
        path: result.secure_url,
        publicId: result.public_id,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        cloudinaryUrl: result.secure_url,
      }

      uploadedFiles.push(fileInfo)
      uploadedUrls.push(result.secure_url)
    }

    return Array.isArray(files) ? uploadedFiles : uploadedFiles[0]
  } catch (error) {
    logger.error('Upload failed:', error.message)

    // Cleanup
    if (uploadedUrls.length > 0) {
      await cleanupFiles(uploadedUrls).catch(err => {
        logger.error('Cleanup failed:', err)
      })
    }

    throw error
  }
}

/**
 * Cleanup files from Cloudinary
 */
const cleanupFiles = async urls => {
  if (!urls || (Array.isArray(urls) && urls.length === 0)) return

  const urlArray = Array.isArray(urls) ? urls : [urls]

  await Promise.all(
    urlArray.map(async url => {
      try {
        const publicId = getPublicIdFromUrl(url) || url
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }
      } catch (error) {
        logger.error('Cleanup error:', error.message)
      }
    })
  )
}

/**
 * Get file URL
 */
const getFileUrl = url => {
  return url || null
}

/**
 * File filter
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp']
  const fileExt = path.extname(file.originalname).toLowerCase()

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files allowed (jpeg, jpg, png, webp)'), false)
  }
}

/**
 * Multer memory storage
 */
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter,
})

/**
 * Error handler
 */
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'File upload failed'
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Max 5MB'
    }
    return next(badRequest(message, { code: err.code }))
  }
  return next(err)
}

module.exports = {
  upload: memoryUpload,
  memoryUpload,
  writeMemoryFilesToDisk,
  cleanupFiles,
  getFileUrl,
  multerErrorHandler,
  dirs: {},
}