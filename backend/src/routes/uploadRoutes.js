const express = require('express');
const router = express.Router();
const { protect } = require('@middleware/auth');
const { validateFileUpload } = require('@middleware/fileValidation');
const uploadController = require('@controllers/uploadController');

// Routes that require authentication
router.use(protect);

// Basic CRUD operations
router.route('/')
  .post(
    uploadController.uploadMiddleware.single('menuImage'),
    validateFileUpload(),
    uploadController.uploadFile
  )
  .get(uploadController.getUploads);

router.route('/:id')
  .get(uploadController.getUpload)
  .delete(uploadController.deleteUpload);

router.get('/:id/download', uploadController.downloadFile);

module.exports = router; 