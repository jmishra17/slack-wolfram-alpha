let config = require('./config');
let _ = require('lodash');
let Promise = require('bluebird');
let http  = require('http');
let qs = require('querystring');
let parseString = require('xml2js').parseString;
let wolframParser = require('./wolframParser');

module.exports = function(req, res, next){
	console.log('req.body -->', req.body);
	console.log('process.env.username -->', process.env.username);
	console.log('process.env.triggerWords -->', process.env.triggerWords);
	let triggerWord = req.body.trigger_word;
	let configUsername = process.env.username || config.get('username');
	let configTriggerWords = process.env.triggerWords || config.get('triggerWords');
	// if(configUsername !== req.body.user_name){
	// 	return res.status(200).json({text:"bad username"}).end();
	// }
	// if(_.indexOf(configTriggerWords, triggerWord) === -1){
	// 	return res.status(200).send({text:'bad triggerWord'}).end();
	// }

	let text = req.body.text;
	let equation = text.substr(text.indexOf(' ')+1);
	let appid = process.env.appid || config.get('appid');
	let queryObj = {
		input:equation,
		appid:appid
	};

	let queryString = qs.stringify(queryObj);

	getWolframRest(queryString).then(response => {
		parseString(response, (err, parsedJson) => {
			let attachments = wolframParser(parsedJson);
			res.status(200).json(attachments);
		});
	});

	function getWolframRest(queryString){
		return new Promise((resolve, reject) => {
			let host = process.env.host || config.get('host');
			let path = process.env.path || config.get('path');
			let options = {
				host:host,
				path:path+"?"+queryString,
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