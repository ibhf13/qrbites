const menuController = require('./menuController')

module.exports = {
  getMenus: menuController.getMenus,
  getMenuById: menuController.getMenuById,
  createMenu: menuController.createMenu,
  updateMenu: menuController.updateMenu,
  deleteMenu: menuController.deleteMenu,
  uploadImage: menuController.uploadImage,
  generateQRCode: menuController.generateQRCode,
}
