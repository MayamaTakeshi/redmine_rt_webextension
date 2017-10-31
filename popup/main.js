
console.log("popup/main.js");
browser.runtime.getBackgroundPage().then((page) => {
	console.log("get_state got");
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
