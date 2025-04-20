const moduleAlias = require('module-alias');

// Register aliases
moduleAlias.addAliases({
  '@root': __dirname,
  '@controllers': __dirname + '/controllers',
  '@models': __dirname + '/models',
  '@middleware': __dirname + '/middleware',
  '@routes': __dirname + '/routes',
  '@utils': __dirname + '/utils',
  '@config': __dirname + '/config',
  '@services': __dirname + '/services',
  '@tests': __dirname + '/tests'
});

module.exports = moduleAlias; 