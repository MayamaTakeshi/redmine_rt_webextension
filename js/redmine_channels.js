(function() {
  this.App || (this.App = {});

  App.ws_setup = function(event_handler) {
    App.cable = ActionCable.createConsumer();

    App.cable.subscriptions.create({
      channel: 'RedmineRt::MessagesChannel',
      issue_id: $('meta[name=page_specific_js]').attr('issue_id')
    }, 
    {
    	received: event_handler
    });
  };

  App.ws_disconnect = function() {
    App.cable.close();
  };
}).call(this);


The above is the ActionCable specific code used by redmine rails.

For this extension we will need to implement one module named RedmineChannels that provides:

conn = createConnection(redmine_url, access_token)
conn.subscribe(CHANNEL_NAME)
conn.unsubscribe(CHANNEL_NAME)
conn.disconnect()

and these methods should be converted to the appropriate underlying WS library calls.



