var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var skip = {
	commands: ['skip', 'pula'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
	    var dj = bot.getBooth().dj;
	    
	    if (!dj)
	    	return bot.sendChat(utils.replaceString(lang.skip.noDJ, {user: chat.username}), 30e3);
	    
	    bot.sendChat(utils.replaceString(lang.skip.skip, {user: chat.username}), 30e3);
	    bot.skipDJ(dj);
	}
};

module.exports = skip;