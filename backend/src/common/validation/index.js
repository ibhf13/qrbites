const commonValidation = require('./commonValidation')
const publicValidation = require('./publicValidation')

module.exports = {
  // Common validation utilities
  validateObjectId: commonValidation.validateObjectId,
  paginationSchema: commonValidation.paginationSchema,
  searchSchema: commonValidation.searchSchema,
  objectIdSchema: commonValidation.objectIdSchema,

  // Public API validation schemas
  menuIdSchema: publicValidation.menuIdSchema,
  restaurantIdSchema: publicValidation.restaurantIdSchema,
  menuItemsQuerySchema: publicValidation.menuItemsQuerySchema,
}
