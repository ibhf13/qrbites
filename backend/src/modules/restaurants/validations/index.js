const restaurantValidation = require('./restaurantValidation')

module.exports = {
  restaurantSchema: restaurantValidation.restaurantSchema,
  restaurantUpdateSchema: restaurantValidation.restaurantUpdateSchema,
}
