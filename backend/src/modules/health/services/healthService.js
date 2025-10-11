const { database } = require('@config')
const logger = require('@commonUtils/logger')
const { badRequest, errorMessages, logDatabaseError } = require('@errors')

// Application start time for uptime calculation
const startTime = Date.now()

/**
 * Get application uptime in seconds
 * @returns {number} Uptime in seconds
 */
const getUptime = () => {
  return Math.floor((Date.now() - startTime) / 1000)
}

/**
 * Get system information
 * @returns {Object} System information
 */
const getSystemInfo = () => {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    cpu: {
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
    },
  }
}

/**
 * Check database health
 * @returns {Promise<Object>} Database health status
 */
const checkDatabaseHealth = async () => {
  try {
    return await database.healthCheck()
  } catch (error) {
    logger.error('Database health check failed', { error: error.message })
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Database connection'))
    }
    logDatabaseError(error, 'HEALTH_CHECK', { operation: 'database_health_check' })
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check application health
 * @returns {Promise<Object>} Application health status
 */
const checkApplicationHealth = async () => {
  try {
    const dbHealth = await checkDatabaseHealth()
    const systemInfo = getSystemInfo()

    const healthStatus = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: dbHealth,
      },
      system: systemInfo,
    }

    // Determine overall health status
    if (dbHealth.status !== 'healthy') {
      healthStatus.status = 'unhealthy'
    }

    return healthStatus
  } catch (error) {
    logger.error('Application health check failed', { error: error.message })
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Application health'))
    }
    logDatabaseError(error, 'HEALTH_CHECK', { operation: 'application_health_check' })
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: getUptime(),
    }
  }
}

/**
 * Get detailed health information
 * @returns {Promise<Object>} Detailed health information
 */
const getDetailedHealth = async () => {
  try {
    const [appHealth, dbInfo] = await Promise.all([
      checkApplicationHealth(),
      database.getConnectionInfo(),
    ])

    return {
      ...appHealth,
      services: {
        ...appHealth.services,
        database: {
          ...appHealth.services.database,
          connectionInfo: dbInfo,
        },
      },
    }
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message })
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Detailed health'))
    }
    logDatabaseError(error, 'HEALTH_CHECK', { operation: 'detailed_health_check' })
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: getUptime(),
    }
  }
}

/**
 * Get simple health status (for load balancers)
 * @returns {Promise<Object>} Simple health status
 */
const getSimpleHealth = async () => {
  try {
    const dbHealth = await checkDatabaseHealth()

    return {
      status: dbHealth.status === 'healthy' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Simple health check failed', { error: error.message })
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Simple health'))
    }
    logDatabaseError(error, 'HEALTH_CHECK', { operation: 'simple_health_check' })
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get readiness status (for Kubernetes readiness probes)
 * @returns {Promise<Object>} Readiness status
 */
const getReadiness = async () => {
  try {
    const dbHealth = await checkDatabaseHealth()
    const isReady = dbHealth.status === 'healthy'

    return {
      ready: isReady,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealth.status === 'healthy',
      },
    }
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message })
    if (error.name === 'CastError') {
      throw badRequest(errorMessages.common.invalidIdFormat('Readiness check'))
    }
    logDatabaseError(error, 'HEALTH_CHECK', { operation: 'readiness_check' })
    return {
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    }
  }
}

/**
 * Get liveness status (for Kubernetes liveness probes)
 * @returns {Object} Liveness status
 */
const getLiveness = () => {
  return {
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
  }
}

module.exports = {
  getUptime,
  getSystemInfo,
  checkDatabaseHealth,
  checkApplicationHealth,
  getDetailedHealth,
  getSimpleHealth,
  getReadiness,
  getLiveness,
}
