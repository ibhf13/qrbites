const express = require('express')
const {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadImage
} = require('@controllers/menuItemController')
const { protect, checkMenuItemOwnership, checkMenuOwnershipForCreation } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { validateAndUpload, cleanupOnError } = require('@middlewares/uploadValidationMiddleware')
const { menuItemSchema, menuItemUpdateSchema } = require('@validations/menuItemValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

router.get('/', getMenuItems)
router.get('/:id', getMenuItemById)

router.post('/', protect, checkMenuOwnershipForCreation(), validateAndUpload(menuItemSchema, 'menuItem', 'image', false), createMenuItem, cleanupOnError)
router.put('/:id', protect, checkMenuItemOwnership(), validateAndUpload(menuItemUpdateSchema, 'menuItem', 'image', false), updateMenuItem, cleanupOnError)
router.delete('/:id', protect, checkMenuItemOwnership(), deleteMenuItem)

// Keep image-only upload endpoint using original upload (no validation needed here)
router.post('/:id/image', protect, checkMenuItemOwnership(), upload.single('image'), uploadImage)

module.exports = router 