const os = require('os')

const rateLimit = require('express-rate-limit')
const { ipKeyGenerator } = require('express-rate-limit')
const logger = require('@commonUtils/logger')
const { TooManyRequestsError, ForbiddenError } = require('@errors')

let RedisStore = null
let Redis = null
let redisClient = null

const REDIS_URL = process.env.REDIS_URL
if (REDIS_URL) {
  try {
    RedisStore = require('rate-limit-redis')

    Redis = require('ioredis')

    redisClient = new Redis(REDIS_URL, {
      enableOfflineQueue: false,
      retryStrategy: times => Math.min(times * 50, 2000),
    })

    redisClient.on('error', err => {
      logger.error('Redis connection error for rate limiting:', err)
      redisClient = null
    })

    redisClient.on('connect', () => {
      logger.success('Connected to Redis for rate limiting')
    })
  } catch (e) {
    logger.warn('Redis rate-limit deps not available; falling back to in-memory store', {
      error: e.message,
    })
    // Explicitly set to null to indicate Redis is not available
    RedisStore = null
    Redis = null
    redisClient = null
  }
}

/**
 * Proxy-aware key generator that prefers real client IP when behind proxies/CDNs.
 * Uses ipKeyGenerator helper to properly handle IPv6 addresses.
 */
const proxyAwareKey = req => {
  // Get the primary IP address and apply IPv6 subnet masking
  const primaryIp = req.ip || req.connection?.remoteAddress || 'unknown'
  const ipKey = ipKeyGenerator(primaryIp, 56) // Use /56 subnet for IPv6

  // Get additional proxy headers for enhanced identification
  const proxyHeaders = [
    req.get?.('X-Forwarded-For'),
    req.get?.('X-Real-IP'),
    req.get?.('CF-Connecting-IP'),
  ].filter(Boolean)

  // Combine IP key with proxy headers for more unique identification
  if (proxyHeaders.length > 0) {
    return `${ipKey}:${proxyHeaders.join(':')}`
  }

  return ipKey
}

/**
 * Factory: create a limiter with sane defaults + optional Redis store.
 *
 * @param {object} options express-rate-limit options + extensions below
 * @param {number} options.windowMs
 * @param {number} options.max
 * @param {string} [options.message]
 * @param {number} [options.statusCode]
 * @param {boolean} [options.standardHeaders=true]
 * @param {boolean} [options.legacyHeaders=false]
 * @param {boolean} [options.skipSuccessfulRequests=false]
 * @param {(req)=>boolean} [options.skip]
 * @param {(req,res,next,options)=>void} [options.handler]
 * @param {(req)=>string} [options.keyGenerator]  // default proxy-aware
 * @param {boolean} [options.useRedis=true]       // if REDIS_URL is present
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skip = () => false,
    keyGenerator = proxyAwareKey,
    handler,
    useRedis = true,
  } = options

  const merged = {
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skip,
    keyGenerator,
    handler:
      handler ||
      ((req, res, next) => {
        logger.warn(
          `Rate limit exceeded for key: ${keyGenerator(req)} on ${req.method} ${req.originalUrl}`
        )
        const error = new TooManyRequestsError(message, {
          retryAfter: Math.ceil(windowMs / 1000 / 60),
        })
        next(error)
      }),
  }

  // Attach Redis store if available and desired
  if (useRedis && redisClient && RedisStore) {
    merged.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: 'rl:',
    })
  }

  return rateLimit(merged)
}

/**
 * Adaptive limiter helper – scales max by CPU load heuristic.
 * Uses CPU usage deltas over time intervals and os.loadavg() as fallback.
 * Call .createLimiter({ windowMs, max, ...opts })
 */
class AdaptiveRateLimiter {
  constructor() {
    this.currentMultiplier = 1
    this.loadThreshold = 0.8 // CPU load threshold (0-1)
    this.lastCpuUsage = process.cpuUsage()
    this.lastCpuCheck = Date.now()
    this.cpuCheckInterval = 5000 // Check CPU every 5 seconds
    this.cpuUsageHistory = []
    this.maxHistoryLength = 10 // Keep last 10 measurements
  }

  /**
   * Get current CPU load using multiple methods
   * @returns {number} CPU load percentage (0-1)
   */
  getCurrentCpuLoad() {
    const now = Date.now()
    const timeSinceLastCheck = now - this.lastCpuCheck

    // If enough time has passed, update CPU usage measurement
    if (timeSinceLastCheck >= this.cpuCheckInterval) {
      this.updateCpuUsage()
      this.lastCpuCheck = now
    }

    // Try to get CPU load from our delta calculations first
    const deltaCpuLoad = this.getCpuLoadFromDeltas()
    if (deltaCpuLoad !== null) {
      return deltaCpuLoad
    }

    // Fallback to os.loadavg() - returns 1, 5, and 15 minute averages
    // We use the 1-minute average as it's most responsive
    const loadAvg = os.loadavg()[0] // 1-minute load average
    const cpuCount = os.cpus().length
    const loadPercentage = Math.min(loadAvg / cpuCount, 1) // Normalize to 0-1

    return loadPercentage
  }

  /**
   * Update CPU usage measurement and calculate deltas
   */
  updateCpuUsage() {
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage)
    const timeDelta = Date.now() - this.lastCpuCheck

