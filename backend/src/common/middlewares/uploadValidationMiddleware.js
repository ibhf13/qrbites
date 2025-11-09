const {
  memoryUpload,
  writeMemoryFilesToDisk,
  cleanupFiles,
} = require('@commonServices/upload/fileUploadService')
const { ValidationError, asyncHandler } = require('@errors')
const logger = require('@commonUtils/logger')

/**
 * Middleware that validates request body first, then uploads to Cloudinary
 * This prevents orphaned files when validation fails
 * @param {Object} schema - Joi schema for validation
 * @param {string} uploadType - Type of upload (menu, menuItem, restaurant, qrcode)
 * @param {string} fieldName - Name of the file field
 * @param {boolean} isArray - Whether to expect array of files
 * @returns {Function} Express middleware
 */
const validateAndUpload = (schema, uploadType, fieldName = 'image', isArray = false) => {
  if (!schema || typeof schema.validate !== 'function') {
    throw new Error('Invalid Joi schema provided to validateAndUpload middleware')
  }

  return asyncHandler(async (req, res, next) => {
    const multerMiddleware = isArray
      ? memoryUpload.array(fieldName, 10)
      : memoryUpload.single(fieldName)

    multerMiddleware(req, res, err => {
      if (err) return next(err)
      processValidation(req, res, next, schema, uploadType, isArray)
    })
  })
}

/**
 * Process validation and file upload to Cloudinary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Object} schema - Joi schema for validation
 * @param {string} uploadType - Type of upload
 * @param {boolean} isArray - Whether to expect array of files
 */
const processValidation = async (req, res, next, schema, uploadType, isArray) => {
  try {
    // Step 1: Validate request body first
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    })

    if (error) {
      const errors = {}
      error.details.forEach(detail => {
        const key = detail.path.join('.')
        errors[key] = detail.message.replace(/['"]/g, '')
      })

      throw new ValidationError('Validation error', errors)
    }

    // Replace request body with validated data
    req.body = value

    // Step 2: Upload files to Cloudinary only after validation passes
    await uploadFilesToCloudinary(req, uploadType, isArray)

    logger.info(`Successfully validated and uploaded files for ${uploadType}`)
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Upload files from memory to Cloudinary
 * @param {Object} req - Express request object
 * @param {string} uploadType - Type of upload
 * @param {boolean} isArray - Whether to expect array of files
 */
const uploadFilesToCloudinary = async (req, uploadType, isArray) => {
  const uploadedUrls = []
  const uploadedPublicIds = []

  try {
    if (isArray && req.files && req.files.length > 0) {
      logger.debug(`Uploading ${req.files.length} files to Cloudinary...`)

      const files = await writeMemoryFilesToDisk(req.files, uploadType)

      uploadedUrls.push(...files.map(f => f.cloudinaryUrl))
      uploadedPublicIds.push(...files.map(f => f.cloudinaryPublicId))
      req.files = files

      logger.success(`Uploaded ${files.length} files to Cloudinary`)
    } else if (!isArray && req.file) {
      logger.debug('Uploading single file to Cloudinary...')

      const file = await writeMemoryFilesToDisk(req.file, uploadType)

      uploadedUrls.push(file.cloudinaryUrl)
      uploadedPublicIds.push(file.cloudinaryPublicId)
      req.file = file

      logger.success('Uploaded file to Cloudinary')
    }

    // Store Cloudinary info for cleanup on error
    req.uploadedCloudinaryUrls = uploadedUrls
    req.uploadedCloudinaryPublicIds = uploadedPublicIds

    // For backward compatibility
    req.writtenFilePaths = uploadedUrls
  } catch (fileError) {
    logger.error('Error uploading to Cloudinary:', fileError)

    // Cleanup any successfully uploaded files
    if (uploadedUrls.length > 0) {
      logger.info('Cleaning up partially uploaded files from Cloudinary...')
      await cleanupFiles(uploadedUrls).catch(cleanupError => {
        logger.error('Error during Cloudinary cleanup:', cleanupError)
      })
    }

    throw fileError
  }
}

/**
 * Error handler middleware to clean up Cloudinary files on controller errors
 * Should be used after routes that use validateAndUpload
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const cleanupOnError = async (err, req, res, next) => {
  // Check both new and old property names for backward compatibility
  const urlsToCleanup = req.uploadedCloudinaryUrls || req.writtenFilePaths

  if (err && urlsToCleanup && urlsToCleanup.length > 0) {
    logger.info('Cleaning up Cloudinary files due to controller error:', urlsToCleanup)

    try {
      await cleanupFiles(urlsToCleanup)
      logger.success('Cloudinary cleanup completed')
    } catch (cleanupError) {
      logger.error('Error during Cloudinary cleanup:', cleanupError)
    }
  }

  next(err)
}

/**
 * Middleware to upload single file to Cloudinary without validation
 * For dedicated upload endpoints like /logo, /image
 * @param {string} uploadType - Type of upload (menu, menuItem, restaurant, qrcode)
 * @param {string} fieldName - Name of the file field
 * @returns {Function} Express middleware
 */
const uploadToCloudinary = (uploadType, fieldName = 'image') => {
  return asyncHandler(async (req, res, next) => {
    const multerMiddleware = memoryUpload.single(fieldName)

    multerMiddleware(req, res, async err => {
      if (err) return next(err)

      try {
        // Upload file to Cloudinary if present
        if (req.file) {
          await uploadFilesToCloudinary(req, uploadType, false)
        }
        next()
      } catch (uploadError) {
        next(uploadError)
      }
    })
  })
}

module.exports = {
  validateAndUpload,
  cleanupOnError,
  uploadToCloudinary,
}
