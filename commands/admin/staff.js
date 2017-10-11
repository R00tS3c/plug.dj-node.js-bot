var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');
var settings = require(process.cwd() + '/settings');

var staff = {
	commands: ['staff'],
	cooldown: 5,
	lastUsed: 0,
	roleRequired: 'manager',
	exec: function(bot, chat, data) {
	    bot.getStaff(function(err, data) {
	        if (err)
	            return bot.sendChat(utils.replaceString(lang.staff.error, {user: chat.username}));
	            
	        var arr = data.filter(function(user) { return user.role == 2 || user.role == 3;})
	            .map(function(user) { return {id: user.id, role: user.role}; });
	        
	        settings.data.staff = arr;
	        settings.save();
	        
	        bot.sendChat(utils.replaceString(lang.staff.ok, {user: chat.username, len: arr.length}));
	    });
	}
};

module.exports = staff;