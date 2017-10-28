
var redmine_url;
var chan;

var msg_handler = (msg) => {
	console.log("background.js got message");
	console.dir(msg);
};

browser.storage.local.get('redmine_url').then(
	(val) => {
	console.log("got storage.local.get result");
	console.dir(val);
	if(val.redmine_url && val.redmine_url != "") {
		chan = RedmineChannels.setup("admin", val.redmine_url, msg_handler);		
	}
});


browser.runtime.onMessage.addListener(msg_handler);
