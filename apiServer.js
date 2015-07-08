let express = require('express');
let fs = require('fs');
let config = require('./config');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let wolframBot = require('./wolframBot');

module.exports = function(){
	console.log('process.env -->', process.env);
	let app = express();
	let port = process.env.PORT || config.get('port');

	// body parser middleware
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(morgan('dev'));

	app.use('/',router());

	let server = app.listen(port, function () {
		console.log('Slack-Wolfram|Alpha listening on port ' + port);
	});

	process.on('SIGINT', function() {
		server.close();
		process.exit();
	});

	function router(){
		var expressRouter = express.Router();
		expressRouter.post('/wolframBot', wolframBot);
		return expressRouter;

	}

};