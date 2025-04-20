const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/Upload');
const logger = require('../utils/logger');
const createError = require('http-errors');

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create user-specific directory
    const userDir = path.join(uploadDir, req.user.id.toString());
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Setup multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 // 10MB default
  }
});

/**
 * @desc    Upload a menu image/PDF
 * @route   POST /api/uploads
 * @access  Private
 */
exports.uploadFile = async (req, res, next) => {
  try {
    // File validation has already been done by middleware
    const { file } = req;
    
    // Create upload record in database
    const upload = await Upload.create({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      user: req.user.id,
      menu: req.body.menuId || null
    });

    // Generate URL for file access
    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${upload._id}`;

    res.status(201).json({
      success: true,
      data: {
        _id: upload._id,
        originalName: upload.originalName,
        mimetype: upload.mimetype,
        size: upload.size,
        url: fileUrl,
        createdAt: upload.createdAt
      }
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    next(error);
  }
};

/**
 * @desc    Get all uploads for the logged-in user
 * @route   GET /api/uploads
 * @access  Private
 */
exports.getUploads = async (req, res, next) => {
  try {
    const uploads = await Upload.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/uploads`;
    
    const formattedUploads = uploads.map(upload => ({
      _id: upload._id,
      originalName: upload.originalName,
      mimetype: upload.mimetype,
      size: upload.size,
      url: `${baseUrl}/${upload._id}`,
      isProcessed: upload.isProcessed,
      ocrStatus: upload.ocrStatus,
      menu: upload.menu,
      createdAt: upload.createdAt
    }));

    res.status(200).json({
      success: true,
      count: uploads.length,
      data: formattedUploads
    });
  } catch (error) {
    logger.error('Error fetching uploads:', error);
    next(error);
  }
};

/**
 * @desc    Get a single upload by ID
 * @route   GET /api/uploads/:id
 * @access  Private
 */
exports.getUpload = async (req, res, next) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return next(createError(404, 'Upload not found'));
    }

    // Check if user owns the upload
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to access this upload'));
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${upload._id}/download`;

    res.status(200).json({
      success: true,
      data: {
        _id: upload._id,
        originalName: upload.originalName,
        mimetype: upload.mimetype,
        size: upload.size,
        url: fileUrl,
        isProcessed: upload.isProcessed,
        ocrStatus: upload.ocrStatus,
        menu: upload.menu,
        createdAt: upload.createdAt
      }
    });
  } catch (error) {
    logger.error('Error fetching upload:', error);
    next(error);
  }
};

/**
 * @desc    Download a file
 * @route   GET /api/uploads/:id/download
 * @access  Private/Public (depending on implementation needs)
 */
exports.downloadFile = async (req, res, next) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return next(createError(404, 'File not found'));
    }

    // If this is a private route, check ownership
    if (req.user && upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to access this file'));
    }

    // Check if file exists
    if (!fs.existsSync(upload.path)) {
      return next(createError(404, 'File not found on server'));
    }

    res.download(upload.path, upload.originalName);
  } catch (error) {
    logger.error('Error downloading file:', error);
    next(error);
  }
};

/**
 * @desc    Delete an upload
 * @route   DELETE /api/uploads/:id
 * @access  Private
 */
exports.deleteUpload = async (req, res, next) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return next(createError(404, 'Upload not found'));
    }

    // Check if user owns the upload
    if (upload.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to delete this upload'));
    }

    // Delete file from disk
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }

    // Delete from database
    await upload.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting upload:', error);
    next(error);
  }
};

module.exports.uploadMiddleware = upload; 