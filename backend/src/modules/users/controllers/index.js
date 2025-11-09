const authController = require('./authController')
const userController = require('./userController')
const publicController = require('./publicController')
const oauthController = require('./oauthController')

module.exports = {
  // Auth controller exports
  register: authController.register,
  login: authController.login,
  getMe: authController.getMe,
  changePassword: authController.changePassword,

  // OAuth controller exports
  googleCallback: oauthController.googleCallback,

  // User controller exports
  getUsers: userController.getUsers,
  getUserById: userController.getUserById,
  updateUser: userController.updateUser,
  deleteUser: userController.deleteUser,
  deactivateAccount: userController.deactivateAccount,

  // Public controller exports
  getPublicRestaurant: publicController.getPublicRestaurant,
  getPublicMenu: publicController.getPublicMenu,
  getPublicMenuItems: publicController.getPublicMenuItems,
  getCompletePublicMenu: publicController.getCompletePublicMenu,
  redirectToMenu: publicController.redirectToMenu,
}
