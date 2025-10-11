const menuValidation = require('./menuValidation')

module.exports = {
  menuSchema: menuValidation.menuSchema,
  menuUpdateSchema: menuValidation.menuUpdateSchema,
}
