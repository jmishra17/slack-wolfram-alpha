let config = require('./config');
let _ = require('lodash');
let Promise = require('bluebird');
let http  = require('http');
let qs = require('querystring');
let parseString = require('xml2js').parseString;
let wolframParser = require('./wolframParser');

module.exports = function(req, res, next){
	let triggerWord = req.body.trigger_word;
	let configUsername = process.env.username || config.get('username');
	let configTriggerWords = process.env.triggerWords || config.get('triggerWords');
	let text = req.body.text;
	let equation = text.substr(text.indexOf(' ')+1);
	let appid = process.env.appid || config.get('appid');
	let timeoutBeforeAsync = 
							process.env.timeoutBeforeAsync 
							|| config.get('timeoutBeforeAsync');

	let queryObj = {
		input:equation,
		appid:appid,
		async:timeoutBeforeAsync
	};
	queryObj = _.merge(queryObj, req.query);
	console.log('queryObj --->', queryObj);
	let queryString = qs.stringify(queryObj);

	getWolframRest(queryString).then(response => {
		parseString(response, (err, parsedJson) => {
			console.log('parsedJson --->', parsedJson);
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
				method:'GET',
				async: timeoutBeforeAsync

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