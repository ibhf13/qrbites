const express = require('express')
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  uploadLogo
} = require('@controllers/restaurantController')
const { protect } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { restaurantSchema, restaurantUpdateSchema } = require('@validations/restaurantValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

router.get('/', protect, getRestaurants)
router.get('/:id', protect, getRestaurantById)

router.post('/', protect, upload.single('logo'), validateRequest(restaurantSchema), createRestaurant)
router.put('/:id', protect, upload.single('logo'), validateRequest(restaurantUpdateSchema), updateRestaurant)
router.delete('/:id', protect, deleteRestaurant)

router.post('/:id/logo', protect, upload.single('logo'), uploadLogo)

module.exports = router 