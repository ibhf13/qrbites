const logger = require('@commonUtils/logger')
const { badRequest, errorMessages, logDatabaseError } = require('@errors')

/**
 * Attach Cloudinary URL to request body for single file uploads
 * @param {Object} req - Express request object
 * @param {string} uploadType - Type of upload (not used for Cloudinary URLs)
 * @param {string} fieldName - Name of the field to set in req.body
 * @returns {boolean} - Whether a file URL was attached
 */
const attachFileUrl = (req, uploadType, fieldName) => {
  if (!req.file) {
    return false
  }

  try {
    // For Cloudinary uploads, use the cloudinaryUrl directly
    const fileUrl = req.file.cloudinaryUrl || req.file.path

    req.body[fieldName] = fileUrl

    logger.debug(`Attached Cloudinary URL to ${fieldName}: ${fileUrl}`)
    return true
  } catch (error) {
    logger.error(`Error attaching file URL to ${fieldName}:`, error)
    return false
  }
}

/**
 * Attach Cloudinary URLs to request body for multiple file uploads
 * @param {Object} req - Express request object
 * @param {string} uploadType - Type of upload (not used for Cloudinary URLs)
 * @param {string} fieldName - Name of the field for array
 * @param {string} singleFieldName - Optional name for first file
 * @returns {boolean} - Whether file URLs were attached
 */
const attachFileUrls = (req, uploadType, fieldName, singleFieldName = null) => {
  if (!req.files || req.files.length === 0) {
    return false
  }

  try {
    // For Cloudinary uploads, use cloudinaryUrl directly
    const fileUrls = req.files.map(file => file.cloudinaryUrl || file.path)

    req.body[fieldName] = fileUrls

    // For backward compatibility, set the first file as single field
    if (singleFieldName && fileUrls.length > 0) {
      req.body[singleFieldName] = fileUrls[0]
    }

    logger.debug(`Attached ${fileUrls.length} Cloudinary URLs to ${fieldName}`)
    return true
  } catch (error) {
    logger.error(`Error attaching file URLs to ${fieldName}:`, error)
    return false
  }
}

/**
 * Update document with Cloudinary URL for dedicated upload endpoints
 * @param {Object} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} req - Express request object
 * @param {string} uploadType - Type of upload (not used for Cloudinary)
 * @param {string} fieldName - Name of the field to update
 * @returns {Promise<Object>} - Updated document
 */
const updateDocumentWithFileUrl = async (Model, id, req, uploadType, fieldName) => {
  if (!req.file) {
    throw badRequest('No file uploaded')
  }

  try {
    // For Cloudinary uploads, use cloudinaryUrl directly
    const fileUrl = req.file.cloudinaryUrl || req.file.path

    const updateData = { [fieldName]: fileUrl }
    const updatedDocument = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!updatedDocument) {
      throw badRequest(errorMessages.notFound('Document', id))
    }

    logger.debug(`Updated document ${id} with ${fieldName}: ${fileUrl}`)
    return updatedDocument
  } catch (error) {
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Document'))
    }
    logDatabaseError(error, 'UPDATE', {
      collection: Model.modelName,
      id,
      field: fieldName
    })
    throw error
  }
}

/**
 * Validate that a file was uploaded
 * @param {Object} req - Express request object
 * @param {string} errorMessage - Custom error message
 * @throws {Error} - If no file was uploaded
 */
const validateFileUpload = (req, errorMessage = 'File upload is required') => {
  if (!req.file) {
    throw badRequest(errorMessage)
  }
}

module.exports = {
  attachFileUrl,
  attachFileUrls,
  updateDocumentWithFileUrl,
  validateFileUpload,
}