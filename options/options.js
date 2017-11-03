var redmine_url;
var user;

browser.runtime.getBackgroundPage().then((page) => {
	var state = page.get_state();
	redmine_url = state.redmine_url;
	user = state.user;

	document.getElementById("redmine_url").value = redmine_url;
});


function saveOptions(e) {
	console.log("saveOptions");
	e.preventDefault();
  var redmine_url = document.getElementById("redmine_url").value;
	if(redmine_url.endsWith("/")) {
		redmine_url = redmine_url.slice(0, - 1);
	}

	browser.runtime.getBackgroundPage().then((page) => {
		var state = page.get_state();
		var new_state = {
			name: state.name,
			user: state.user,
			redmine_url: redmine_url,
		}
		page.set_state(new_state);
	});

	document.getElementById("success").innerHTML = "Saved";
	document.getElementById("redmine_url").value = redmine_url;
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

	var getting = browser.storage.local.get();
	getting.then(setRedmineUrl, onError);

}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);


