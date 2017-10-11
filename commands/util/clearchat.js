var lang = require(process.cwd() + '/lang.json');
var auxapi = require(process.cwd() + '/auxapi');
var utils = require(process.cwd() + '/utils/utils');

var clearchat = {
	commands: ['clearchat', 'clear', 'limpa'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'bouncer+',
	exec: function(bot, chat, data) {
	    var chatlist = null;
	    
	    if (data.params.length == 0) {
	        chatlist = bot.getChat();
	        
	        bot.sendChat(utils.replaceString(lang.clearchat.clearAll, {user: chat.username}));
	    } else {
	        var user = null;
	        
	        if (data.params[0].indexOf('@') == 0)
	            user = auxapi.users.getUserByMention(data.params.join(' '), true);
            else {
                if (isNaN(data.params[0]))
                    user = auxapi.users.getUserByUsername(data.params.join(' ').substr(1));
                else
                    user = auxapi.users.getUserByID(data.params[0], true);
            }
	        
	        if (!user)
	            return bot.sendChat(utils.replaceString(lang.general.notLocated, {user: chat.username}));
	       
	        chatlist = bot.getChat().filter(function(chat){ return chat.id == user.id; });
	        
	        bot.sendChat(utils.replaceString(lang.clearchat.clearUser, {user: chat.username, target: user.username}));
	    }
	    
	    chatlist.forEach(function(chat) {
            bot.deleteMessage(chat.cid);
        });
	}
};

module.exports = clearchat;