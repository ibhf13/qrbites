const createError = require('http-errors');

/**
 * Middleware to validate file uploads
 * @param {Object} options Configuration options
 * @returns {Function} Express middleware
 */
const validateFileUpload = (options = {}) => {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxFileSize = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB default
    fieldName = 'menuImage'
  } = options;

  return (req, res, next) => {
    // Check if file exists
    if (!req.file) {
      return next(createError(400, `No file uploaded. Please upload a file using the '${fieldName}' field.`));
    }

    const { mimetype, size, originalname } = req.file;

    // Check file type
    if (!allowedMimeTypes.includes(mimetype)) {
      return next(
        createError(
          400, 
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
        )
      );
    }

    // Check file size
    if (size > maxFileSize) {
      const maxSizeInMB = Math.round(maxFileSize / (1024 * 1024));
      return next(
        createError(
          400, 
          `File too large. Maximum size allowed is ${maxSizeInMB}MB`
        )
      );
    }

    // File passed validation
    next();
  };
};

module.exports = { validateFileUpload }; 