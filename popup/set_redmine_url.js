
console.log("popup/set_redmine_url.js");

document.getElementById("set_redmine_url").addEventListener('click', function(e) {
	console.log("set_redmine_url clicked");

	var redmine_url = document.getElementById("redmine_url").value;
	if(redmine_url.endsWith("/")) {
		redmine_url = redmine_url.slice(0, - 1);
	}

	if(!redmine_url.startsWith("http://") && !redmine_url.startsWith("https://")) {
		document.getElementById("error").innerHTML = "Invalid redmine_url. Must start with http:// or https://";
		return;
	}

	browser.runtime.getBackgroundPage().then((page) => {
		var state = page.get_state();
		var new_state = {
			name: state.name,
			user: state.user,
			redmine_url: redmine_url
		};
		page.set_state(new_state);
		document.location = chrome.extension.getURL("popup/login.html");
	});
});
