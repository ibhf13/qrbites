/**
 * Authentication Routes with OpenAPI Documentation
 * @module routes/authRoutes
 */

const express = require('express')
const { validateRequest } = require('@commonMiddlewares/validationMiddleware')
const { protect } = require('@commonMiddlewares/authMiddleware')
const { authLimiter, createUserLimiter } = require('@commonMiddlewares/rateLimitMiddleware')

const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validations/authValidation')
const { register, login, getMe, changePassword } = require('../controllers/authController')

const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account. Role can be either restaurant_owner or customer. Admin accounts must be created directly in the database.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             restaurantOwner:
 *               summary: Restaurant Owner Registration
 *               value:
 *                 email: owner@restaurant.com
 *                 password: SecurePass123!
 *                 role: restaurant_owner
 *             customer:
 *               summary: Customer Registration
 *               value:
 *                 email: customer@example.com
 *                 password: SecurePass123!
 *                 role: customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', createUserLimiter, validateRequest(registerSchema), register)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password to receive a JWT token. Use this token for subsequent authenticated requests.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             example1:
 *               summary: Login Example
 *               value:
 *                 email: owner@restaurant.com
 *                 password: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful - returns JWT token and user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input - email or password missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: Please provide email and password
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: Invalid credentials
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', authLimiter, validateRequest(loginSchema), login)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information. Requires valid JWT token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/me', protect, getMe)

/**
 * @openapi
 * /api/auth/password:
 *   put:
 *     summary: Change user password
 *     description: Change the authenticated user's password. Requires current password for verification.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123!
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123!
 *                 description: New password (minimum 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Current password is incorrect or user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/password', protect, validateRequest(changePasswordSchema), changePassword)

module.exports = router
