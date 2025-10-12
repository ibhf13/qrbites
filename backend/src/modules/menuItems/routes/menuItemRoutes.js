const express = require('express')
const {
  protect,
  checkMenuItemOwnership,
  checkMenuOwnershipForCreation,
} = require('@commonMiddlewares/authMiddleware')
const { apiLimiter } = require('@commonMiddlewares/rateLimitMiddleware')
const {
  validateAndUpload,
  cleanupOnError,
  uploadToCloudinary,
} = require('@commonMiddlewares/uploadValidationMiddleware')
const { addUserRestaurants } = require('@commonMiddlewares/authMiddleware')

const { menuItemSchema, menuItemUpdateSchema } = require('../validations/menuItemValidation')
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
} = require('../controllers/menuItemController')

const router = express.Router()

router.use(protect, addUserRestaurants, apiLimiter)

router.get('/', getMenuItems)
router.get('/:id', checkMenuItemOwnership(), getMenuItemById)

router.post(
  '/',
  checkMenuOwnershipForCreation(),
  validateAndUpload(menuItemSchema, 'menuItem', 'image', false),
  createMenuItem,
  cleanupOnError
)
router.put(
  '/:id',
  checkMenuItemOwnership(),
  validateAndUpload(menuItemUpdateSchema, 'menuItem', 'image', false),
  updateMenuItem,
  cleanupOnError
)
router.delete('/:id', checkMenuItemOwnership(), deleteMenuItem)

// Image-only upload endpoint with Cloudinary upload
router.post('/:id/image', checkMenuItemOwnership(), uploadToCloudinary('menuItem', 'image'), uploadImage)

module.exports = router
