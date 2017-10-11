var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var skipTO = null;

var limit = {
	commands: ['limit', 'limite', 'medialimit'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
		if (data.params.length == 0) {
			if (settings.data.medialimit.limit == 0)
				return bot.sendChat(utils.replaceString(lang.medialimit.disabled, {user: chat.username}), 30e3);
				
			var time = utils.timeConvert(settings.data.medialimit.limit * 1e3),
	    		str = utils.timeToString(time);
	    		
			return bot.sendChat(utils.replaceString(lang.medialimit.limit, {user: chat.username, limit: str}), 30e3);
		}
		
		var opt = data.params.shift();
		
		if (utils.zeroOrOff(opt)) {
			settings.data.medialimit.limit = 0;
			settings.save();
			
			if (skipTO) {
				clearTimeout(skipTO);
				skipTO = null;
			}
			return bot.sendChat(utils.replaceString(lang.medialimit.disabled, {user: chat.username}), 30e3);
		}
		
		if (!isNaN(opt)) {
			opt = parseInt(opt);
			
			if (opt < 0)
				return bot.sendChat(utils.replaceString(lang.medialimit.invalidLimit, {user: chat.username}), 30e3);
			
			settings.data.medialimit.limit = opt;
			settings.save();
			
			var time = utils.timeConvert(settings.data.medialimit.limit * 1e3),
	    		str = utils.timeToString(time);
			
			return bot.sendChat(utils.replaceString(lang.medialimit.limit, {user: chat.username, limit: str}), 30e3);
		} else {
			switch(opt) {
				case 'si' :
					var val = data.params.shift();
					
					settings.data.medialimit.skipImmediately = val && val.toLowerCase() == 'on';
					settings.save();
					
					if (settings.data.medialimit.skipImmediately)
						return bot.sendChat(utils.replaceString(lang.medialimit.siEnabled, {user: chat.username}), 30e3);
					
					return bot.sendChat(utils.replaceString(lang.medialimit.siDisabled, {user: chat.username}), 30e3);
			}
		}
	},
	advEvent: function(bot, booth, media, prev) {
		if (skipTO) {
			clearTimeout(skipTO);
			skipTO = null;
		}
		
		if (!media || !media.cid || !booth.dj) return;
		
		if (settings.data.medialimit.limit && media.duration > settings.data.medialimit.limit) {
			var user = auxapi.users.getUserByID(booth.dj);
			
			if (!user)
				user = {username: 'dj'};
			
			var time = utils.timeConvert(settings.data.medialimit.limit * 60 *1e3),
	    		str = utils.timeToString(time);
			
			if (settings.data.medialimit.skipImmediately) {
				bot.sendChat(utils.replaceString(lang.medialimit.skip, {user: user.username, time: str}), 30e3);

				if (settings.data.lockskip)
					auxapi.lockskip(settings.data.lockskip);
				else
					bot.skipDJ(booth.dj);
				
				return false;
			} else {
				bot.sendChat(utils.replaceString(lang.medialimit.skipAfterLimit, {user: user.username, time: str}), 30e3);
				
				skipTO = setTimeout(function() {
					//bot.sendChat(utils.replaceString(lang.emotelimit.emotelimit, {user: chat.username, limit: settings.data.emotelimit.limit}), 30e3);
					bot.skipDJ(booth.dj);	
				}, settings.data.medialimit.limit * 1e3);
			}
		}
	}
};

module.exports = limit;