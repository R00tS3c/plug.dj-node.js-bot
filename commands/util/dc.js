var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

function execDC(bot, chat, data) {
	if (!settings.data.dc.on) return;
	
	var user = auxapi.users.getUserByID(chat.id);
		
	if (!user)
	    return bot.sendChat(utils.replaceString(lang.general.ghost, {user: chat.username}));
	
	var userdc = null;
	
	if (data.params.length == 0)
		userdc = user;
	else {
		if (user.role >= 2)
			userdc = auxapi.users.getUserByMention(data.params.join(' '));
		else
			return;
	}
	
	if (!userdc)
		return bot.sendChat(utils.replaceString(lang.general.notLocated, {user: chat.username}));

	var tl = settings.data.dc.timelimit * 60 * 1e3;
	
	var _dc = auxapi.dc.getDC(userdc.id, tl, settings.data.dc.best, settings.data.dc.maxelap)[0];
	
	if (!_dc)
		return bot.sendChat(utils.replaceString(lang.dc.notDisc, {user: userdc.username}));
	
/*	
	if ((now - _dc.date) > tl) {
		if (_dc.pos == 0)
			return bot.sendChat(utils.replaceString(lang.dc.tooLongBooth, {
					user: userdc.username,
					time: utils.timeToString(utils.timeConvert(new Date().getTime(), _dc.date))
				}));
		else
			return bot.sendChat(utils.replaceString(lang.dc.tooLong, {
					user: userdc.username,
					position: _dc.pos,
					time: utils.timeToString(utils.timeConvert(now, _dc.date))
				}));
	}
	
	if (settings.data.dc.maxelap && _dc.pos == 0 && Math.floor(_dc.elap) > settings.data.dc.maxelap)
		return bot.sendChat(utils.replaceString(lang.dc.tooTimeElap, {
					user: userdc.username,
					time: utils.timeToString(utils.timeConvert(new Date().getTime(), _dc.date)),
					perc: Math.floor(_dc.elap)
				}));
*/	
	if (_dc.pos > 0 )
		bot.sendChat(utils.replaceString(lang.dc.disc, {
						user: userdc.username,
						time: utils.timeToString(utils.timeConvert(new Date().getTime(), _dc.date)),
						position: _dc.pos
					}));
	else
		bot.sendChat(utils.replaceString(lang.dc.discBooth, {
						user: userdc.username,
						time: utils.timeToString(utils.timeConvert(new Date().getTime(), _dc.date)),
						perc: Math.floor(_dc.elap)
					}));

	var wl = bot.getWaitlist().slice(),
		pos = (_dc.pos < 1 ? 1 : (_dc.pos > bot.getWaitlist().length ? bot.getWaitlist().length : _dc.pos));
	
	dc.dcqueue.push({
		pos: pos,
		id: userdc.id
	});
	
	processQueue(bot);
}

