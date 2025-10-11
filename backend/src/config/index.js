const environment = require('./environment')
const database = require('./database')
const cloudinary = require('./cloudinary')

module.exports = {
  environment,
  database,
  cloudinary,

  config: environment,
  db: database,

  ...database,
}