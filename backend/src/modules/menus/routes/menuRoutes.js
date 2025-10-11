const express = require('express')
const {
  protect,
  checkRestaurantOwnershipForCreation,
  checkMenuOwnership,
} = require('@commonMiddlewares')
const { apiLimiter } = require('@commonMiddlewares/rateLimitMiddleware')
const {
  validateAndUpload,
  cleanupOnError,
  uploadToCloudinary,
} = require('@commonMiddlewares/uploadValidationMiddleware')

const { menuSchema, menuUpdateSchema } = require('../validations/menuValidation')
const {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadImage,
  generateQRCode,
} = require('../controllers/menuController')

const router = express.Router()

router.use(protect, apiLimiter)

router.get('/', getMenus)
router.get('/:id', checkMenuOwnership(), getMenuById)

router.post(
  '/',
  checkRestaurantOwnershipForCreation(),
  validateAndUpload(menuSchema, 'menu', 'images', true),
  createMenu,
  cleanupOnError
)

router.put(
  '/:id',
  checkMenuOwnership(),
  validateAndUpload(menuUpdateSchema, 'menu', 'images', true),
  updateMenu,
  cleanupOnError
)

router.delete('/:id', checkMenuOwnership(), deleteMenu)

// Image-only upload endpoint with Cloudinary upload
router.post('/:id/image', checkMenuOwnership(), uploadToCloudinary('menu', 'image'), uploadImage)

router.post('/:id/qrcode', checkMenuOwnership(), generateQRCode)

module.exports = router
