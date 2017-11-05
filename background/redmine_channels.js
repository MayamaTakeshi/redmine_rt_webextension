(function() {
	this.RedmineChannels || (this.RedmineChannels = {});

	RedmineChannels.setup = function(ws_mode, user_login, redmine_url, event_handler) {
		console.log("RedmineChannels.setup");
		var channel_names = ['user:' + user_login, 'general'];

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

					this.channels = {};

					channel_names.forEach((channel_name) => {
						this.channels[channel_name] = this.cable.subscriptions.create({
							channel: 'RedmineRt::Channel',
							name: channel_name
						},
						{
							received: event_handler
						});
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

					channel_names.forEach((channel_name) => {
						var private_channel = this.dispatcher.subscribe_private(channel_name,
							function(current_user) {
								private_channel.bind('ALL', event_handler);
							},
							function(reason) {
								console.log("Could not connect to channel");       
								event_handler(reason);
							}
						);
					});

					this.dispatcher.bind('connection_closed', function() {
						console.log("websocket-rails connection closed");
						if(this.inactive) return;
						setTimeout(function () { 
							self.start()
						}, 2000);
					});
				}
			},

			post_msg: function(channel_name, msg) {
				if(this.ws_mode == 'actioncable') {
					if(!this.cable) return;
					console.log("post_msg via actioncable");
					this.channels["general"].send({
						command: "send_msg",
						data: {
							channel_name: channel_name,
							msg: msg
						}
					});
				} else {
					if(!this.dispatcher) return;
					console.log("post_msg via websocket-rails");
					this.dispatcher.trigger("post_msg", {
						channel_name: channel_name,
						msg: msg
					});
				}
			},

			shutdown: function() {
				this.active = false;
				if(this.ws_mode == 'actioncable') {
					this.cable.disconnect();
					delete this.cable;
				} else {
					this.dispatcher.disconnect();
					delete this.dispatcher
				}
			}
		};

		obj.start();

		return obj;	
	};
}).call(this);


