const logger = require('./logger')
const sanitization = require('./sanitization')
const paginationUtils = require('./paginationUtils')
const fileUploadUtils = require('./fileUploadUtils')

module.exports = {
  // Logging utility
  logger,

  // Sanitization utilities (helper functions)
  escapeRegexChars: sanitization.escapeRegexChars,
  sanitizeSearchInput: sanitization.sanitizeSearchInput,
  createSafeRegexQuery: sanitization.createSafeRegexQuery,
  createSafeSearchQuery: sanitization.createSafeSearchQuery,
  sanitizeRegexPattern: sanitization.sanitizeRegexPattern,
  MAX_SEARCH_LENGTH: sanitization.MAX_SEARCH_LENGTH,
  MAX_REGEX_LENGTH: sanitization.MAX_REGEX_LENGTH,

  // Pagination utilities
  parsePaginationParams: paginationUtils.parsePaginationParams,
  buildSortObject: paginationUtils.buildSortObject,
  buildPaginationResponse: paginationUtils.buildPaginationResponse,
  paginate: paginationUtils.paginate,
  buildQueryFilters: paginationUtils.buildQueryFilters,
  createPaginatedController: paginationUtils.createPaginatedController,
  DEFAULT_PAGINATION: paginationUtils.DEFAULT_PAGINATION,

  // File upload utilities
  attachFileUrl: fileUploadUtils.attachFileUrl,
  attachFileUrls: fileUploadUtils.attachFileUrls,
  updateDocumentWithFileUrl: fileUploadUtils.updateDocumentWithFileUrl,
  validateFileUpload: fileUploadUtils.validateFileUpload,
}
