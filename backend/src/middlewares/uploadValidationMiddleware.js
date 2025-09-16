const { memoryUpload, writeMemoryFilesToDisk, cleanupFiles } = require('@services/fileUploadService')
const { validation } = require('@utils/errorUtils')
const logger = require('@utils/logger')

/**
 * Middleware that validates request body first, then writes files to disk only after validation passes
 * This prevents orphaned files when validation fails
 * @param {Object} schema - Joi schema for validation
 * @param {string} uploadType - Type of upload (menu, menuItem, restaurant, etc.)
 * @param {string} fieldName - Name of the file field ('image', 'images', etc.)
 * @param {boolean} isArray - Whether to expect array of files
 * @returns {Function} Express middleware
 */
const validateAndUpload = (schema, uploadType, fieldName = 'image', isArray = false) => {
    return async (req, res, next) => {
        try {
            // Step 1: Handle file upload to memory
            const multerMiddleware = isArray
                ? memoryUpload.array(fieldName, 10)
                : memoryUpload.single(fieldName)

            // Wrap multer middleware in promise
            await new Promise((resolve, reject) => {
                multerMiddleware(req, res, (err) => {
                    if (err) {
                        logger.error('Multer error:', err)
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })

            // Step 2: Validate request body first
            const validationOptions = {
                abortEarly: false, // Return all errors
                allowUnknown: true, // Allow unknown properties
                stripUnknown: true // Remove unknown properties
            }

            const { error, value } = schema.validate(req.body, validationOptions)

            if (error) {
                const errors = {}

                error.details.forEach((detail) => {
                    const key = detail.path.join('.')
                    errors[key] = detail.message.replace(/['"]/g, '')
                })

                logger.debug('Validation error before file write:', errors)
                // No need to cleanup files since they weren't written to disk yet
                return next(validation('Validation error', errors))
            }

            // Step 3: Replace request body with validated data
            req.body = value

            // Step 4: Write files to disk only after validation passes
            let writtenFiles = []
            try {
                if (isArray && req.files && req.files.length > 0) {
                    writtenFiles = await writeMemoryFilesToDisk(req.files, uploadType)
                    // Update req.files with disk file info for backward compatibility
                    req.files = writtenFiles
                } else if (!isArray && req.file) {
                    const writtenFile = await writeMemoryFilesToDisk(req.file, uploadType)
                    writtenFiles = [writtenFile]
                    // Update req.file with disk file info for backward compatibility
                    req.file = writtenFile
                }

                // Store written file paths for potential cleanup
                req.writtenFilePaths = writtenFiles.map(f => f.path)

                logger.info(`Successfully validated and uploaded ${writtenFiles.length} file(s) for ${uploadType}`)
                next()

            } catch (fileError) {
                logger.error('Error writing files to disk:', fileError)
                // Clean up any files that were successfully written
                if (writtenFiles.length > 0) {
                    await cleanupFiles(writtenFiles.map(f => f.path))
                }
                next(fileError)
            }

        } catch (error) {
            logger.error('Upload validation middleware error:', error)
            next(error)
        }
    }
}

/**
 * Error handler middleware to clean up files when controller errors occur
 * Should be used after routes that use validateAndUpload
 */
const cleanupOnError = (err, req, res, next) => {
    // If there was an error and files were written, clean them up
    if (err && req.writtenFilePaths && req.writtenFilePaths.length > 0) {
        logger.info('Cleaning up files due to controller error:', req.writtenFilePaths)
        cleanupFiles(req.writtenFilePaths).catch(cleanupError => {
            logger.error('Error during file cleanup:', cleanupError)
        })
    }
    next(err)
}

module.exports = {
    validateAndUpload,
    cleanupOnError
}
