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
 * Health check routes
 * These endpoints are used for monitoring, load balancers, and container orchestration
 */

// Main health check endpoint
router.get('/', getHealth)

// Detailed health information
router.get('/detailed', getDetailedHealth)

// Simple health check (for load balancers)
router.get('/simple', getSimpleHealth)

// Kubernetes readiness probe
router.get('/ready', getReadiness)

// Kubernetes liveness probe
router.get('/live', getLiveness)

// System information
router.get('/system', getSystemInfo)

module.exports = router
