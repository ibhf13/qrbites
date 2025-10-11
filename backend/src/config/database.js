const mongoose = require('mongoose')
const logger = require('@commonUtils/logger')

const config = require('./environment')

let isConnected = false
let connection = null
let listenersSetup = false

/**
 * Setup database event listeners
 */
const setupEventListeners = () => {
  if (listenersSetup) return
  const db = mongoose.connection

  db.on('connected', () => {
    logger.success('Mongoose connected to MongoDB')
  })

  db.on('error', error => {
    logger.error('Mongoose connection error:', error)
  })

  db.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB')
    isConnected = false
  })

  listenersSetup = true
}

/**
 * Connect to MongoDB with serverless optimization
 */
const connect = async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      logger.info('Database already connected, reusing connection')
      return
    }

    logger.info('Connecting to MongoDB...')

    // Serverless-optimized settings
    const connectionOptions = {
      ...config.MONGODB_OPTIONS,
      // Optimize for serverless
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxIdleTimeMS: 10000, // Close connections if idle for 10s
    }

    // Disable buffering for faster cold starts
    mongoose.set('bufferCommands', false)
    mongoose.set('strictQuery', false)

    // Setup listeners before connecting
    setupEventListeners()

    // Connect
    connection = await mongoose.connect(config.MONGODB_URI, connectionOptions)

    isConnected = true
    logger.success(`Connected to MongoDB: ${connection.connection.host}`)
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error)
    isConnected = false
    throw error
  }
}

/**
 * Disconnect from MongoDB
 */
const disconnect = async () => {
  try {
    if (!isConnected) {
      logger.info('Database not connected')
      return
    }

    logger.info('Disconnecting from MongoDB...')
    await mongoose.disconnect()
    isConnected = false
    connection = null
    logger.success('Disconnected from MongoDB')
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error)
    throw error
  }
}

/**
 * Get connection status
 */
const getConnectionStatus = () => {
  return isConnected && mongoose.connection.readyState === 1
}

/**
 * Get connection info
 */
const getConnectionInfo = () => {
  if (!isConnected) {
    return { status: 'disconnected' }
  }

  const db = mongoose.connection
  return {
    status: 'connected',
    host: db.host,
    port: db.port,
    name: db.name,
    readyState: db.readyState,
    collections: Object.keys(db.collections).length,
  }
}

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    if (!getConnectionStatus()) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        timestamp: new Date().toISOString(),
      }
    }

    // Ping the database
    await mongoose.connection.db.admin().ping()

    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      info: getConnectionInfo(),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Create indexes for all models
 */
const createIndexes = async () => {
  try {
    if (!getConnectionStatus()) {
      throw new Error('Database not connected')
    }

    logger.info('Creating database indexes...')

    // Get all registered models
    const models = mongoose.modelNames()

    // Create indexes for each model
    for (const modelName of models) {
      const model = mongoose.model(modelName)
      if (model.createIndexes) {
        await model.createIndexes()
        logger.debug(`Indexes created for model: ${modelName}`)
      }
    }

    logger.success('Database indexes created successfully')
  } catch (error) {
    logger.error('Error creating database indexes:', error)
    throw error
  }
}

module.exports = {
  connect,
  disconnect,
  getConnectionStatus,
  getConnectionInfo,
  healthCheck,
  createIndexes,
}
