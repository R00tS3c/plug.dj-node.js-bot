var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var historycheck = {
	commands: ['historycheck', 'history'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
		if (data.params.length == 0) {
			settings.data.historycheck.on = !settings.data.historycheck.on;
		} else {
		    if (data.params[0].toLowerCase() == 'off')
		        settings.data.historycheck.on = false;
		    else if (data.params[0].toLowerCase() == 'on')
		        settings.data.historycheck.on = true;
	        else return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}));
		}

		settings.save();
		
		bot.sendChat(utils.replaceString(settings.data.historycheck.on && lang.historycheck.enabled || lang.historycheck.disabled, {
			user: chat.username
		}));
	},
	advEvent: function(bot, booth, media, prev) {
	    if (!settings.data.historycheck.on) return;
	    
		if (booth && booth.dj && media && media.media && media.media.cid) {
			var histResult = auxapi.history.searchInHistory({
			    cid: media.media.cid,
			    uid: booth.dj
			}, settings.data.historycheck.limit);

			var userdj = auxapi.users.getUserByID(booth.dj) || {
	            id: booth.dj,
	            username: 'dj'
	        };
			
			if (!histResult) return;
			
			var timediff = new Date(media.startTime.replace(/(T|Z)/g, ' ').trim()).getTime() - new Date(histResult.time);
			
			bot.sendChat(utils.replaceString(lang.historycheck.songInHistory, {
    			user: userdj.username,
    			hpos: histResult.lastPos,
    			hlen: histResult.total,
    			hmplay: histResult.len,
    			hmuplay: histResult.played,
    			lastuser: histResult.user.username,
    			time: utils.timeToString(utils.timeConvert(timediff))
    		}));
    	    
    	    if (timediff < settings.data.historycheck.timeInterval * 60 * 1e3)
    	        return auxapi.lockskip(settings.data.lockskip);
		}
	}
};

module.exports = historycheck;