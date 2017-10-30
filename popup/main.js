
console.log("popup/main.js");
browser.runtime.getBackgroundPage().then((page) => {
	console.log("get_state got");
	console.dir(page.get_state());
});

document.getElementById("login").addEventListener('click', function(e) {
	console.log("login clicked");
	console.dir(e);
  
	var xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
      console.log("login status=" + this.status);
			if (this.readyState == 4) {
				if(this.status == 200) {
					console.log("OK.");
				} else if(this.status == 302) {
					console.log("Redirected.");
				} else {
					console.log("failed.");
				}
			}
		};
		xhttp.open("POST", "http://192.168.2.169:3000/login.json", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.withCredentials = true;
		xhttp.send(JSON.stringify({username: "admin", password: "11111111", autologin: 1}));
	}	
);
