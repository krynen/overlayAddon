module.exports = {
	data		: {
		config	: {},
		shared	: {},
		module	: require("./data/module.js")()
	},
	object	: {
		irc			: require("./irc/main.js")(module.exports.config, module.exports.shared),
		message	: {},
		theme		: {}
	}
};

