var chan;

var state = {"name": "loggedout", "user": "", "redmine_url": ""};

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

var startup = (redmine_url) => {
	console.log("background.js startup")
	if(chan) {
		chan.shutdown();
	}

	console.log("startup");

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.status);
			if(this.status == 200) {
				console.log("success");
				var json = JSON.parse(this.responseText);
				if(json.user != "") {
					chan = RedmineChannels.setup(json.ws_mode, json.user, redmine_url, msg_handler);		
					state = {"name": "loggedin", "user": json.user, "redmine_url": redmine_url}
				} else {
					state = {"name": "loggedout", "user": "", "redmine_url": redmine_url}
				}
			} else {
				console.log("failed. starting timeout for retry");
			}
		}
	};
	xhr.open("GET", state.redmine_url + "/channels/session_info", true);
	xhr.withCredentials = true;
	xhr.send();
};

browser.storage.local.get('redmine_url').then(
	(val) => {
	console.log("redmine_url from storage.local:");
	console.dir(val);
	if(val.redmine_url && val.redmine_url != "") {
		state.redmine_url = val.redmine_url;
		startup(state.redmine_url);
	}
});


function get_state() {
	return state;
}

function set_state(new_state) {
	console.log("set_state");
	console.dir(state);
	console.dir(new_state);
	if(state.name == new_state.name 
	&& state.user == new_state.user 
	&& state.redmine_url == new_state.redmine_url) {
		console.log("no change in state");
		return;
	}
	state.name = new_state.name;
	state.redmine_url = new_state.redmine_url;
	state.user = new_state.user;

	if(state.name == "loggedin") {
		console.log("starting up");
		startup(state.redmine_url);
	} else if(state.name == "loggedout") {
		if(chan) {
			chan.shutdown();
			chan = null;
		}
  }
}

browser.runtime.onMessage.addListener(msg_handler);