    // Calculate CPU usage percentage over the time interval
    const totalCpuTime = (currentCpuUsage.user + currentCpuUsage.system) / 1000 // Convert to ms
    const cpuPercentage = Math.min(totalCpuTime / timeDelta, 1) // Cap at 100%

    // Add to history
    this.cpuUsageHistory.push(cpuPercentage)
    if (this.cpuUsageHistory.length > this.maxHistoryLength) {
      this.cpuUsageHistory.shift()
    }

    // Update for next measurement
    this.lastCpuUsage = process.cpuUsage()
  }

  /**
   * Get CPU load from delta calculations
   * @returns {number|null} CPU load percentage or null if insufficient data
   */
  getCpuLoadFromDeltas() {
    if (this.cpuUsageHistory.length < 2) {
      return null // Need at least 2 measurements for meaningful average
    }

    // Calculate average CPU usage from recent measurements
    const sum = this.cpuUsageHistory.reduce((acc, val) => acc + val, 0)
    const average = sum / this.cpuUsageHistory.length

    return average
  }

  /**
   * Get adaptive rate limit based on current CPU load
   * @param {number} baseLimit - Base rate limit
   * @returns {number} Adjusted rate limit
   */
  getAdaptiveLimit(baseLimit) {
    const cpuLoad = this.getCurrentCpuLoad()

    // Adjust multiplier based on CPU load
    if (cpuLoad > this.loadThreshold) {
      // High CPU load - reduce rate limit significantly
      this.currentMultiplier = 0.3
    } else if (cpuLoad > this.loadThreshold * 0.6) {
      // Medium CPU load - reduce rate limit moderately
      this.currentMultiplier = 0.6
    } else {
      // Low CPU load - use full rate limit
      this.currentMultiplier = 1
    }

    const adjustedLimit = Math.floor(baseLimit * this.currentMultiplier)

    // Ensure minimum rate limit of 1
    return Math.max(adjustedLimit, 1)
  }

  /**
   * Create a rate limiter with adaptive limits
   * @param {object} options - Rate limiter options
   * @returns {object} Configured rate limiter
   */
  createLimiter(options) {
    const { max, ...rest } = options
    return createRateLimiter({ max: this.getAdaptiveLimit(max), ...rest })
  }

  /**
   * Get current status for monitoring/debugging
   * @returns {object} Current status information
   */
  getStatus() {
    return {
      currentMultiplier: this.currentMultiplier,
      cpuLoad: this.getCurrentCpuLoad(),
      loadThreshold: this.loadThreshold,
      historyLength: this.cpuUsageHistory.length,
      lastCheck: this.lastCpuCheck,
    }
  }
}
const adaptiveRateLimiter = new AdaptiveRateLimiter()

/**
 * Simple IP blacklist with auto-expiry.
 */
class IPBlacklist {
  constructor() {
    this.blacklist = new Map()
    this.violations = new Map()
    this.blacklistDuration = 60 * 60 * 1000 // 1h
    this.violationThreshold = 5
  }
  addViolation(ip) {
    const count = (this.violations.get(ip) || 0) + 1
    this.violations.set(ip, count)
    if (count >= this.violationThreshold) {
      this.blacklist.set(ip, Date.now())
      this.violations.delete(ip)
      logger.warn(`IP ${ip} has been blacklisted due to repeated violations`)
      setTimeout(() => {
        this.blacklist.delete(ip)
        logger.info(`IP ${ip} removed from blacklist`)
      }, this.blacklistDuration)
    }
  }
  isBlacklisted(ip) {
    return this.blacklist.has(ip)
  }
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || 'unknown'
      if (this.isBlacklisted(ip)) {
        logger.warn(`Blocked request from blacklisted IP: ${ip}`)
        const error = new ForbiddenError('Access denied')
        return next(error)
      }
      next()
    }
  }
}
const ipBlacklist = new IPBlacklist()

// Global API limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests from this IP, please try again after 15 minutes',
  // Admins can skip limiting if you keep this behavior:
  skip: req => Boolean(req.user && req.user.role === 'admin'),
})

// Auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts, please try again after an hour',
})

// Registration endpoints
const createUserLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many accounts created from this IP, please try again after an hour',
})

// Public (QR / menu) endpoints
const publicMenuLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many menu requests, please wait a moment',
})

const publicRestaurantLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many restaurant requests, please wait a moment',
})

const qrCodeScanLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many QR code scans, please wait a moment',
})

const completeMenuLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many complete menu requests, please wait',
})

// Global public limiter (broader safety net)
const globalPublicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many API requests, please slow down',
})

// Very strict DDoS guard (no JSON body to avoid work)
const ddosProtection = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: false,
  handler: (req, res) => {
    const identifier = proxyAwareKey(req)
    logger.error(`Potential DDoS attack from ${identifier}`, {
      ip: req.ip,
      ua: req.get?.('User-Agent'),
      path: req.path,
      ts: new Date().toISOString(),
    })
    res.status(429).end()
  },
})

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  createUserLimiter,
  publicMenuLimiter,
  publicRestaurantLimiter,
  qrCodeScanLimiter,
  completeMenuLimiter,
  globalPublicLimiter,
  ddosProtection,
  adaptiveRateLimiter,
  ipBlacklist,
}
