require('module-alias/register')
require('../aliases')
require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')
const logger = require('@utils/logger')

// Import advanced services
const { performanceOptimizer } = require('@services/performanceOptimizer')
const { initializeMonitoring } = require('@services/monitoringService')
const { AdvancedCacheManager, getCacheWarmupStrategies } = require('@services/advancedCachingService')
const { DatabaseOptimizer } = require('../scripts/optimizeDatabase')

/**
 * Enterprise Server Class with comprehensive features
 */
class QrBitesServer {
  constructor() {
    this.port = process.env.PORT || 5000
    this.environment = process.env.NODE_ENV || 'development'
    this.startTime = Date.now()
    this.isShuttingDown = false

    // Server health tracking
    this.health = {
      status: 'starting',
      database: 'disconnected',
      cache: 'inactive',
      monitoring: 'inactive',
      startTime: new Date(),
      uptime: 0
    }
  }

  /**
   * Initialize database connection with optimization
   */
  async initializeDatabase() {
    try {
      logger.info('📊 Initializing database connection...')

      // Connection options optimized for production
      const connectionOptions = {
        // Connection pooling
        maxPoolSize: this.environment === 'production' ? 10 : 5,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,

        // Performance optimizations
        bufferCommands: false,

        // Stability options
        retryWrites: true,
        w: 'majority',

        // Monitoring
        monitorCommands: this.environment !== 'production'
      }

      await mongoose.connect(process.env.MONGODB_URI, connectionOptions)

      this.health.database = 'connected'
      logger.success('✅ MongoDB connected successfully')

      // Set up database event listeners
      this.setupDatabaseEventListeners()

      // Auto-optimize database in production
      if (this.environment === 'production') {
        await this.optimizeDatabaseOnStartup()
      }

    } catch (error) {
      this.health.database = 'error'
      logger.error('❌ MongoDB connection failed:', error)
      throw error
    }
  }

