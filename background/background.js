var redmine_url;
var chan;

var state = {"name": "loggedout", "user": ""};

function get_state() {
	return state;
}

var msg_handler = (msg) => {
	console.log("background.js got message");
	console.dir(msg);

	if(msg.command == "open_url") {
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

var startup = () => {
	if(chan) {
		chan.shutdown();
	}

	console.log("startup");

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			if(this.status == 200) {
				console.log("success");
				var json = JSON.parse(this.responseText);
				if(json.user != "") {
					chan = RedmineChannels.setup(json.ws_mode, json.user, redmine_url, msg_handler);		
					state = {"name": "loggedin", "user": json.user}
				} else {
					state = {"name": "loggedout", "user": ""}
				}
			} else {
				console.log("failed. starting timeout for retry");
			}
		}
	};
	xhr.open("GET", redmine_url + "/channels/session_info", true);
	xhr.withCredentials = true;
	xhr.send();
};

browser.storage.local.get('redmine_url').then(
	(val) => {
	console.log("redmine_url from storage.local:");
	console.dir(val);
	if(val.redmine_url && val.redmine_url != "") {
		redmine_url = val.redmine_url;
		startup();
	}
});

browser.runtime.onMessage.addListener(msg_handler);
