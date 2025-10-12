/**
 * Routes Configuration
 * Centralized route mounting and organization
 */

const { healthRoutes } = require('@modules/health/routes')
const authRoutes = require('@modules/users/routes/authRoutes')
const userRoutes = require('@modules/users/routes/userRoutes')
const restaurantRoutes = require('@modules/restaurants/routes/restaurantRoutes')
const menuRoutes = require('@modules/menus/routes/menuRoutes')
const menuItemRoutes = require('@modules/menuItems/routes/menuItemRoutes')
const publicRoutes = require('@modules/users/routes/publicRoutes')
const redirectRoutes = require('@modules/users/routes/redirectRoutes')
const {
    qrCodeScanLimiter,
    globalPublicLimiter,
} = require('@commonMiddlewares/rateLimitMiddleware')

/**
 * Mount all application routes
 * @param {Express.Application} app - Express application instance
 */
const mountRoutes = (app) => {
    // Health check (no rate limiting needed)
    app.use('/health', healthRoutes)

    // QR code redirects (lenient rate limiting)
    app.use('/r', qrCodeScanLimiter, redirectRoutes)

    // Public API endpoints with specific rate limits
    app.use('/api/public', globalPublicLimiter, publicRoutes)

    // Auth routes (have their own specific rate limiters)
    app.use('/api/auth', authRoutes)

    // Protected routes (apply user restaurant filtering)
    app.use('/api/users', userRoutes)
    app.use('/api/restaurants', restaurantRoutes)
    app.use('/api/menus', menuRoutes)
    app.use('/api/menu-items', menuItemRoutes)
}

module.exports = { mountRoutes }

