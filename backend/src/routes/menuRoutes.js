const express = require('express')
const {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    uploadImage,
    generateQRCode
} = require('@controllers/menuController')
const { protect, checkRestaurantOwnership, checkMenuOwnership } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { validateAndUpload, cleanupOnError } = require('@middlewares/uploadValidationMiddleware')
const { menuSchema, menuUpdateSchema } = require('@validations/menuValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

router.get('/', protect, getMenus)
router.get('/:id', protect, checkMenuOwnership(), getMenuById)

router.post('/', protect, checkRestaurantOwnership('restaurantId'), validateAndUpload(menuSchema, 'menu', 'images', true), createMenu, cleanupOnError)
router.put('/:id', protect, checkMenuOwnership(), validateAndUpload(menuUpdateSchema, 'menu', 'images', true), updateMenu, cleanupOnError)
router.delete('/:id', protect, checkMenuOwnership(), deleteMenu)

// Keep image-only upload endpoint using original upload (no validation needed here)
router.post('/:id/image', protect, checkMenuOwnership(), upload.single('image'), uploadImage)

router.post('/:id/qrcode', protect, checkMenuOwnership(), generateQRCode)

module.exports = router 