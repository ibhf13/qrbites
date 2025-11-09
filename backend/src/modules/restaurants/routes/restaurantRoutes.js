/**
 * Restaurant Routes with OpenAPI Documentation
 * @module routes/restaurantRoutes
 */

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

/**
 * @openapi
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     description: Retrieve a list of restaurants. Restaurant owners see only their restaurant, admins see all restaurants.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: isActive
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: city
 *         in: query
 *         description: Filter by city
 *         schema:
 *           type: string
 *           example: New York
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getRestaurants)

/**
 * @openapi
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     description: Retrieve a specific restaurant by its ID. Users can only access restaurants they own unless they're an admin.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Restaurant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', checkRestaurantOwnership('id'), getRestaurantById)

/**
 * @openapi
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     description: Create a new restaurant profile. Restaurant owners can create one restaurant, admins can create multiple.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: La Bella Cucina
 *                 description: Restaurant name
 *               description:
 *                 type: string
 *                 example: Authentic Italian cuisine in the heart of the city
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: 123 Main Street
 *                   city:
 *                     type: string
 *                     example: New York
 *                   state:
 *                     type: string
 *                     example: NY
 *                   zipCode:
 *                     type: string
 *                     example: 10001
 *                   country:
 *                     type: string
 *                     example: USA
 *                 description: Location details (as JSON string)
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: +1-555-123-4567
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: info@restaurant.com
 *                 description: Contact information (as JSON string)
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Restaurant logo image
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  validateAndUpload(restaurantSchema, 'restaurant', 'logo', false),
  createRestaurant,
  cleanupOnError
)

/**
 * @openapi
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     description: Update an existing restaurant profile. Only the owner or admin can update the restaurant.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: La Bella Cucina Updated
 *               description:
 *                 type: string
 *                 example: Updated description with new specialties
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Updated location details (as JSON string)
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                 description: Updated contact information (as JSON string)
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: New restaurant logo (replaces existing)
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/:id',
  checkRestaurantOwnership('id'),
  validateAndUpload(restaurantUpdateSchema, 'restaurant', 'logo', false),
  updateRestaurant,
  cleanupOnError
)

/**
 * @openapi
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     description: Soft delete a restaurant by setting isActive to false. Only the owner or admin can delete the restaurant.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Restaurant deleted successfully (no content)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', checkRestaurantOwnership('id'), deleteRestaurant)

/**
 * @openapi
 * /api/restaurants/{id}/logo:
 *   post:
 *     summary: Upload restaurant logo
 *     description: Upload or replace the logo for a restaurant. The logo will be uploaded to Cloudinary.
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Restaurant logo file (JPG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logoUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/logo.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/:id/logo',
  checkRestaurantOwnership('id'),
  uploadToCloudinary('restaurant', 'logo'),
  uploadLogo
)

module.exports = router
