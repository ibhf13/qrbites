const path = require('path')
const moduleAlias = require('module-alias')

// Set up module aliases to match jsconfig.json and jest.config.js
moduleAlias.addAliases({
    '@src': path.resolve(__dirname, 'src'),
    '@models': path.resolve(__dirname, 'src/models'),
    '@controllers': path.resolve(__dirname, 'src/controllers'),
    '@routes': path.resolve(__dirname, 'src/routes'),
    '@middlewares': path.resolve(__dirname, 'src/middlewares'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@config': path.resolve(__dirname, 'src/config'),
    '@tests': path.resolve(__dirname, 'tests'),
    '@seeders': path.resolve(__dirname, 'tests/seeders'),
    '@mocks': path.resolve(__dirname, 'tests/fixtures/mocks'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@validations': path.resolve(__dirname, 'src/validations')
}) 