var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var emotelimit = {
    commands: ['emotelimit', '*'],
	cooldown: 1,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
		var param = data.params.shift(),
			limit = parseInt(param);
		
		if (!param)
			return bot.sendChat(utils.replaceString(lang.emotelimit.value, {user: chat.username, limit: settings.data.emotelimit.limit}), 30e3);
		
		if (isNaN(limit) || limit < 0 || limit > 50)
			return bot.sendChat(utils.replaceString(lang.emotelimit.invalidVal, {user: chat.username}), 30e3);
		
		settings.data.emotelimit.limit = limit;
		settings.save();
		
		return bot.sendChat(utils.replaceString(lang.emotelimit.emotelimit, {user: chat.username, limit: settings.data.emotelimit.limit}), 30e3);
	},
	execEvent: function(bot, chat) {
		if (chat.id == bot.getSelf().id) return;
		
		var emotes = chat.message.match(/:(.+?):/g) || [];
		
		if (emotes.length > settings.data.emotelimit.limit) {
			bot.deleteMessage(chat.cid);
			return false;
		}
	}
};

module.exports = emotelimit;