import config from './config';
import _ from 'lodash';
import Promise from 'bluebird';
import http from 'http';
import qs from 'querystring';
import wolframParser from './wolframParser';
import request from 'request';
import {parseString} from 'xml2js';
let prequest = Promise.promisify(request);
let pParseString = Promise.promisify(parseString);

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
	let queryString = qs.stringify(queryObj);
	getData(queryString).then(result => {
		res.status(200).json(result);
	});

	async function getData(queryString){
		let host = process.env.host || config.get('host');
		let path = process.env.path || config.get('path');
		let url = host + path + "?" + queryString;
		let wolframResponse = await prequest(url);
		let jsonBody = await pParseString(wolframResponse[0].body);
		let attachmentsObj  = await wolframParser(jsonBody);
		return attachmentsObj;
	}
}