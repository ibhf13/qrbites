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

router.get('/', protect, getMenus)
router.get('/:id', protect, getMenuById)

router.post('/', protect, upload.array('images', 10), validateRequest(menuSchema), createMenu)
router.put('/:id', protect, upload.array('images', 10), validateRequest(menuUpdateSchema), updateMenu)
router.delete('/:id', protect, deleteMenu)

router.post('/:id/image', protect, upload.single('image'), uploadImage)

router.post('/:id/qrcode', protect, generateQRCode)

module.exports = router 