function dconfigExec(bot, chat, data) {
	var user = auxapi.users.getUserByID(chat.id);
		
	if (!user)
		return bot.sendChat(utils.replaceString(lang.general.ghost, {user: chat.username}));
	
	if (user.role < 2)
		return;
	
	if (data.params.length == 0)
		return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}));
	
	var opt = data.params.shift();
	
	switch (opt) {
		case 'on' :
			if (settings.data.dc.on)
				return bot.sendChat(utils.replaceString(lang.dc.alrAct, {user: chat.username}));
			
			dc.dcqueue = [];
			
			settings.data.dc.on = true;
			settings.save();
			
			bot.sendChat(utils.replaceString(lang.dc.actived, {user: chat.username}));
			break;
		
		case 'off' :
			if (!settings.data.dc.on)
				bot.sendChat(utils.replaceString(lang.dc.alrDis, {user: chat.username}));
			
			settings.data.dc.on = false;
			settings.save();
			
			bot.sendChat(utils.replaceString(lang.dc.disabled, {user: chat.username}));
			break;
			
		case 'timelimit' :
			var time = Math.floor(parseInt(data.params.shift()));
			
			if (isNaN(time) || time < 10 || time > 720)
				return bot.sendChat(utils.replaceString(lang.dc.invalidTime, {user: chat.username}));
			
			settings.data.dc.timelimit = time;
			settings.save();
			
			bot.sendChat(utils.replaceString(lang.dc.newTime, {user: chat.username, time: time}));
			break;
		
		case 'maxelap' :
		case 'maxelapsed' :
			var time = parseInt(data.params.shift());
			
			if (time == 0) {
				settings.data.dc.maxelap = 0;
				settings.save();
				
				return bot.sendChat(utils.replaceString(lang.dc.disTimeElap, {user: chat.username}));
			}
			if (isNaN(time) || time < 0 || time > 100)
				return bot.sendChat(utils.replaceString(lang.dc.invalidPerc, {user: chat.username}));
			
			settings.data.dc.maxelap = time;
			settings.save();
			
			bot.sendChat(utils.replaceString(lang.dc.newTime, {user: chat.username, time: time}));
			break;
		
		case 'best' :
			var on = (data.params.shift()||'').toLowerCase() == 'on';
			
			settings.data.dc.best = on;
			settings.save();
			
			bot.sendChat(utils.replaceString(lang.dc.dcRule, {user: chat.username}) +
						(settings.data.dc.best ? lang.dc.best : lang.dc.lastDC));
			break;
	}
}

function processQueue(bot) {
	if (!settings.data.dc.on) return console.log("dc desativado");
	
	var booth = bot.getBooth(),
		wl = booth.waitlist.slice(),
		wlfull = wl.length == 50,
		isLocked = booth.isLocked;
	
	if (wlfull && !isLocked) {
		console.log("wlfull && !isLocked");
		return bot.setLock(true);
	}
	
	if (isLocked && !dc.dcqueue.length) {
		console.log("isLocked && !dc.dcqueue.length");
		return bot.setLock(false);
	}
	
	if (!dc.dcqueue.length || wl.length == 50) {
		console.log("isLocked && !dc.dcqueue.length");
		return;
	}
	
	var dcreg = dc.dcqueue.shift();
	
	if (bot.getWaitlist().indexOf(dcreg.id) == -1)
		bot.addToWaitlist(dcreg.id, function(err, data) {
			if (err || data.status != 'ok')
				dc.dcqueue.unshift(dcreg);
				
			if (dcreg.pos < wl.length && wl.length)
				bot.moveDJ(dcreg.id, dcreg.pos-1);
		});
	else if (dcreg.pos < wl.length)
		bot.moveDJ(dcreg.id, dcreg.pos-1, function(err, data) {
			if (err || data.status != 'ok')
				dc.dcqueue.unshift(dcreg);
		});
}

var dc = {
	commands: ['dc', 'dconfig'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'user',
	dcqueue: [],
	exec: function(bot, chat, data) {
		switch (data.cmd) {
			case 'dc':
				return execDC(bot, chat, data);
			
			case 'dconfig':
				return dconfigExec(bot, chat, data);
		}
	},
	wluEvent: function(bot, oldwl, newwl) {
		processQueue(bot);
	},
	advEvent: function(bot, booth, media, prev) {
		processQueue(bot);
	},
	lockEvent: function(bot, data) {
		if (dc.dcqueue.length == 0 || !data.isLocked || bot.getBooth().waitlist.length != 50) return;
		
		var mod = auxapi.users.getUserByID(data.moderatorID, true);
		
		if (mod)
			bot.sendChat(utils.replaceString(lang.dc.modUnlockedWL, {user: mod.username}));
		
		bot.setLock(true);
	},
	ulEvent: function(bot, user) {
		if (!user || typeof user != 'object') return;
		
		var userqueue = dc.dcqueue.filter(function(a) { return a.id == user.id; })[0];
		
		if (!userqueue) return;
		
		dc.dcqueue.splice(dc.dcqueue.indexOf(userqueue), 1);
	}
};

module.exports = dc;