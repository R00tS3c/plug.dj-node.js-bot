var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var lockskip = {
	commands: ['lockskip', 'ls'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'bouncer+',
	exec: function(bot, chat, data) {
	    var dj = bot.getBooth().dj;
	    
	    if (!dj)
	    	return bot.sendChat(utils.replaceString(lang.lockskip.noDJ, {user: chat.username}));
	    
	    var pos = parseInt(data.params.shift());
	    
	    if (isNaN(pos))
	        pos = settings.data.lockskip;
	    else if (pos < 1 || pos > 50)
	        return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}));
	        
	    bot.sendChat(utils.replaceString(lang.lockskip.skip, {user: chat.username, pos: pos}));
	    auxapi.lockskip(pos);
	}
};

module.exports = lockskip;