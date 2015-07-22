let express = require('express');
let fs = require('fs');
let config = require('./config');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let wolframBot = require('./wolframBot');

console.log('process.env -->', process.env);
let app = express();
let port = process.env.PORT || config.get('port');

// app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/',router());

process.on('SIGINT', function() {
	server.close();
	process.exit();
});

function router(){
	var expressRouter = express.Router();
	expressRouter.post('/wolframBot', wolframBot);
	expressRouter.get('/someGet', function(req, res){
		res.status(200).json({a:'result'});
	});	
	return expressRouter;
}

function start(){
	app.listen(port, function () {
		console.log('Slack-Wolfram|Alpha listening on port ' + port);
	});
}

exports.start = start;

exports.app = app;

