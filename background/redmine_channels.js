(function() {
	this.RedmineChannels || (this.RedmineChannels = {});

	RedmineChannels.setup = function(ws_mode, user_login, redmine_url, event_handler) {
		console.log("RedmineChannels.setup");
		var obj = {
			ws_mode: ws_mode,
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
						channel: 'RedmineRt::Channel',
						name: "user:" + user_login
					}, 
					{
						received: event_handler
					});

					this.cable.subscriptions.create({
						channel: 'RedmineRt::Channel',
						name: "general"
					}, 
					{
						received: event_handler
					});

				} else {
					console.log("Opening websocket-rails connection. redmine_url=" + redmine_url);
					var arr = redmine_url.split("//");
					var scheme = arr[0];
					var host = arr[1];
					var url = "ws://";
					if(scheme == "https:") {
						url = "wss://";
					}

					url = url + host + '/websocket';
					console.log("url=" + url);

					this.dispatcher = new WebSocketRails(url);
					var private_channel = this.dispatcher.subscribe_private("user:" + user_login,
						function(current_user) {
							private_channel.bind('ALL', event_handler);
						},
						function(reason) {
							console.log("Could not connect to channel");       
							event_handler(reason);
						}
					);

					var private_channel_general = this.dispatcher.subscribe_private("general",
						function(current_user) {
							private_channel_general.bind('ALL', event_handler);
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
					this.cable.disconnect();
				} else {
					this.dispatcher.disconnect();
				}
			}
		};

		obj.start();

		return obj;	
	};
}).call(this);


