const Joi = require('joi')
const {
  validateObjectId,
  paginationSchema,
  searchSchema,
} = require('@commonValidation/commonValidation')

const menuIdSchema = Joi.object({
  menuId: Joi.string().custom(validateObjectId).required().messages({
    'any.required': 'Menu ID is required',
    'any.invalid': 'Invalid menu ID format',
  }),
})

const restaurantIdSchema = Joi.object({
  restaurantId: Joi.string().custom(validateObjectId).required().messages({
    'any.required': 'Restaurant ID is required',
    'any.invalid': 'Invalid restaurant ID format',
  }),
})

const menuItemsQuerySchema = Joi.object({
  ...paginationSchema,
  ...searchSchema,
  category: Joi.string().trim().allow(''),
}).options({ stripUnknown: true })

module.exports = {
  menuIdSchema,
  restaurantIdSchema,
  menuItemsQuerySchema,
}
