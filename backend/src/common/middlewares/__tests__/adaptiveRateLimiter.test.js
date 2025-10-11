const { adaptiveRateLimiter } = require('../rateLimitMiddleware')

describe('AdaptiveRateLimiter', () => {
  let adaptiveLimiter

  beforeEach(() => {
    adaptiveLimiter = adaptiveRateLimiter
  })

  describe('getCurrentCpuLoad', () => {
    it('should return a value between 0 and 1', () => {
      const cpuLoad = adaptiveLimiter.getCurrentCpuLoad()
      expect(cpuLoad).toBeGreaterThanOrEqual(0)
      expect(cpuLoad).toBeLessThanOrEqual(1)
    })

    it('should use os.loadavg() as fallback when no delta data available', () => {
      // Force the limiter to use fallback by clearing history
      adaptiveLimiter.cpuUsageHistory = []
      adaptiveLimiter.lastCpuCheck = Date.now() - 10000 // Force update

      const cpuLoad = adaptiveLimiter.getCurrentCpuLoad()
      expect(cpuLoad).toBeGreaterThanOrEqual(0)
      expect(cpuLoad).toBeLessThanOrEqual(1)
    })
  })

  describe('getAdaptiveLimit', () => {
    it('should return at least 1 even with high CPU load', () => {
      // Mock high CPU load
      jest.spyOn(adaptiveLimiter, 'getCurrentCpuLoad').mockReturnValue(0.9)

      const limit = adaptiveLimiter.getAdaptiveLimit(100)
      expect(limit).toBeGreaterThanOrEqual(1)
    })

    it('should reduce limit under high CPU load', () => {
      // Mock high CPU load
      jest.spyOn(adaptiveLimiter, 'getCurrentCpuLoad').mockReturnValue(0.9)

      const limit = adaptiveLimiter.getAdaptiveLimit(100)
      expect(limit).toBeLessThan(100)
      expect(limit).toBe(30) // 0.3 multiplier
    })

    it('should use full limit under low CPU load', () => {
      // Mock low CPU load
      jest.spyOn(adaptiveLimiter, 'getCurrentCpuLoad').mockReturnValue(0.3)

      const limit = adaptiveLimiter.getAdaptiveLimit(100)
      expect(limit).toBe(100) // 1.0 multiplier
    })

    it('should use moderate reduction under medium CPU load', () => {
      // Mock medium CPU load
      jest.spyOn(adaptiveLimiter, 'getCurrentCpuLoad').mockReturnValue(0.6)

      const limit = adaptiveLimiter.getAdaptiveLimit(100)
      expect(limit).toBe(60) // 0.6 multiplier
    })
  })

  describe('updateCpuUsage', () => {
    it('should maintain history within max length', () => {
      // Fill history beyond max length
      for (let i = 0; i < 15; i++) {
        adaptiveLimiter.updateCpuUsage()
      }

      expect(adaptiveLimiter.cpuUsageHistory.length).toBeLessThanOrEqual(
        adaptiveLimiter.maxHistoryLength
      )
    })

    it('should calculate CPU percentage correctly', () => {
      // Clear history to ensure we can add one item
      adaptiveLimiter.cpuUsageHistory = []
      const initialLength = adaptiveLimiter.cpuUsageHistory.length
      adaptiveLimiter.updateCpuUsage()

      expect(adaptiveLimiter.cpuUsageHistory.length).toBe(initialLength + 1)

      const lastMeasurement =
        adaptiveLimiter.cpuUsageHistory[adaptiveLimiter.cpuUsageHistory.length - 1]
      expect(lastMeasurement).toBeGreaterThanOrEqual(0)
      expect(lastMeasurement).toBeLessThanOrEqual(1)
    })
  })

  describe('getStatus', () => {
    it('should return status object with expected properties', () => {
      const status = adaptiveLimiter.getStatus()

      expect(status).toHaveProperty('currentMultiplier')
      expect(status).toHaveProperty('cpuLoad')
      expect(status).toHaveProperty('loadThreshold')
      expect(status).toHaveProperty('historyLength')
      expect(status).toHaveProperty('lastCheck')

      expect(typeof status.currentMultiplier).toBe('number')
      expect(typeof status.cpuLoad).toBe('number')
      expect(typeof status.loadThreshold).toBe('number')
      expect(typeof status.historyLength).toBe('number')
      expect(typeof status.lastCheck).toBe('number')
    })
  })

  describe('createLimiter', () => {
    it('should create a rate limiter with adaptive limits', () => {
      const limiter = adaptiveLimiter.createLimiter({
        windowMs: 60000,
        max: 100,
      })

      expect(limiter).toBeDefined()
      expect(typeof limiter).toBe('function') // express-rate-limit returns middleware function
    })
  })
})
