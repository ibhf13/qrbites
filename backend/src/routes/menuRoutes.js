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
const { protect } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { menuSchema, menuUpdateSchema } = require('@validations/menuValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

// Public routes
router.get('/', getMenus)
router.get('/:id', getMenuById)

// Protected routes
router.post('/', protect, upload.single('image'), validateRequest(menuSchema), createMenu)
router.put('/:id', protect, upload.single('image'), validateRequest(menuUpdateSchema), updateMenu)
router.delete('/:id', protect, deleteMenu)

// Image upload route
router.post('/:id/image', protect, upload.single('image'), uploadImage)

// QR code generation route
router.post('/:id/qrcode', protect, generateQRCode)

module.exports = router 