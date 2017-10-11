var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var lockskip = {
	commands: ['swap'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'bouncer+',
	exec: function(bot, chat, data) {
	    var user1, user2;
	    
	    if (!data.params.length)
	        return bot.sendChat(utils.replaceString(lang.general.userNotFound, {user: chat.username}));
	       
	    if (data.params[0].toLowerCase() == 'id') {
	        user1 = auxapi.users.getUserByID(data.params[1]);
	        user2 = auxapi.users.getUserByID(data.params[2]);
	    } else {
    	    var msg = data.params.join(' ').substr(1).split(' @');

    	    user1 = auxapi.users.getUserByUsername(msg[0]);
    	    user2 = auxapi.users.getUserByUsername(msg[1]);
	    }

	    if (!user1 || !user2)
	        return bot.sendChat(utils.replaceString(lang.general.ghost, {user: chat.username}), 30e3);
        
        if (user1.id == user2.id)
            return bot.sendChat(utils.replaceString(lang.swap.sameUser, {user: chat.username}), 30e3);
        
        var user1Pos = bot.getWaitlist().indexOf(user1.id);
        var user2Pos = bot.getWaitlist().indexOf(user2.id);
        
        if (user1Pos == -1 || user2Pos == -1)
            return bot.sendChat(utils.replaceString(lang.swap.notInWL, {user: chat.username}), 30e3);
        
        bot.sendChat(utils.replaceString(lang.swap.swapping,
            {user1: user1.username,
            user2: user2.username,
            pos1: (user1Pos+1),
            pos2: (user2Pos+1),
            }));
        
        bot.moveDJ(user1.id, user2Pos, function(err, data) {
            if (err) return;
            
            bot.moveDJ(user2.id, user1Pos);
        });
	}
};

module.exports = lockskip;