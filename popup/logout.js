
console.log("popup/logout.js");
var redmine_url;
var user; 

browser.runtime.getBackgroundPage().then((page) => {
	var state = page.get_state();
	redmine_url = state.redmine_url;
	user = state.user;
	
	document.getElementById("username").innerHTML = user;
});

document.getElementById("logout").addEventListener('click', function(e) {
	console.log("logout clicked");
	console.dir(e);

	var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
      console.log("logout status=" + this.status);
			if (this.readyState == 4) {
				if(this.status == 200) {
					console.log("Logout OK.");
					browser.runtime.getBackgroundPage().then((page) => {
						var new_state = {
							user: user,
							redmine_url: redmine_url,
							name: 'loggedout',
						}
					  page.set_state(new_state);
						document.location = chrome.extension.getURL("popup/login.html");
					});
				} else {
					console.log("failed.");
				}
			}
		};
		xhttp.open("GET", redmine_url + "/logout", true);
		xhttp.withCredentials = true;
		xhttp.send();
	}	
);
