import _ from 'lodash';
import Promise from 'bluebird';
import request from 'request';
import {parseString} from 'xml2js';
let prequest = Promise.promisify(request);
let pParseString = Promise.promisify(parseString);
module.exports = function(data){
	let attachments = [];
	if(data.queryresult.tips){
		return getTipsData(data.queryresult.tips[0]);
	}
	let postFixTitle = data.queryresult.pod[0].subpod[0].plaintext[0];
	return processPodData(data.queryresult.pod);

	async function processPodData(pods){
		let asyncPodPromises = [];
		_.forEach(pods, pod => {
			if(pod.$.async){
				console.log('async ----->');
				let asyncPodPromise = prequest(pod.$.async);
				asyncPodPromises.push(asyncPodPromise);
			} else {
				addPodToAttachments(pod);
			}
		});
		try {
			let asyncPodResults = await* Promise.all(asyncPodPromises);
			let parseToJsonPromises = asyncPodResults.map(asyncPodResult => {
				return pParseString(asyncPodResult[0].body);
			});
			let parseToJsonResults = await* Promise.all(parseToJsonPromises);
			parseToJsonResults.map(jsonResult => {
				addPodToAttachments(jsonResult.pod);
			});
			let text = attachments.length > 1 ? 
						attachments.length + ' results ..' : attachments.length + ' result ..'

			return {
				attachments:attachments,
				text:text
			};
		} catch(err){
			console.log('Error while parsing in wolframParser ---->', err);
		}
	}

	function getTipsData(tipsObj){
		_.forEach(tipsObj.tip, tipObj => {
			let attachment = {};
			attachment.text = tipObj.$.text;
			attachment.fallback = attachment.text;
			attachment.color = "danger";
			attachments.push(attachment);
		});
		return {
			attachments:attachments,
			text:"Error while processing query"
		};
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
		attachment.title = `${fullPodTitle}`;
		// attachment.text = `*${fullPodTitle}*`;
		attachment.image_url = subpod.img[0].$.src;
		return attachment;

	}	
}
