var utils = require(process.cwd() + '/utils/utils');
var settings = require(process.cwd() + '/settings');
var histsession = require(process.cwd() + '/utils/histsession');

var room = {
	bot: null,
	onlineUsers: [],
	cachedUsers: [],
	usershist: [],
	hist: [],
	dcutil: {
		dj: 0,
		djstart: 0,
		mediadur: 0,
		wl: [],
		dcs: []
	},
	users: {
		setPluggedUsers: function() {
			room.cachedUsers = utils.cloneObject(room.bot.getUsers());
			room.cachedUsers.push(utils.cloneObject(room.bot.getSelf()));
			
			room.onlineUsers = room.cachedUsers.map(function(a) { return a.id; });
			
			var grabs = room.bot.getGrabs(false);
			
			room.bot.getVotes(false).forEach(function(a) {
				var user = room.cachedUsers.filter(function(b) { return a.id == b.id; })[0];
				
				if (user) {
					user.vote = a.direction;
					user.grab = grabs.indexOf(user.id) != -1;
				}
			});
		},
		getUserByID: function(id, cache) {
			return room.cachedUsers.filter(function(a) { return a.id == +id && (cache ? true : room.onlineUsers.indexOf(+id) != -1); })[0] || null;
		},
		getUserByUsername: function(username, cache) {
			if (!username || typeof username != 'string') return null;
			
			var user = room.cachedUsers.filter(function(a) { return a.username.trim() == username.trim(); })[0] || null;

			if (user && (room.onlineUsers.indexOf(user.id) != -1 || cache))
				return user;
				
			return null;
		},
		getUser: function(id, callback) {
			var user = room.users.getUserByID(id, true);
			
			if (user) return callback && callback(user);
			
			if (!room.bot) return null;
			
			var that = room.users;
			
			room.bot.getUser(id, function(err, user) {
				if (err) return callback && callback(null);
				
				that.updateCacheUser(user);
				return callback && callback(user);
			});
		},
		getUsers: function() {
			return room.users.getOnlineUsers();
		},
		removeCachedUser: function(id) {
			var user = room.cachedUsers.filter(function(a) { return a.id == id; })[0];
			
			if (!user) return false;
			room.cachedUsers.splice(room.cachedUsers.indexOf(user), 1);
			return true;
		},
		removeOnlineUser: function(id) {
			var hasuser = room.onlineUsers.indexOf(id) != -1;
			
			if (!hasuser) return false;
			room.onlineUsers.splice(room.onlineUsers.indexOf(id), 1);
			return true;
		},
		updateCacheUser: function(user) {
			if (!user || typeof user != 'object') return;
			
			var cached = room.cachedUsers.filter(function(a) { return a.id == user.id; })[0];
			
			if (!cached)
				room.onlineUsers.push(user);
			else {
				Object.keys(user).forEach(function(prop) {
					cached[prop] = user[prop];
				});
			}
		},
		updateOnlineUser: function(user) {
			if (!user || typeof user != 'object') return;
			
			room.users.updateCacheUser(user);
			if (room.onlineUsers.indexOf(user.id) == -1)
				room.onlineUsers.push(user.id);
			
			room.users.updateUserHist(user);
		},
		updateUserHist: function(user) {
			if (room.usershist.indexOf(user.id) == -1)
				room.usershist.push(user.id);
		},
		getUsersHist: function() {
			return room.users.getCachedUsersByID(room.usershist);
		},
		getCachedUsersByID: function(ids) {
			return room.cachedUsers.filter(function(a) { return ids.indexOf(a.id) != -1; });
		},
		getOnlineUsers: function() {
			return room.users.getCachedUsersByID(room.onlineUsers);
		},
		getUserByMention: function(mention, cache) {
			if (!isNaN(mention))
				return room.users.getUserByID(+mention, cache);
			
			if (mention.indexOf('@') == 0)
				return room.users.getUserByUsername(mention.substr(1), cache);
			
			return null;
		},
		hasPermission: function(user, role) {
			var roles = [
				'user',
				'resdj',
				'bouncer',
				'manager',
				'cohost',
				'host'
			],
			userRole = user.role;
			
			if (role == 'bouncer+') {
				role = 'manager';
				
				if (settings.data.bouncerplus && userRole == 2)
					userRole = 3;
			}
			
			var aux = roles[userRole];
			
			if (user.gRole) {
				if (user.gRole && userRole < roles.indexOf('manager'))
					aux = 'manager';
				
				if (user.gRole == 5)
					aux = 'host';
			}
			return roles.indexOf(aux) >= roles.indexOf(role);
		}
	},
	history: {
		addToHist: function(hist) {
			/*
				{
					uid: '',
					un: '',
					cid: '',
					time: '',
					hid: ''
			*/
			hist.time = hist.time.replace(/(T|Z)/g, ' ').trim();
			if (!room.hist.filter(function(a) { return a.hid == hist.hid; }).length)
				room.hist.unshift(hist);
		},
		searchInHistory: function(hist, limit) {
			var histLimitList = room.hist.slice(0,limit);
			var result = histLimitList.filter(function(a) { return a.cid == hist.cid; });

			if (!result.length) return null;
			
			var total = room.hist.length,
				len = result.length,
				played = result.filter(function(a) { return a.uid == hist.uid; }).length,
				last = result.shift(),
				user = {id: last.uid, username: last.un},
				time = last.time;

			return {
				total: total,	// history length (all items)
				len: len,	// how many song with this cid was played
				played: played, // how many times the user played this song
				last: last, // last history element from array
				user: user, // user object or user id that played last time
				lastPos: histLimitList.indexOf(last) + 1,
				time: time // when the song was played the last time
			};
		},
		pluggedHistToAux: function(err, list) {
			if (err) return console.log(err);
			
			room.hist = [];
			list.reverse().map(function(a) { return { uid: a.user.id, un: a.user.username, cid: a.media.cid, time: a.timestamp, hid: a.id}; }).forEach(room.history.addToHist);
		},
		lastPlayedToHist: function(last) {
			if (!last || !last.historyID || !last.startTime || !last.media || !last.dj) return;
			
			room.history.addToHist({
				hid: last.historyID,
				time: last.startTime,
				cid: last.media.cid,
				uid: last.dj.id,
				un: last.dj.username
			});
		}
	},
	dc: {
		updateWaitList: function(wl, skipInterval) {
			wl = wl.slice();
			if (wl.length == 0)
				return;
				
			wl.forEach(function(id, pos) {
				var reg = room.dcutil.dcs.filter(function(a) { return a.id == id; });
				
				var dcsfound = reg.filter(function(a) { return a.pos >= pos; });
				
				dcsfound.forEach(function(olddc) { room.dcutil.dcs.splice(room.dcutil.dcs.indexOf(olddc),1); });
			});
			
			histsession.dc.list = room.dcutil.dcs;
			histsession.dc.save();
			
			setTimeout(function() { room.dcutil.wl = wl; }, skipInterval ? 0 : 250);
		},
		updateDJ: function(dj, media, skipInterval) {			
			setTimeout(function() {
				room.dcutil.dj = dj || 0;
				room.dcutil.mediadur = media && media.duration ? media.duration : -1;
				room.dcutil.djstart = (dj ? new Date().getTime() : 0);
			}, skipInterval ? 0 : 250);
		},
		checkUser: function(id) {
			if (!id || !room.dcutil.dj || !room.dcutil.wl.length) return null;
			
			var list = room.dcutil.wl.slice();
			
			list.unshift(room.dcutil.dj);
			
			var position = list.indexOf(id);
			
			if (position == -1 ) return null;
			
			var now = new Date().getTime(),
				newdc = {
					id: id,
					pos: position,
					elap: room.dcutil.mediadur ? (now - room.dcutil.djstart)/10 / room.dcutil.mediadur : 0,
					dur: room.dcutil.mediadur,
					date: now
				};

			room.dcutil.dcs.push(newdc);
			
			histsession.dc.list = room.dcutil.dcs;
			histsession.dc.save();
			
			return newdc;
		},
		getDC: function(id, timelimit, best, elap) {
			var userdcs = room.dcutil.dcs.filter(function(a) {
				return a.id == id &&
						(timelimit ? new Date().getTime() - a.date <= timelimit : true) &&
						(elap && a.pos == 0 ? Math.floor(a.elap) <= elap : true);
			});
			
			return userdcs.sort(function(a, b){
				if (best) {
					if (a.pos < b.pos) return -1;
					if (a.pos > b.pos) return 1;
				} else {
					if (a.date < b.date) return -1;
					if (a.date > b.date) return 1;
				}
				return 0;
			});
		}
	},
	lockskip: function(position, callback) {
		var booth = room.bot.getBooth(),
			wl = booth.waitlist.slice(),
			wlfull = wl.length == 50,
			isLocked = booth.isLocked,
			shouldCycle = booth.shouldCycle,
			dj = booth.dj;
		
		position--;
		
		if (!dj) return callback ? callback() : null;
		
		function toggleCycle(mode, callback) {
			if (shouldCycle == mode) return callback && callback(true);
			
			room.bot.setCycle(mode, function(err, data) {
				return callback && callback(err ? false : true);
			});
		}
		
		function toggleLock(mode, callback) {
			if (isLocked == mode) return callback && callback(true);
			
			if (mode && !wlfull) return callback && callback(true);
			
			room.bot.setLock(mode, false, function(err, data) {
				return callback(err ? false : true);
			});
		}
		
// 1. if the cycle is off, turn it on
// 2. if the queue is full, lock it
// 3.
// 4. move the user to the position if possible
// 5. if the cycle was activated during ls, disable it
// 6. if the lock was triggered, unlock it
		
		toggleCycle(true, function(cycleSuccess) {
			if (!cycleSuccess) return callback && callback(false);
			
			toggleLock(true, function(lockSuccess) {
				if (!lockSuccess) return callback && callback(false);
				
				room.bot.skipDJ(dj, function(err, skipSuccess) {
					if (err) return callback && callback(false);
					
					if (wl.length > position)
						room.bot.moveDJ(dj, position, function(moveSuccess) {
							return callback && callback(err ? false : true);
						});
					else 
						callback && callback(true);
					
					room.bot.setCycle(shouldCycle);
					room.bot.setLock(isLocked, false);
				});
			});
		});
	},
	deleteChat: function(cid, callback) {
		if (!cid) return;
	},
	init: function(bot) {
		room.bot = bot;
		
		histsession.dc.load();
		histsession.chat.load();
		
		room.dcutil.dcs = histsession.dc.list;
		
		function updateUser(user) {
			room.users.updateOnlineUser(user);
		}
		
		room.users.setPluggedUsers();
		
		bot.getRoomHistory(room.history.pluggedHistToAux);
		
		room.dc.updateWaitList(bot.getWaitlist() || [], true);
		room.dc.updateDJ(bot.getBooth().dj, bot.getMedia(), true);

		bot.on(bot.ADVANCE, function(dj, media, prev) {
			room.cachedUsers.forEach(function(user) {
				user.vote = 0;
				user.grab = false;
			});
			
			room.dc.updateDJ(bot.getBooth().dj, bot.getMedia());
			room.dc.updateWaitList(bot.getWaitlist() || []);
			room.history.lastPlayedToHist(prev);
		});

		bot.on(bot.WAITLIST_UPDATE, function(oldlist, newlist) {
			room.dc.updateWaitList(newlist || []);
		});

		bot.on(bot.GRAB, function(data) {
			var cached = room.users.getUserByID(data.id, true);
			if (!cached)
				room.users.getUser(function(user) {
					if (user)
						user.grab = room.bot.getGrabs(false).indexOf(data.id) != -1;
				});
			else
				cached.grab = true;
		});
		
		bot.on(bot.VOTE, function(data) {
			var cached = room.users.getUserByID(data.id, true);
			
			if (!cached)
				room.users.getUser(function(user) {
					if (user)
						room.bot.getVotes(false).forEach(function(a) {
							if (a.id == user.id) {
								user.vote = a.direction;
								return false;
							}
						});
				});
			else
				cached.vote = data.direction;
		});
		
		bot.on(bot.USER_JOIN, updateUser);
		bot.on(bot.FRIEND_JOIN, updateUser);
		bot.on(bot.USER_UPDATE, updateUser);
		
		bot.on(bot.USER_LEAVE, function(user, id) {
			room.dc.checkUser(id);
			room.dc.getDC(id);
			room.users.removeOnlineUser(id);
			
			console.log(room.dc.getDC(id));
			
			var cached = room.users.getUserByID(id, true);
			
			if (!cached)
				room.users.getUser(id, function(usr) {
					usr.vote = 0;
					usr.grab = false;
				});
			else {
				if (user)
					Object.keys(user).forEach(function(prop) {
						cached[prop] = user[prop];
					});
				
				cached.vote = 0;
				cached.grab = false;
			}
			
		});
		
		bot.on(bot.MOD_STAFF, function(promotions) {
			promotions.forEach(function(user) {
				var cached = room.users.getUserByID(user.targetID, true);
				
				if (cached) {
					cached.role = user.targetRole;
				}
			});
		});
	}
};

module.exports = room;