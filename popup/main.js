
console.log("popup/main.js");

var getBackgroundPage = (handler) => {
	if(typeof browser == 'undefined') {
		chrome.runtime.getBackgroundPage(handler);
	} else {
		browser.runtime.getBackgroundPage().then(handler);
	}
};


getBackgroundPage((page) => {
	var state = page.get_state();

	var url;
	if(state.redmine_url == "") {
		url = chrome.extension.getURL("popup/set_redmine_url.html");
	} else if(state.name == "loggedout") {
		url = chrome.extension.getURL("popup/login.html");
		console.dir(url);
	}	else if (state.name == "loggedin") {
		url = chrome.extension.getURL("popup/logout.html");
	}
	document.location = url;
});

