const errorUtils = require('./errorUtils')
const errorLogService = require('./errorLogService')
// Import custom error classes
const ApiError = require('./apiError')
const UnauthorizedError = require('./unauthorizedError')
const ForbiddenError = require('./forbiddenError')
const NotFoundError = require('./notFoundError')
const BadRequestError = require('./badRequestError')
const ConflictError = require('./conflictError')
const ValidationError = require('./validationError')
const ServerError = require('./serverError')
const TooManyRequestsError = require('./tooManyRequestsError')

module.exports = {
  // Custom Error Classes
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  ValidationError,
  ServerError,
  TooManyRequestsError,

  // Utility Functions
  createError: errorUtils.createError,
  badRequest: errorUtils.badRequest,
  unauthorized: errorUtils.unauthorized,
  forbidden: errorUtils.forbidden,
  notFound: errorUtils.notFound,
  conflict: errorUtils.conflict,
  validation: errorUtils.validation,
  serverError: errorUtils.serverError,
  tooManyRequests: errorUtils.tooManyRequests,
  formatMongooseErrors: errorUtils.formatMongooseErrors,
  asyncHandler: errorUtils.asyncHandler,
  errorMessages: errorUtils.errorMessages,

  // Error logging services
  logError: errorLogService.logError,
  logApiError: errorLogService.logApiError,
  logDatabaseError: errorLogService.logDatabaseError,
}
