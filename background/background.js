var chan;

var state = {"name": "loggedout", "user": "", "redmine_url": ""};

var notification_id = 0;
var notification_buttons = {};

var browser_name;

browser.runtime.getBrowserInfo().then((info) => {
	console.log("browser name: " + info.name);
	browser_name = info.name;
});

var process_command = (command, data) => {
	console.log("process_command " + command);
	console.dir(data);
	if(command == "open_url") {
		browser.tabs.query({
			currentWindow: true
		}).then((tabs) => {
			var found_tab = null;

			console.log("tabs");
			console.dir(tabs);
			for(var i=0; i<tabs.length ; ++i) {
				var tab = tabs[i];
				console.log(tab.url, data.url);
				if (tab.url.startsWith(data.url)) {
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
				console.log("no existing tab for " + data.url + " . Creating it")
				browser.tabs.create({
					active: true,
					url: data.url
				});
			}
		})
	} else if(command == "show_notification") {
		notification_id++;

		var buttons = null;

		if(data.buttons) {
			notification_buttons[String(notification_id)] = data.buttons;

			var buttons = data.buttons.map((b) => {
				return {"title": b.title}
			});
		}

		var notification_data = {
			"type": data.imageUrl ? "image" : "basic",
			"iconUrl": data.iconUrl || browser.extension.getURL("icons/redmine-96.png"),
			"imageUrl": data.imageUrl,
			"title": data.title,
			"message": data.message,
		}
		if(browser_name != "Firefox") {
			notification_data["buttons"] = buttons;
		}

		browser.notifications.create(String(notification_id), notification_data);

		console.log("notification created");
	} 
}

browser.notifications.onButtonClicked.addListener((id, index) => {
	browser.notifications.clear(id);
	process_command(notification_buttons[id][index].command, notification_buttons[id][index].data);
});

browser.notifications.onClosed.addListener((id, byUser) => {
	delete notification_buttons[id];
});


var msg_handler = (msg) => {
	console.log("background.js got message");
	console.dir(msg);

	if(msg.command) {
		process_command(msg.command, msg.data);
	}
};

var startup = (redmine_url) => {
	console.log("background.js startup")
	if(chan) {
		chan.shutdown();
		chan = null;
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
	console.log("Data from storage.local:");
	console.dir(val);
	state.user = val.user;
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

	browser.storage.local.set({
		redmine_url: state.redmine_url,
		user: state.user,
	});

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
