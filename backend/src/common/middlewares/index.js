const authMiddleware = require('./authMiddleware')
const {
  corsMiddleware,
  imageFileCorsMiddleware,
} = require('./corsMiddleware')
const { notFoundMiddleware, errorHandlerMiddleware } = require('./errorMiddleware')
const loggerMiddleware = require('./loggerMiddleware')
const {
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
} = require('./rateLimitMiddleware')
const { validateAndUpload, cleanupOnError } = require('./uploadValidationMiddleware')
const { validateRequest, validateParams, validateQuery } = require('./validationMiddleware')
const { cacheMiddleware } = require('./cacheMiddleware')

module.exports = {
  // auth
  protect: authMiddleware.protect,
  restrictTo: authMiddleware.restrictTo,
  optionalAuth: authMiddleware.optionalAuth,
  addUserRestaurants: authMiddleware.addUserRestaurants,
  checkResourceOwnership: authMiddleware.checkResourceOwnership,
  checkRestaurantOwnership: authMiddleware.checkRestaurantOwnership,
  checkMenuOwnership: authMiddleware.checkMenuOwnership,
  checkMenuItemOwnership: authMiddleware.checkMenuItemOwnership,
  checkMenuOwnershipForCreation: authMiddleware.checkMenuOwnershipForCreation,
  checkRestaurantOwnershipForCreation: authMiddleware.checkRestaurantOwnershipForCreation,

  // cors
  corsMiddleware,
  imageFileCorsMiddleware,

  // errors
  notFoundMiddleware,
  errorHandlerMiddleware,

  // logging
  loggerMiddleware,

  // rate limiting (unified)
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

  // uploads
  validateAndUpload,
  cleanupOnError,

  // validation
  validateRequest,
  validateParams,
  validateQuery,

  // cache
  cacheMiddleware,
}
