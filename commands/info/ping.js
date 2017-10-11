var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var ping = {
	commands: ['ping','pong','bot'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'user',
	exec: function(bot, chat, data) {
		switch(data.cmd) {
			case 'ping':
				bot.sendChat(utils.replaceString(lang.ping.ping, {user: chat.username}), 30e3);
				break;
			
			case 'pong':
				bot.sendChat(utils.replaceString(lang.ping.pong, {user: chat.username}), 30e3);
				break;
			
			case 'bot':
				bot.sendChat(utils.replaceString(lang.ping.bot, {user: chat.username}), 30e3);
				break;
		}
	}
};

module.exports = ping;