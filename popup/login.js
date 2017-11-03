
console.log("popup/login.js");
var redmine_url;
var user; 

browser.runtime.getBackgroundPage().then((page) => {
	var state = page.get_state();
	console.dir(state);
	redmine_url = state.redmine_url;
	user = state.user;

	document.getElementById("username").value = user ? user : "";
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
  
	var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
      console.log("login status=" + this.status);
			if (this.readyState == 4) {
				if(this.status == 200) {
					console.log("OK.");
					browser.runtime.getBackgroundPage().then((page) => {
						var new_state = {
							name: "loggedin",
							user: username,
							redmine_url: redmine_url
						}
						page.set_state(new_state);

						document.location = chrome.extension.getURL("popup/logout.html");
					});
				} else if(this.status == 0) {
					console.log("failed to contact server.");
					document.getElementById("error").textContent = "Failure to contact server at redmine_url " + redmine_url;
				} else {
					console.log("failed.");
					document.getElementById("error").textContent = "Invalid credentials";
				}
			}
		};

		xhr.onerror = function(e) {
			console.log("onerror");
			console.dir(e);
			document.getElementById("error").textContent = "Failed to contact server at redmine_url " + redmine_url;
		};

		xhr.open("POST", redmine_url + "/login.json", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.withCredentials = true;
		xhr.send(JSON.stringify({username: username, password: password, autologin: 1}));
	}	
);
