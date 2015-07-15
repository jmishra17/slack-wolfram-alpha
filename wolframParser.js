let _ = require('lodash');
module.exports = function(data){
	let attachments = [];
	let postFixTitle = data.queryresult.pod[0].subpod[0].plaintext[0];
	return processPodData(data.queryresult.pod);

	function processPodData(pods){
		_.forEach(pods, pod => {
			if(pod.$.async){
				console.log('async pod --->', pod);

			} else {
				_.forEach(pod.subpod, subpod => {
					let attachment = getFinishedAttachment(pod, subpod);
					attachments.push(attachment);
				});
			}
		});
		return {
				attachments:attachments,
				text:'some text'};
	}	

	function getFinishedAttachment(pod, subpod){
		let attachment = {};
		let podTitle = pod.$.title;
		let subpodTitle = subpod.$.title;
		let fullPodTitle = subpodTitle.length > 0 
									? podTitle + " - " + subpodTitle : podTitle; 
		attachment.fallback = fullPodTitle+" | "+postFixTitle;
		// attachment.title = fullPodTitle ;
		attachment.title = subpodTitle ;
		// attachment.text = fullPodTitle;
		attachment.image_url = subpod.img[0].$.src;
		return attachment;

	}	

	function getAsyncAttachment(pod, subpod){
		let attachment = {};

	}
}
