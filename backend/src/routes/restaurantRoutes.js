const express = require('express')
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadLogo
} = require('@controllers/restaurantController')
const { protect, checkRestaurantOwnership } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { validateAndUpload, cleanupOnError } = require('@middlewares/uploadValidationMiddleware')
const { restaurantSchema, restaurantUpdateSchema } = require('@validations/restaurantValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

router.get('/', protect, getRestaurants)
router.get('/:id', protect, getRestaurantById)

router.post('/', protect, validateAndUpload(restaurantSchema, 'restaurant', 'logo', false), createRestaurant, cleanupOnError)
router.put('/:id', protect, checkRestaurantOwnership('id'), validateAndUpload(restaurantUpdateSchema, 'restaurant', 'logo', false), updateRestaurant, cleanupOnError)
router.delete('/:id', protect, checkRestaurantOwnership('id'), deleteRestaurant)

// Keep logo-only upload endpoint using original upload (no validation needed here)
router.post('/:id/logo', protect, checkRestaurantOwnership('id'), upload.single('logo'), uploadLogo)

module.exports = router 