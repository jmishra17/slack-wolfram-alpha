import _ from 'lodash';
import Promise from 'bluebird';
import request from 'request';
import {parseString} from 'xml2js';
let prequest = Promise.promisify(request);
let pParseString = Promise.promisify(parseString);
module.exports = function(data){
	if(data.queryresult.tips){
		return getTipsData(data.queryresult.tips[0]);
	}
	let postFixTitle = data.queryresult.pod[0].subpod[0].plaintext[0];
	return processPodData(data.queryresult.pod);

	async function processPodData(pods){
		let asyncPodPromises = [], syncAttachments = [], asyncAttachments = [];
		_.forEach(pods, pod => {
			if(pod.$.async){
				let asyncPodPromise = prequest(pod.$.async);
				asyncPodPromises.push(asyncPodPromise);
			} else {
				addAttachmentToArray(pod, syncAttachments);
			}
		});
		try {
			let asyncPodResults = await* Promise.all(asyncPodPromises);
			let parseToJsonPromises = asyncPodResults.map(asyncPodResult => {
				return pParseString(asyncPodResult[0].body);
			});
			let parseToJsonResults = await* Promise.all(parseToJsonPromises);
			parseToJsonResults.map(jsonResult => {
				addAttachmentToArray(jsonResult.pod, asyncAttachments);
			});
			console.log('syncAttachments.length -->', syncAttachments.length);
			console.log('asyncAttachments.length -->', asyncAttachments.length);

			let allAtachments = _.merge(syncAttachments, asyncAttachments);
			let text = allAtachments.length > 1 ? 
						allAtachments.length + ' results ..' : allAtachments.length + ' result ..';

			return {
				attachments:allAtachments,
				text:text
			};
		} catch(err){
			console.log('Error while parsing in wolframParser ---->', err);
		}
	}

	function getTipsData(tipsObj){
		let attachments = [];
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

	function addAttachmentToArray(pod, attachmentsArray){
		_.forEach(pod.subpod, subpod => {
			let attachment = getAttachment(pod, subpod);
			attachmentsArray.push(attachment);
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
