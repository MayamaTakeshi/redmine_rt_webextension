
browser.runtime.onMessage.addListener((msg) => {
	console.log("background.js got message");
	console.dir(msg.value);
})