  /**
   * Setup database event listeners for monitoring
   */
  setupDatabaseEventListeners() {
    const db = mongoose.connection

    db.on('error', (error) => {
      logger.error('Database error:', error)
      this.health.database = 'error'
    })

    db.on('disconnected', () => {
      logger.warn('Database disconnected')
      this.health.database = 'disconnected'
    })

    db.on('reconnected', () => {
      logger.info('Database reconnected')
      this.health.database = 'connected'
    })

    db.on('close', () => {
      logger.info('Database connection closed')
      this.health.database = 'closed'
    })

    // Monitor slow queries in development
    if (this.environment === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`DB Query: ${collectionName}.${method}`, { query })
      })
    }
  }

  /**
   * Auto-optimize database on startup (production only)
   */
  async optimizeDatabaseOnStartup() {
    try {
      logger.info('⚡ Running database optimization...')

      const optimizer = new DatabaseOptimizer()
      await optimizer.runOptimization({
        createIndexes: true,
        analyzeQueries: false, // Skip analysis on startup
        optimizeSettings: true,
        createTTL: true,
        validateIntegrity: false, // Skip validation on startup
        generateReport: false // Skip report on startup
      })

      logger.success('✅ Database optimization completed')

    } catch (error) {
      logger.warn('⚠️  Database optimization failed (non-critical):', error.message)
      // Don't fail startup for optimization issues
    }
  }

  /**
   * Initialize advanced caching system
   */
  async initializeCache() {
    try {
      logger.info('🚀 Initializing advanced caching system...')

      this.health.cache = 'active'

      // Warm up cache with frequently accessed data
      const warmupStrategies = getCacheWarmupStrategies()
      await AdvancedCacheManager.warmCache(warmupStrategies)

      logger.success('✅ Advanced caching system initialized')

    } catch (error) {
      this.health.cache = 'error'
      logger.error('❌ Cache initialization failed:', error)
      // Don't fail startup for cache issues
    }
  }

  /**
   * Initialize monitoring and performance tracking
   */
  async initializeMonitoring() {
    try {
      logger.info('📊 Initializing monitoring systems...')

      // Initialize performance optimizer
      performanceOptimizer.initialize()

      // Initialize monitoring service
      initializeMonitoring()

      this.health.monitoring = 'active'
      logger.success('✅ Monitoring systems initialized')

    } catch (error) {
      this.health.monitoring = 'error'
      logger.error('❌ Monitoring initialization failed:', error)
      // Don't fail startup for monitoring issues
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) {
        logger.warn(`${signal} received during shutdown, forcing exit`)
        process.exit(1)
      }

      this.isShuttingDown = true
      logger.info(`${signal} received, starting graceful shutdown...`)

      this.health.status = 'shutting_down'

      try {
        // Stop accepting new connections
        if (this.server) {
          logger.info('🔄 Closing HTTP server...')
          await new Promise((resolve) => {
            this.server.close(resolve)
          })
          logger.info('✅ HTTP server closed')
        }

        // Close database connections
        if (mongoose.connection.readyState === 1) {
          logger.info('🔄 Closing database connections...')
          await mongoose.connection.close()
          logger.info('✅ Database connections closed')
        }

        // Clear caches
        logger.info('🔄 Clearing caches...')
        AdvancedCacheManager.clearAll()
        logger.info('✅ Caches cleared')

        // Final cleanup
        logger.info('🎯 Graceful shutdown completed')
        process.exit(0)

      } catch (error) {
        logger.error('❌ Error during shutdown:', error)
        process.exit(1)
      }
    }

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      logger.error('🚨 CRITICAL: Uncaught Exception', error)
      gracefulShutdown('UNCAUGHT_EXCEPTION')
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 CRITICAL: Unhandled Rejection', { reason, promise })
      gracefulShutdown('UNHANDLED_REJECTION')
    })
  }

  /**
   * Setup process monitoring and health checks
   */
  setupProcessMonitoring() {
    // Update health status periodically
    setInterval(() => {
      this.health.uptime = Date.now() - this.startTime

      // Check memory usage
      const memUsage = process.memoryUsage()
      this.health.memory = {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      }

      // Update status based on components
      if (this.health.database === 'connected' &&
        this.health.cache === 'active' &&
        this.health.monitoring === 'active') {
        this.health.status = 'healthy'
      } else if (this.health.database === 'connected') {
        this.health.status = 'degraded'
      } else {
        this.health.status = 'unhealthy'
      }

    }, 30000) // Every 30 seconds
  }

  /**
   * Start the server with all enterprise features
   */
  async start() {
    try {
      logger.info('🚀 STARTING QRBITES ENTERPRISE SERVER', null, true)
      logger.info(`Environment: ${this.environment}`)
      logger.info(`Node.js: ${process.version}`)
      logger.info(`Platform: ${process.platform} ${process.arch}`)
      logger.info('='.repeat(50))

      // Initialize database
      await this.initializeDatabase()

      // Initialize caching system
      await this.initializeCache()

      // Initialize monitoring
      await this.initializeMonitoring()

      // Setup graceful shutdown
      this.setupGracefulShutdown()

      // Setup process monitoring
      this.setupProcessMonitoring()

      // Start HTTP server
      this.server = app.listen(this.port, () => {
        const uptime = Date.now() - this.startTime
        this.health.status = 'healthy'

        logger.success('='.repeat(50))
        logger.success('🎉 QRBITES SERVER STARTED SUCCESSFULLY!', null, true)
        logger.success(`🌐 Server: http://localhost:${this.port}`)
        logger.success(`⚡ Environment: ${this.environment}`)
        logger.success(`🏃‍♂️ Startup time: ${uptime}ms`)
        logger.success(`📊 Health: ${this.health.status}`)
        logger.success('='.repeat(50))

        // Log feature status
        this.logFeatureStatus()
      })

      // Server error handling
      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${this.port} is already in use`)
        } else {
          logger.error('❌ Server error:', error)
        }
        process.exit(1)
      })

      return this.server

    } catch (error) {
      logger.error('❌ Failed to start server:', error)
      process.exit(1)
    }
  }

  /**
   * Log the status of all enterprise features
   */
  logFeatureStatus() {
    logger.info('\n🌟 ENTERPRISE FEATURES STATUS:')
    logger.info(`📊 Database: ${this.health.database}`)
    logger.info(`🚀 Cache: ${this.health.cache}`)
    logger.info(`📈 Monitoring: ${this.health.monitoring}`)

    // Log Cloudinary status
    try {
      const { isCloudinaryConfigured } = require('@services/cloudinaryService')
      logger.info(`☁️  Cloudinary: ${isCloudinaryConfigured ? 'configured' : 'not configured'}`)
    } catch (error) {
      logger.info('☁️  Cloudinary: error checking status')
    }

    // Log cache stats
    try {
      const cacheStats = AdvancedCacheManager.getStats()
      logger.info(`💾 Cache Hit Rate: ${cacheStats.hitRate}%`)
    } catch (error) {
      logger.info('💾 Cache: stats unavailable')
    }

    // Log available endpoints
    logger.info('\n🛣️  KEY ENDPOINTS:')
    logger.info(`📍 Health Check: http://localhost:${this.port}/health`)
    logger.info(`📍 API Docs: http://localhost:${this.port}/api`)
    logger.info(`📍 Monitoring: http://localhost:${this.port}/api/admin/stats`)

    if (this.environment === 'development') {
      logger.info(`📍 Test Cloudinary: http://localhost:${this.port}/api/test-cloudinary`)
    }

    logger.info('\n🔥 Server is ready to handle production traffic!\n')
  }

  /**
   * Get current server health status
   */
  getHealth() {
    return {
      ...this.health,
      timestamp: new Date(),
      environment: this.environment,
      version: process.env.npm_package_version || '1.0.0'
    }
  }
}

// Create and export server instance
const qrBitesServer = new QrBitesServer()

// Add health endpoint to app (for health checks)
app.get('/health', (req, res) => {
  const health = qrBitesServer.getHealth()
  const statusCode = health.status === 'healthy' ? 200 :
    health.status === 'degraded' ? 200 : 503

  res.status(statusCode).json({
    success: health.status === 'healthy',
    ...health
  })
})

// Enhanced system info endpoint
app.get('/api/system-info', (req, res) => {
  const health = qrBitesServer.getHealth()
  const cacheStats = AdvancedCacheManager.getStats()

  res.json({
    success: true,
    data: {
      server: health,
      cache: cacheStats,
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: {
          node: process.version,
          platform: process.platform,
          arch: process.arch
        }
      },
      features: {
        cloudinary: require('@services/cloudinaryService').isCloudinaryConfigured,
        monitoring: health.monitoring === 'active',
        caching: health.cache === 'active',
        database: health.database === 'connected'
      }
    }
  })
})

// Start server if this file is run directly
if (require.main === module) {
  qrBitesServer.start().catch(error => {
    logger.error('🚨 CRITICAL: Server startup failed:', error)
    process.exit(1)
  })
}

// Export for testing and module use
module.exports = {
  app,
  server: qrBitesServer,
  startServer: () => qrBitesServer.start(),
  getHealth: () => qrBitesServer.getHealth()
}