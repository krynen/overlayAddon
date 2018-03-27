module.exports = function() {
	this.irc = {
		uri = "wss://irc-ws.chat.twitch.tv:443";
		nick = "justinfan" + Math.random().toString().slice(2,7);
		pass = "Mr_WaterT";
		capabilities = [
			"twitch.tv/tags",
			"twitch.tv/commands",
			"twitch.tv/membership"
		];
	};
};