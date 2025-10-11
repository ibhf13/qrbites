const authValidation = require('./authValidation')
const userValidation = require('./userValidation')

module.exports = {
  // Auth validation exports
  registerSchema: authValidation.registerSchema,
  loginSchema: authValidation.loginSchema,
  changePasswordSchema: authValidation.changePasswordSchema,

  // User validation exports
  updateUserSchema: userValidation.updateUserSchema,
}
