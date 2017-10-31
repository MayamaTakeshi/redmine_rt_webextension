
console.log("popup/logout.js");
var redmine_url;

browser.runtime.getBackgroundPage().then((page) => {
	redmine_url = page.get_state().redmine_url;
});

document.getElementById("logout").addEventListener('click', function(e) {
	console.log("logout clicked");
	console.dir(e);

	var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
      console.log("logout status=" + this.status);
			if (this.readyState == 4) {
				if(this.status == 200) {
					console.log("OK.");
					document.location = chrome.extension.getURL("popup/login.html");
				} else {
					console.log("failed.");
				}
			}
		};
		xhttp.open("POST", redmine_url + "/logout", true);
		xhttp.withCredentials = true;
		xhttp.send();
	}	
);
