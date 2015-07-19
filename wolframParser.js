import _ from 'lodash';
import Promise from 'bluebird';
import request from 'request';
import {parseString} from 'xml2js';
let prequest = Promise.promisify(request);
let pParseString = Promise.promisify(parseString);
module.exports = function(data){
	let attachments = [];
	let postFixTitle = data.queryresult.pod[0].subpod[0].plaintext[0];
	return processPodData(data.queryresult.pod);

	async function processPodData(pods){
		let asyncPodPromises = [];
		_.forEach(pods, pod => {
			if(pod.$.async){
				let asyncPodPromise = prequest(pod.$.async);
				asyncPodPromises.push(asyncPodPromise);
			} else {
				addPodToAttachments(pod);
			}
		});
		let asyncPodResults = await* Promise.all(asyncPodPromises);
		let parseToJsonPromises = asyncPodResults.map(asyncPodResult => {
			return pParseString(asyncPodResult[0].body);
		});
		let parseToJsonResults = await* Promise.all(parseToJsonPromises);
		parseToJsonResults.map(jsonResult => {
			addPodToAttachments(jsonResult.pod);
		});
		let text = attachments.length > 1 ? 
					attachments.length + ' results..' : attachments.length + ' result..'

		return {
					attachments:attachments,
					text:text};
	}

	function addPodToAttachments(pod){
		_.forEach(pod.subpod, subpod => {
			let attachment = getAttachment(pod, subpod);
			attachments.push(attachment);
		});
	}

	function getAttachment(pod, subpod){
		let attachment = {};
		let podTitle = pod.$.title;
		let subpodTitle = subpod.$.title;
		let fullPodTitle = subpodTitle.length > 0 
									? podTitle + " - " + subpodTitle : podTitle; 
		attachment.fallback = fullPodTitle+" | "+postFixTitle;
		attachment.color = "#77a5b6";
		attachment.title = subpodTitle;
		attachment.text = `*${fullPodTitle}*`;
		attachment.image_url = subpod.img[0].$.src;
		return attachment;

	}	
}
