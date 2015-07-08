let config = require('./config');
let _ = require('lodash');
let Promise = require('bluebird');
let http  = require('http');
let qs = require('querystring');
let parseString = require('xml2js').parseString;
let wolframParser = require('./wolframParser');

module.exports = function(req, res, next){
	let triggerWord = req.body.trigger_word;
	if(config.get('username') !== req.body.user_name){
		return res.status(200).json({text:"bad username"}).end();
	}
	if(_.indexOf(config.get('triggerWords'), triggerWord) === -1){
		return res.status(200).send('bad triggerWord').end();
	}

	let text = req.body.text;
	let equation = text.substr(text.indexOf(' ')+1);
	let queryObj = {
		input:equation,
		appid:config.get('appid')
	};

	let queryString = qs.stringify(queryObj);

	getWolframRest(queryString).then(response => {
		parseString(response, (err, parsedJson) => {
			let attachments = wolframParser(parsedJson);
			res.status(200).send(attachments);
		});
	});

	function getWolframRest(queryString){
		return new Promise((resolve, reject) => {
			let options = {
				host:config.get('host'),
				path:config.get('path')+queryString,
				method:'GET'
			};
			let wolframReq = http.request(options, wolframRes => {
				let str = '';
				wolframRes.on('data', function (chunk) {
					str += chunk;
				});
				wolframRes.on('error', wolframError => {
					reject(error);
				});

				wolframRes.on('end', () => {
					resolve(str);
				});

			});
			wolframReq.on('error', function (e) {
				reject(e);
			});
			wolframReq.end();

		});

	}
}