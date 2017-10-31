
console.log("popup/login.js");
var redmine_url;
var user; 

var getBackgroundPage = (handler) => {
	if(typeof browser == 'undefined') {
		chrome.runtime.getBackgroundPage(handler);
	} else {
		browser.runtime.getBackgroundPage().then(handler);
	}
};


getBackgroundPage((page) => {
	var state = page.get_state();
	redmine_url = state.redmine_url;
	user = state.user;
	
	document.getElementById("username").innerHTML = user;
});

document.getElementById("login").addEventListener('click', function(e) {
	console.log("login clicked");
	if(redmine_url == "") {
		console.log("redmine_url not set yet");
		return;
	}
	console.dir(e);

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
  
	var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
      console.log("login status=" + this.status);
			if (this.readyState == 4) {
				if(this.status == 200) {
					console.log("OK.");
					getBackgroundPage((page) => {
						var new_state = {
							name: "loggedin",
							user: username,
							redmine_url: redmine_url
						}
						page.set_state(new_state);
					});

					document.location = chrome.extension.getURL("popup/logout.html");
				} else {
					console.log("failed.");
				}
			}
		};
		xhttp.open("POST", redmine_url + "/login.json", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.withCredentials = true;
		xhttp.send(JSON.stringify({username: username, password: password, autologin: 1}));
	}	
);
