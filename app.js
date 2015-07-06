require('babel/register')({
  optional: ['runtime', 'es7.asyncFunctions']
});
var apiServer = require('./apiServer');
apiServer();