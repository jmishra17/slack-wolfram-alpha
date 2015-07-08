let _ = require('lodash');
module.exports = function(data){
	let attachments = [];
	let postFixTitle = data.queryresult.pod[0].subpod[0].plaintext[0];
	return processPodData(data.queryresult.pod)

	function processPodData(pods){
		_.forEach(pods, pod => {
			_.forEach(pod.subpod, subpod => {
				let attachment = {};
				let podTitle = pod.$.title;
				let subpodTitle = subpod.$.title;
				let fullPodTitle = subpodTitle.length > 0 
											? podTitle + " - " + subpodTitle : podTitle; 
				attachment.fallback = fullPodTitle+" | "+postFixTitle;
				attachment.title = fullPodTitle ;
				attachment.text = fullPodTitle;
				// attachment.image_url = subpod.img[0].$.src;
				attachments.push(attachment);
			});
		});
		return {attachments:attachments};
	}	
}
