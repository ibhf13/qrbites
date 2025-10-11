const menuItemValidation = require('./menuItemValidation')

module.exports = {
  menuItemSchema: menuItemValidation.menuItemSchema,
  menuItemUpdateSchema: menuItemValidation.menuItemUpdateSchema,
}
