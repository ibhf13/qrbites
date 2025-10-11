const { asyncHandler } = require('@errors')

const {
  checkApplicationHealth,
  getDetailedHealth,
  getSimpleHealth,
  getReadiness,
  getLiveness,
  getSystemInfo,
} = require('../services/healthService')

/**
 * Health check controller
 * Handles various health check endpoints for monitoring and load balancers
 */

/**
 * Get comprehensive health status
 * @route GET /health
 * @access Public
 */
const getHealth = asyncHandler(async (req, res) => {
  const healthStatus = await checkApplicationHealth()
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(healthStatus)
})

/**
 * Get detailed health information
 * @route GET /health/detailed
 * @access Public
 */
const getDetailedHealthEndpoint = asyncHandler(async (req, res) => {
  const healthStatus = await getDetailedHealth()
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(healthStatus)
})

/**
 * Get simple health status (for load balancers)
 * @route GET /health/simple
 * @access Public
 */
const getSimpleHealthEndpoint = asyncHandler(async (req, res) => {
  const healthStatus = await getSimpleHealth()
  const statusCode = healthStatus.status === 'ok' ? 200 : 503
  res.status(statusCode).json(healthStatus)
})

/**
 * Get readiness status (for Kubernetes readiness probes)
 * @route GET /health/ready
 * @access Public
 */
const getReadinessEndpoint = asyncHandler(async (req, res) => {
  const readiness = await getReadiness()
  const statusCode = readiness.ready ? 200 : 503
  res.status(statusCode).json(readiness)
})

/**
 * Get liveness status (for Kubernetes liveness probes)
 * @route GET /health/live
 * @access Public
 */
const getLivenessEndpoint = asyncHandler(async (req, res) => {
  const liveness = getLiveness()
  res.status(200).json(liveness)
})

/**
 * Get system information
 * @route GET /health/system
 * @access Public
 */
const getSystemInfoEndpoint = asyncHandler(async (req, res) => {
  const systemInfo = getSystemInfo()
  res.status(200).json({
    success: true,
    data: systemInfo,
    timestamp: new Date().toISOString(),
  })
})

module.exports = {
  getHealth,
  getDetailedHealth: getDetailedHealthEndpoint,
  getSimpleHealth: getSimpleHealthEndpoint,
  getReadiness: getReadinessEndpoint,
  getLiveness: getLivenessEndpoint,
  getSystemInfo: getSystemInfoEndpoint,
}
