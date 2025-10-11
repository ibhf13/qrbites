const menuDataService = require('./menuDataService')
const qrCodeService = require('./qrCodeService')

module.exports = {
  getCompleteMenuData: menuDataService.getCompleteMenuData,
  processMenuForPublic: menuDataService.processMenuForPublic,
  generateQRCode: qrCodeService.generateQRCode,
  getQRCodeUrl: qrCodeService.getQRCodeUrl,
  generateMenuQRCode: qrCodeService.generateMenuQRCode,
}
