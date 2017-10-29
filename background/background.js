var redmine_url;
var chan;

var msg_handler = (msg) => {
	console.log("background.js got message");
	console.dir(msg);
	if(msg.command == "popup_dlg") {
		var dlg = document.getElementById("dlg");
		console.dir(dlg);
		dlg.showModal();
	} else if(msg.command == "open_url") {
		browser.tabs.query({
			//url: msg.url
			currentWindow: true
		}).then((tabs) => {
			var found_tab = null;

			console.log("tabs");
			console.dir(tabs);
			for(var i=0; i<tabs.length ; ++i) {
				var tab = tabs[i];
				console.log(tab.url, msg.url);
				if (tab.url.startsWith(msg.url)) {
					console.log("found existing tab")
					found_tab = tab;
					break;
				}
			}
			if (found_tab) {
				console.log("activating existing tab")
				browser.tabs.update(found_tab.id, {
					active: true
				});
			} else {
				console.log("no existing tab for " + msg.url + " . Creating it")
				browser.tabs.create({
					active: true,
					url: msg.url
				});
			}
		})
	}
};

browser.storage.local.get('redmine_url').then(
	(val) => {
	console.dir(val);
	if(val.redmine_url && val.redmine_url != "") {
		chan = RedmineChannels.setup("admin", val.redmine_url, msg_handler);		
	}
});

browser.runtime.onMessage.addListener(msg_handler);
