/**
 * OAuth Authentication Routes with OpenAPI Documentation
 * @module routes/oauthRoutes
 */

const express = require('express')
const passport = require('passport')
const { authLimiter } = require('@commonMiddlewares/rateLimitMiddleware')

const { googleCallback } = require('../controllers/oauthController')

const router = express.Router()

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth2 login
 *     description: Redirects user to Google for authentication. After successful authentication, Google redirects back to the callback URL.
 *     tags: [Authentication, OAuth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback
 *     description: |
 *       Handles the callback from Google after authentication.
 *       - Default: Redirects to frontend with JWT token
 *       - With ?format=json: Returns JSON response (for mobile apps)
 *     tags: [Authentication, OAuth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [redirect, json]
 *         description: Response format (default is redirect)
 *     responses:
 *       200:
 *         description: Success (JSON format) - returns JWT token and user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       302:
 *         description: Success (redirect format) - redirects to frontend with token
 *       401:
 *         description: Authentication failed
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=google_auth_failed',
    session: false,
  }),
  googleCallback
)

module.exports = router
