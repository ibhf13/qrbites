const menuItemController = require('./menuItemController')

module.exports = {
  getMenuItems: menuItemController.getMenuItems,
  getMenuItemById: menuItemController.getMenuItemById,
  createMenuItem: menuItemController.createMenuItem,
  updateMenuItem: menuItemController.updateMenuItem,
  deleteMenuItem: menuItemController.deleteMenuItem,
  uploadImage: menuItemController.uploadImage,
}
