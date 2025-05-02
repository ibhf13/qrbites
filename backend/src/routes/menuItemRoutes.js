const express = require('express')
const {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadImage
} = require('@controllers/menuItemController')
const { protect } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { menuItemSchema, menuItemUpdateSchema } = require('@validations/menuItemValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

// Public routes
router.get('/', getMenuItems)
router.get('/:id', getMenuItemById)

// Protected routes
router.post('/', protect, upload.single('image'), validateRequest(menuItemSchema), createMenuItem)
router.put('/:id', protect, upload.single('image'), validateRequest(menuItemUpdateSchema), updateMenuItem)
router.delete('/:id', protect, deleteMenuItem)

// Image upload route
router.post('/:id/image', protect, upload.single('image'), uploadImage)

module.exports = router 