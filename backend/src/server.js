require('module-alias')
require('../aliases')

const { config, connect, createIndexes } = require('@config')
const logger = require('@commonUtils/logger')

const app = require('./app')

/**
 * Start server (local development only)
 */
const startServer = async () => {
  try {
    logger.info('🚀 Starting QrBites API Server...')

    // Connect to database
    await connect()
    await createIndexes()

    // Start server
    const server = app.listen(config.PORT, config.HOST, () => {
      logger.success(`✅ Server running on ${config.HOST}:${config.PORT}`)
      logger.info(`📊 Environment: ${config.NODE_ENV}`)
      logger.info(`🌐 API URL: ${config.API_URL}`)
    })

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`📡 ${signal} received. Shutting down...`)
      server.close(() => {
        logger.success('✅ Server closed')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    logger.error('❌ Server startup error:', error)
    process.exit(1)
  }
}

// Only start server if not in Vercel
if (!process.env.VERCEL) {
  startServer()
}