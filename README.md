# redmine_rt_webextension
Browser webextension to be used with redmine_rt plugin (https://github.com/MayamaTakeshi/redmine_rt).

This webextension connects to redmine_rt using WebSockets and get events from it.

This can be used for CTI (integration with telephony systems like PBXes). 

For example, when a call arrives, the identity of the caller can be shown as a notification popup by the browser.

Then when a call is answered, the Redmine ticket associated with that call can be opened in the browser.

Video demonstration:

https://www.youtube.com/watch?v=XiHFAhs5o5M&feature=youtu.be


You will need to implement a backend app to actually generate messages and send them to the webextension.
The webextension subscribes to two channels:
  a channel called "user:USER_LOGIN_NAME"
and 
  a channel called "general"
The first is used to send messages to the specific user and the latter is for general messages for everybody.

The webextension supports the following commands:
  - open_url : opens an arbitrary URL in a browser tab (or moves an existing tab with that URL to the foregroud)
  - show_notification : shows a notification following WebExtension specification.
  - post_msg : posts a message to a channel.

Examples:

1) to open a redmine issue on a browser tab you would use something like this:

```
curl -u YOUR_API_TOKEN:void https://REDMINE_SERVER/channels/user:USERNAME/post_msg.json -X POST -H 'Content-Type: application/json' -d '{"command": "open_url", "data": {"url": "https://REDMINE_SERVER/
issues/ISSUE_NUMBER"}}'
```

2) to show a notification to all users:

curl -u YOUR_API_TOKEN:void https://REDMINE_SERVER/channels/general/post_msg.json -X POST -H 'Content-Type: application/json' -d '{"command": "show_notification", "data": {"title": "Call from Pablo Picasso", "message": "Impatient customer. Hurry up!", "imageUrl": "https://cdn.dribbble.com/users/4385/screenshots/344648/picasso_icon.jpg"}}'

3) to show a notification with buttons and actions to a specific user:
```
curl -u YOUR_API_TOKEN:void https://REDMINE_SERVER/channels/user:USERNAME/post_msg.json -X POST -H 'Content-Type: application/json' -d '{"command": "show_notification", "data": {"title": "Call from Pablo Picasso", "message": "Impatient customer. Hurry up!", "imageUrl": "https://cdn.dribbble.com/users/4385/screenshots/344648/picasso_icon.jpg", "buttons": [{"title": "Open customers details page", "command": "post_msg", "data": {"channel_name": "user:USERNAME", "msg": {"command": "open_url", "data": {"url": "https://en.wikipedia.org/wiki/Pablo_Picasso"}}}}, {"title": "Open Issue", "command": "open_url", "data": {"url": "https://REDMINE_SERVER//issues/SOME_ISSUE_NUMBER"}}]}}'
```
(However, imageUrl and buttons are not supported yet by firefox. The notification will show up but the image and the buttons will not be rendered)

4) to show a notification with a button allowing to answer an incoming call:

```
curl -u YOUR_API_TOKEN:void https://REDMINE_SERVER/channels/user:USERNAME/post_msg.json -d '{"command": "show_notification", "data": {"title": "Call from Pablo Picasso", "message": "Impatient customer. Hurry up!", "imageUrl": "https://cdn.dribbble.com/users/4385/screenshots/344648/picasso_icon.jpg", "buttons": [{"title": "Answer call", "command": "post_msg", "data": {"channel_name": "pbx", "msg": {"command": "answer", "data": {"call_uuid": "SOME_CALL_UUID"}}}}]}}'

# Pressing the "Answer call" button would cause a message with command=answer to be sent to a channel called pbx that would be listened by your PBX app and then would answer the specified call.
```


Attribution:

This application uses this sound from freesound:
Ping.wav by edsward ( https://freesound.org/people/edsward/ )

