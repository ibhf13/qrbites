/**
 * Menu Routes with OpenAPI Documentation
 * @module routes/menuRoutes
 */

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
const { addUserRestaurants } = require('@commonMiddlewares/authMiddleware')

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

router.use(protect, addUserRestaurants, apiLimiter)

/**
 * @openapi
 * /api/menus:
 *   get:
 *     summary: Get all menus
 *     description: Retrieve a list of menus. Restaurant owners see only their menus, admins see all menus.
 *     tags: [Menus]
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
 *       - name: restaurantId
 *         in: query
 *         description: Filter by restaurant ID (admin only)
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Successfully retrieved menus
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
 *                     menus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Menu'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getMenus)

/**
 * @openapi
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     description: Retrieve a specific menu by its ID. Users can only access menus they own.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', checkMenuOwnership(), getMenuById)

/**
 * @openapi
 * /api/menus:
 *   post:
 *     summary: Create a new menu
 *     description: Create a new menu for a restaurant. Restaurant owners can only create menus for their restaurant.
 *     tags: [Menus]
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
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dinner Menu
 *                 description: Menu name
 *               description:
 *                 type: string
 *                 example: Evening dinner specialties
 *                 description: Menu description
 *               restaurantId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *                 description: Restaurant ID (must match user's restaurant)
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Appetizers", "Main Course", "Desserts"]
 *                 description: Menu categories (JSON array as string)
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Menu images (multiple files supported)
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
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
  checkRestaurantOwnershipForCreation(),
  validateAndUpload(menuSchema, 'menu', 'images', true),
  createMenu,
  cleanupOnError
)

/**
 * @openapi
 * /api/menus/{id}:
 *   put:
 *     summary: Update a menu
 *     description: Update an existing menu. Only the owner can update their menus.
 *     tags: [Menus]
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
 *                 example: Updated Dinner Menu
 *               description:
 *                 type: string
 *                 example: Updated evening specialties
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Appetizers", "Entrees", "Desserts", "Drinks"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New menu images (will be added to existing)
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
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
  checkMenuOwnership(),
  validateAndUpload(menuUpdateSchema, 'menu', 'images', true),
  updateMenu,
  cleanupOnError
)

/**
 * @openapi
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete a menu
 *     description: Soft delete a menu by setting isActive to false. Only the owner can delete their menus.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Menu deleted successfully (no content)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', checkMenuOwnership(), deleteMenu)

/**
 * @openapi
 * /api/menus/{id}/image:
 *   post:
 *     summary: Upload menu image
 *     description: Upload a single image for a menu. The image will be uploaded to Cloudinary.
 *     tags: [Menus]
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
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Menu image file
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/menu.jpg
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
router.post('/:id/image', checkMenuOwnership(), uploadToCloudinary('menu', 'image'), uploadImage)

/**
 * @openapi
 * /api/menus/{id}/qrcode:
 *   post:
 *     summary: Generate QR code for menu
 *     description: Generate a QR code for the menu that links to the public menu view. The QR code is uploaded to Cloudinary.
 *     tags: [Menus, QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: number
 *                 example: 300
 *                 description: QR code size in pixels (default 300)
 *               errorCorrectionLevel:
 *                 type: string
 *                 enum: [L, M, Q, H]
 *                 example: M
 *                 description: Error correction level (default M)
 *     responses:
 *       200:
 *         description: QR code generated successfully
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
 *                     qrCode:
 *                       type: string
 *                       format: uri
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/qrcode.png
 *                     qrCodeId:
 *                       type: string
 *                       example: abc123xyz
 *                     menuUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://qrbites.com/r/abc123xyz
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/qrcode', checkMenuOwnership(), generateQRCode)

module.exports = router
