/**
 * Health Check Routes with OpenAPI Documentation
 * These endpoints are used for monitoring, load balancers, and container orchestration
 * @module routes/healthRoutes
 */

const express = require('express')

const {
  getHealth,
  getDetailedHealth,
  getSimpleHealth,
  getReadiness,
  getLiveness,
  getSystemInfo,
} = require('../controllers/healthController')

const router = express.Router()

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Main health check endpoint
 *     description: Returns the health status of the API, including database connectivity and uptime.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-15T10:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                   description: Server uptime in seconds
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.get('/', getHealth)

/**
 * @openapi
 * /health/detailed:
 *   get:
 *     summary: Detailed health information
 *     description: Returns comprehensive health information including memory usage, CPU, and system metrics.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Detailed health information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: connected
 *                     responseTime:
 *                       type: number
 *                       example: 5
 *                 memory:
 *                   type: object
 *                   properties:
 *                     heapUsed:
 *                       type: number
 *                       example: 45678912
 *                     heapTotal:
 *                       type: number
 *                       example: 67108864
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/detailed', getDetailedHealth)

/**
 * @openapi
 * /health/simple:
 *   get:
 *     summary: Simple health check
 *     description: Lightweight health check for load balancers and simple monitoring. Returns 200 OK if service is running.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
router.get('/simple', getSimpleHealth)

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Kubernetes readiness probe
 *     description: Indicates whether the service is ready to accept traffic. Checks database connectivity.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not ready
 *                 reason:
 *                   type: string
 *                   example: Database not connected
 */
router.get('/ready', getReadiness)

/**
 * @openapi
 * /health/live:
 *   get:
 *     summary: Kubernetes liveness probe
 *     description: Indicates whether the service is alive and should not be restarted.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 */
router.get('/live', getLiveness)

/**
 * @openapi
 * /health/system:
 *   get:
 *     summary: System information
 *     description: Returns system information including Node.js version, platform, and environment.
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: System information retrieved successfully
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
 *                     nodeVersion:
 *                       type: string
 *                       example: v20.10.0
 *                     platform:
 *                       type: string
 *                       example: linux
 *                     environment:
 *                       type: string
 *                       example: production
 *                     cpus:
 *                       type: number
 *                       example: 4
 *                     totalMemory:
 *                       type: number
 *                       example: 8589934592
 */
router.get('/system', getSystemInfo)

module.exports = router
