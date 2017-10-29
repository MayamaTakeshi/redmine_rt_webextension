function saveOptions(e) {
	console.log("saveOptions");
	e.preventDefault();
  var redmine_url = document.getElementById("redmine_url").value;

	if(typeof browser != 'undefined') {
		browser.runtime.sendMessage(
			{
				type: 'redmine_url_updated',
				value: redmine_url
			}
		);

		browser.storage.local.set({
			redmine_url: redmine_url
		});

		browser.storage.local.get('redmine_url').then((res) => {
			console.dir(res);
		});

	} else {
		chrome.runtime.sendMessage(
			{
				type: 'redmine_url_updated',
				value: redmine_url
			}
		);

		chrome.storage.sync.set({
			redmine_url: redmine_url
		},
		function() {
			console.log("options save success");
		});

	  chrome.storage.local.get('redmine_url', console.dir);
	}
}

function restoreOptions() {
	console.log("restoreOptions");
	function setRedmineUrl(result) {
		console.log("setRedmineUrl");
		console.dir(result);
		document.getElementById('redmine_url').value = result.redmine_url || "";
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	if(typeof browser != 'undefined') {
		var getting = browser.storage.local.get("redmine_url");
		getting.then(setRedmineUrl, onError);
	} else {
		chrome.storage.sync.get("redmine_url", setRedmineUrl);
	}

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);


