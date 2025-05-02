/**
 * Re-export of asyncHandler from errorUtils
 * This file exists to provide a cleaner import path for the middleware
 */
const { asyncHandler } = require('@utils/errorUtils')

module.exports = asyncHandler 