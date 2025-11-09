/**
 * Menu Item Routes with OpenAPI Documentation
 * @module routes/menuItemRoutes
 */

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

/**
 * @openapi
 * /api/menu-items:
 *   get:
 *     summary: Get all menu items
 *     description: Retrieve a list of menu items with optional filtering. Restaurant owners see only their menu items.
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: menuId
 *         in: query
 *         description: Filter by menu ID
 *         schema:
 *           type: string
 *           format: objectId
 *       - name: category
 *         in: query
 *         description: Filter by category
 *         schema:
 *           type: string
 *           example: Appetizers
 *       - name: isAvailable
 *         in: query
 *         description: Filter by availability status
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: minPrice
 *         in: query
 *         description: Minimum price filter
 *         schema:
 *           type: number
 *           example: 5.00
 *       - name: maxPrice
 *         in: query
 *         description: Maximum price filter
 *         schema:
 *           type: number
 *           example: 20.00
 *       - name: dietary
 *         in: query
 *         description: Filter by dietary preference (e.g., vegetarian, vegan)
 *         schema:
 *           type: string
 *           example: vegetarian
 *     responses:
 *       200:
 *         description: Successfully retrieved menu items
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
 *                     menuItems:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MenuItem'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getMenuItems)

/**
 * @openapi
 * /api/menu-items/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     description: Retrieve a specific menu item by its ID. Users can only access items from their own menus.
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Menu item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', checkMenuItemOwnership(), getMenuItemById)

/**
 * @openapi
 * /api/menu-items:
 *   post:
 *     summary: Create a new menu item
 *     description: Create a new menu item with optional image upload. Restaurant owners can only create items for their own menus.
 *     tags: [Menu Items]
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
 *               - price
 *               - menuId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Margherita Pizza
 *                 description: Item name
 *               description:
 *                 type: string
 *                 example: Classic pizza with fresh mozzarella, tomato sauce, and basil
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 12.99
 *                 description: Item price
 *               currency:
 *                 type: string
 *                 example: USD
 *                 default: USD
 *               category:
 *                 type: string
 *                 example: Main Course
 *               menuId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *                 description: Menu ID (must be owned by user)
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["gluten", "dairy"]
 *                 description: List of allergens (JSON array as string)
 *               dietary:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["vegetarian"]
 *                 description: Dietary tags (JSON array as string)
 *               spicyLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 2
 *               preparationTime:
 *                 type: number
 *                 example: 15
 *                 description: Preparation time in minutes
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Menu item image
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
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
  checkMenuOwnershipForCreation(),
  validateAndUpload(menuItemSchema, 'menuItem', 'image', false),
  createMenuItem,
  cleanupOnError
)

/**
 * @openapi
 * /api/menu-items/{id}:
 *   put:
 *     summary: Update a menu item
 *     description: Update an existing menu item. Only the owner can update their menu items.
 *     tags: [Menu Items]
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
 *                 example: Updated Margherita Pizza
 *               description:
 *                 type: string
 *                 example: Now with extra basil!
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 13.99
 *               currency:
 *                 type: string
 *                 example: USD
 *               category:
 *                 type: string
 *                 example: Main Course
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               allergens:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["gluten", "dairy"]
 *               dietary:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["vegetarian"]
 *               spicyLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 2
 *               preparationTime:
 *                 type: number
 *                 example: 15
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New menu item image (replaces existing)
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
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
  checkMenuItemOwnership(),
  validateAndUpload(menuItemUpdateSchema, 'menuItem', 'image', false),
  updateMenuItem,
  cleanupOnError
)

/**
 * @openapi
 * /api/menu-items/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     description: Delete a menu item permanently. Only the owner can delete their menu items.
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Menu item deleted successfully (no content)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', checkMenuItemOwnership(), deleteMenuItem)

/**
 * @openapi
 * /api/menu-items/{id}/image:
 *   post:
 *     summary: Upload menu item image
 *     description: Upload or replace the image for a menu item. The image will be uploaded to Cloudinary.
 *     tags: [Menu Items]
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
 *                 description: Menu item image file (JPG, PNG, WEBP)
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
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/menuitem.jpg
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
  '/:id/image',
  checkMenuItemOwnership(),
  uploadToCloudinary('menuItem', 'image'),
  uploadImage
)

module.exports = router
