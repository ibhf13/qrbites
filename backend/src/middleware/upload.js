const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define allowed file types
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || 10485760); // 10MB default

// Create storage engine (for local testing - will be replaced with GridFS in production)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

/**
 * Middleware for single file upload
 */
exports.uploadSingle = upload.single('file');

/**
 * Middleware for multiple file upload
 */
exports.uploadMultiple = upload.array('files', 5); // Max 5 files

/**
 * Middleware for handling multer errors
 */
exports.handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
}; 