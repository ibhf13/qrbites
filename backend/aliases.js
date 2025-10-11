const path = require('path')

const moduleAlias = require('module-alias')

// Set up module aliases to match jsconfig.json and jest.config.js
moduleAlias.addAliases({
  '@src': path.resolve(__dirname, 'src'),
  '@common': path.resolve(__dirname, 'src/common'),
  '@config': path.resolve(__dirname, 'src/config'),
  '@modules': path.resolve(__dirname, 'src/modules'),
  '@tests': path.resolve(__dirname, 'tests'),
  '@commonMiddlewares': path.resolve(__dirname, 'src/common/middlewares'),
  '@commonUtils': path.resolve(__dirname, 'src/common/utils'),
  '@commonValidation': path.resolve(__dirname, 'src/common/validation'),
  '@commonServices': path.resolve(__dirname, 'src/common/services'),
  '@errors': path.resolve(__dirname, 'src/common/errors'),
})
