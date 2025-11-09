const environment = require('./environment')
const database = require('./database')
const cloudinary = require('./cloudinary')
const swagger = require('./swagger')
const security = require('./security')
const middlewareConfig = require('./middlewareConfig')
const routes = require('./routes')
const documentationRoutes = require('./documentationRoutes')

module.exports = {
  environment,
  database,
  cloudinary,
  swagger,
  security,
  middlewareConfig,
  routes,
  documentationRoutes,

  // Aliases for backward compatibility
  config: environment,
  db: database,

  ...database,
}
