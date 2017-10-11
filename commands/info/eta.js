var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var eta = {
    commands: ['eta'],
	cooldown: 1,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'user',
	exec: function(bot, chat, data) {
	    if (!settings.data.eta.on) return;
	    
	    var user = auxapi.users.getUserByID(chat.id);
		
    	if (!user)
		    return bot.sendChat(utils.replaceString(lang.general.ghost, {user: chat.username}), 30e3);
	    
	    var userPos = bot.getWaitlist().indexOf(chat.id),
	        dj = bot.getBooth().dj;
	    
	    var msg = '';
	    
	    if (userPos == -1) {
	        if (dj == chat.id) {
	        	msg = utils.replaceString(lang.eta.alrPlaying, {user: chat.username});
	        } else {
	        	msg = utils.replaceString(lang.eta.notInWL, {user: chat.username});
	        }
	    } else {
	    	var time = utils.timeConvert((bot.getRemainingTime() + userPos * 4 * 60)*1e3),
	    		str = utils.timeToString(time);
	    		
	    	msg = utils.replaceString(lang.eta.eta, {user: chat.username, time: str});
	    }
	    
		bot.sendChat(msg, 240e3);
	}
};

module.exports = eta;