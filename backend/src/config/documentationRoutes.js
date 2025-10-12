/**
 * API Documentation Routes
 * Swagger/OpenAPI documentation endpoints
 */

const logger = require('@commonUtils/logger')

const swaggerSpec = require('./swagger')
const { generateSwaggerHtml } = require('./swaggerHtml')

/**
 * Mount API documentation routes
 * @param {Express.Application} app - Express application instance
 */
const mountDocumentationRoutes = (app) => {
    // Serve Swagger UI with CDN-hosted assets
    app.get('/api-docs', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol
        const host = req.headers['x-forwarded-host'] || req.get('host')
        const specUrl = `${protocol}://${host}/api-docs.json`
        res.send(generateSwaggerHtml(specUrl))
    })

    // Serve Swagger JSON spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

    // Log documentation URL on startup (only in non-test environments)
    if (process.env.NODE_ENV !== 'test') {
        const port = process.env.PORT || 5000
        logger.info(`📚 API Documentation available at: http://localhost:${port}/api-docs`)
    }
}

module.exports = { mountDocumentationRoutes }

