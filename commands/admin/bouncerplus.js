var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var bouncerplus = {
	commands: ['bouncer+', 'bouncerplus'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'manager',
	exec: function(bot, chat, data) {
	    if (data.params.length == 0) {
			settings.data.bouncerplus = !settings.data.bouncerplus;
		} else {
		    if (data.params[0].toLowerCase() == 'off')
		        settings.data.bouncerplus = false;
		    else if (data.params[0].toLowerCase() == 'on')
		        settings.data.bouncerplus = true;
	        else return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}));
		}

	    settings.save();
	    
	    if (settings.data.bouncerplus)
		    bot.sendChat(utils.replaceString(lang.bouncerplus.actived, {user: chat.username}));
		else
		    bot.sendChat(utils.replaceString(lang.bouncerplus.disactived, {user: chat.username}));
	}
};

module.exports = bouncerplus;