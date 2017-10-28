(function() {
	this.RedmineChannels || (this.RedmineChannels = {});

	RedmineChannels.resolve_ws_mode = function(obj) {
		console.log("resolve_ws_mode");
		console.dir(obj);
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				console.log('status=' + this.status);
				console.dir(this);
				if(!obj.active) {
					return;
				}
				if(this.status == 200) {
					var json = JSON.parse(this.responseText);
					obj.ws_mode = json.ws_mode;
					obj.start();
				} else {
					console.log("failed. starting timeout for retry");
					setTimeout(() => {
						if(obj.active) {
							RedmineChannels.resolve_ws_mode(obj)
						}
          }, 5000)
				}
			}
		};
		console.log(obj.redmine_url);
		xhttp.open("GET", obj.redmine_url + "/channels/info", true);
		xhttp.withCredentials = true;
		xhttp.send();
	};	

	RedmineChannels.setup = function(user_login, redmine_url, event_handler) {
		var obj = {
			user_login: user_login,
			redmine_url: redmine_url,
			event_handler: event_handler,
			active: true,

			start: function() {
				self = this;

				if(this.ws_mode == 'actioncable') {
					console.log("Opening actioncable connection. redmine_url=" + redmine_url);
					this.cable = ActionCable.createConsumer(redmine_url + '/cable');

					this.cable.subscriptions.create({
						channel: 'RedmineRt::UsersChannel',
						user_login: user_login
					}, 
					{
						received: event_handler
					});
				} else {
					console.log("Opening websocket-rails connection. redmine_url=" + redmine_url);
					var host = redmine_url.split("//")[1];
					this.dispatcher = new WebSocketRails(host + '/websocket');
					var private_channel = this.dispatcher.subscribe_private("user:" + user_login + ':messages',
						function(current_user) {
							//console.log(current_user.name + " has joined the channel");
							private_channel.bind('ALL', event_handler);
						},
						function(reason) {
							console.log("Could not connect to channel");       
							event_handler(reason);
						}
					);

					this.dispatcher.bind('connection_closed', function() {
						console.log("websocket-rails connection closed");
						if(this.inactive) return;
						setTimeout(function () { 
							self.start()
						}, 2000);
					});

				}
			},

			shutdown: function() {
				this.active = false;
				if(this.ws_mode == 'actioncable') {
					this.cable.close();
				} else {
					this.dispatcher.disconnect();
				}
			}
		};

		RedmineChannels.resolve_ws_mode(obj);

		return obj;	
	};
}).call(this);


