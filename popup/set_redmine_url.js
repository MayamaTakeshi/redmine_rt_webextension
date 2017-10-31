
console.log("popup/set_redmine_url.js");

document.getElementById("set_redmine_url").addEventListener('click', function(e) {
	console.log("set_redmine_url clicked");

	var redmine_url = document.getElementById("redmine_url").value;
		
	browser.runtime.getBackgroundPage().then((page) => {
		var state = page.get_state();
		state.redmine_url = redmine_url;
		page.set_state(state);
		document.location = chrome.extension.getURL("popup/login.html");
	});
});
