function saveOptions(e) {
	e.preventDefault();
  var redmine_url = document.querySelector("#redmine_url").value;
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
}

function restoreOptions() {
	function setRedmineUrl(result) {
		document.querySelector('#redmine_url').value = result.redmine_url || "";
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	var getting = browser.storage.local.get("redmine_url");
	getting.then(setRedmineUrl, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);


