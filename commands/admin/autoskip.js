var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var skipTO = null;

var autoskip = {
	commands: ['autoskip'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	exec: function(bot, chat, data) {
		if (data.params.length == 0) {
			return bot.sendChat(utils.replaceString(lang.autoskip.status, {
				user: chat.username,
				on: settings.data.autoskip.on && lang.general.enabled || lang.general.disabled,
				time: settings.data.autoskip.time
			}));
		}

		var opt = data.params.shift();


		if (utils.zeroOrOff(opt)) {
			settings.data.autoskip.on = false;
			settings.save();

			if (skipTO) {
				clearTimeout(skipTO);
				skipTO = null;
			}
			return bot.sendChat(utils.replaceString(lang.autoskip.disabled, {
				user: chat.username
			}));
		}
		
		if (opt.toLowerCase() == 'on') {
			settings.data.autoskip.on = true;
			settings.save();

			return bot.sendChat(utils.replaceString(lang.autoskip.enabled, {
				user: chat.username
			}));
		}

		if (!isNaN(opt)) {
			opt = parseInt(opt);

			if (opt < 0)
				return bot.sendChat(utils.replaceString(lang.general.insParams, {
					user: chat.username
				}));

			settings.autoskip.time = opt;
			settings.save();

			return bot.sendChat(utils.replaceString(lang.autoskip.time, {
				user: chat.username,
				limit: opt
			}));
		}
		bot.sendChat(utils.replaceString(lang.autoskip.disabled, {
			user: chat.username
		}));
	},
	advEvent: function(bot, booth, media, prev) {
		if (skipTO) {
			clearTimeout(skipTO);
			skipTO = null;
		}

		if (media && media.cid && media.duration && booth && booth.dj && settings.data.autoskip.on) {
			skipTO = setTimeout(function() {
				bot.skipDJ(booth.dj);
			}, (media.duration + settings.data.autoskip.time) * 1e3);
		}
	}
};

module.exports = autoskip;