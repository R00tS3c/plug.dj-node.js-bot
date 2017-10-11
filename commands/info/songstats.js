var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var songstats = {
	commands: ['songstats'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
		if (data.params.length == 0) 
		    settings.data.songstats.on = !settings.data.songstats.on;
		else {
		    if (data.params[0].toLowerCase() == 'off')
		        settings.data.songstats.on = false;
		    else if (data.params[0].toLowerCase() == 'on')
		        settings.data.songstats.on = true;
	        else return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}), 60e3);
		}

		settings.save();
		
		bot.sendChat(utils.replaceString(settings.data.songstats.on && lang.songstats.enabled || lang.songstats.disabled, {
			user: chat.username
		}));
	},
	advEvent: function(bot, booth, media, prev) {
		if (prev && prev.media && prev.media.title && prev.dj && prev.dj.username && settings.data.songstats.on) {
			bot.sendChat(utils.replaceString(lang.songstats.stats,
			    {
			        user: prev.dj.username,
			        author: prev.media.author,
			        title: prev.media.title,
			        woot: prev.score.positive,
			        grab: prev.score.grabs,
			        meh: prev.score.negative
			    }));
		}
	}
};

module.exports = songstats;