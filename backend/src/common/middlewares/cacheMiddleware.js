const NodeCache = require('node-cache')
const logger = require('@commonUtils/logger')

// Cache with default TTL of 10 minutes and check period of 60 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 })

/**
 * Middleware to cache responses for public endpoints
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Middleware function
 */
const cacheMiddleware = (ttl = 600) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Generate a cache key from the request URL
    const cacheKey = req.originalUrl || req.url

    // Try to get cached response
    const cachedResponse = cache.get(cacheKey)

    if (cachedResponse) {
      logger.debug(`Cache hit for ${cacheKey}`)
      return res.json({
        ...cachedResponse,
        cached: true,
      })
    }

    // Cache miss - continue with request
    logger.debug(`Cache miss for ${cacheKey}`)

    // Store original res.json method
    const originalJson = res.json

    // Override res.json method to cache successful responses
    res.json = function (body) {
      // Only cache successful responses with data
      if (body && body.success === true && body.data) {
        logger.debug(`Caching response for ${cacheKey}`)
        cache.set(cacheKey, body, ttl)
      }

      // Call original method
      return originalJson.call(this, body)
    }

    next()
  }
}

/**
 * Clear cache for a specific key pattern
 * @param {string} pattern - Key pattern to clear (e.g., '/api/public/menus/')
 */
const clearCache = pattern => {
  const keys = cache.keys()

  const matchingKeys = keys.filter(key => key.includes(pattern))

  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => cache.del(key))
    logger.info(`Cleared ${matchingKeys.length} cache entries matching pattern: ${pattern}`)
  }
}

module.exports = {
  cacheMiddleware,
  clearCache,
}
