const express = require('express')
const { protect, checkRestaurantOwnership } = require('@commonMiddlewares/authMiddleware')
const { apiLimiter } = require('@commonMiddlewares/rateLimitMiddleware')
const {
  validateAndUpload,
  cleanupOnError,
  uploadToCloudinary,
} = require('@commonMiddlewares/uploadValidationMiddleware')
const { addUserRestaurants } = require('@commonMiddlewares/authMiddleware')

const { restaurantSchema, restaurantUpdateSchema } = require('../validations/restaurantValidation')
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadLogo,
} = require('../controllers/restaurantController')

const router = express.Router()

router.use(protect, addUserRestaurants, apiLimiter)

router.get('/', getRestaurants)
router.get('/:id', checkRestaurantOwnership('id'), getRestaurantById)

router.post(
  '/',
  validateAndUpload(restaurantSchema, 'restaurant', 'logo', false),
  createRestaurant,
  cleanupOnError
)
router.put(
  '/:id',
  checkRestaurantOwnership('id'),
  validateAndUpload(restaurantUpdateSchema, 'restaurant', 'logo', false),
  updateRestaurant,
  cleanupOnError
)
router.delete('/:id', checkRestaurantOwnership('id'), deleteRestaurant)

// Logo-only upload endpoint with Cloudinary upload
router.post('/:id/logo', checkRestaurantOwnership('id'), uploadToCloudinary('restaurant', 'logo'), uploadLogo)

module.exports = router
