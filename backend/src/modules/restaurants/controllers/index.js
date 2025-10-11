const restaurantController = require('./restaurantController')

module.exports = {
  getRestaurants: restaurantController.getRestaurants,
  getRestaurantById: restaurantController.getRestaurantById,
  createRestaurant: restaurantController.createRestaurant,
  updateRestaurant: restaurantController.updateRestaurant,
  deleteRestaurant: restaurantController.deleteRestaurant,
  uploadLogo: restaurantController.uploadLogo,
}
