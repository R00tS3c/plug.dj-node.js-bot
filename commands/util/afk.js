var lang = require(process.cwd() + '/lang.json');
var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var utils = require(process.cwd() + '/utils/utils');
var histsession = require(process.cwd() + '/utils/histsession');

function afkCheck() {
    var now = new Date().getTime();
    
    Object.keys(afkremoval.listActivity).forEach(function(id) {
        var usercheck = afkremoval.listActivity[id];
        
        var user = auxapi.users.getUserByID(+id);
        
        var wlpos = afkremoval.bot.getWaitlist().indexOf(id);
        
        if (now - usercheck.lastMsg > 60 * 60 * 1e3 && wlpos != -1) {
            usercheck.warn++;
            
            //Remover os return
            if (usercheck.warn == 1)
            	user && afkremoval.bot.sendChat(utils.replaceString(lang.afkremoval.warn1, {
					user: user.username
				}));
            
            if (usercheck.warn == 2)
               user && afkremoval.bot.sendChat(utils.replaceString(lang.afkremoval.warn2, {
					user: user.username
				}));
            
            if (usercheck.warn == 3) {
            	user && afkremoval.bot.sendChat(utils.replaceString(lang.afkremoval.warn3, {
					user: user.username
				}));
				
                afkremoval.bot.removeDJ(+id);
                usercheck.warn = 0;
                usercheck.lastMsg = now;
            }
        }
        
        var userStaff = settings.data.staff.filter(function(a){ return a.id == +id; })[0];


    });
}

var afkremoval = {
	commands: ['afkremoval', '*'],
	cooldown: 5,
	lastUsed: 0,
	afkthread: null,
	listActivity: {},
	bot: null,
	roleRequired: 'bouncer',
	init: function(bot) {
	    afkremoval.bot = bot;
	    
	    if (settings.data.afkremoval.on) {
	    	var now = new Date().getTime();
	    	auxapi.users.getOnlineUsers().forEach(function(user) {
	    		afkremoval.listActivity[user.id] = {
	    			lastMsg: now,
	        		warn: 0
	    		};
	    	});
	    	
	        afkremoval.afkthread = setInterval(afkCheck, settings.data.afkremoval.interval * 60 * 1e3);
	    }
	},
	exec: function(bot, chat, data) {
	    clearInterval(afkremoval.afkthread);
	    
	    if (data.params.length == 0) {
			settings.data.afkremoval.on = !settings.data.afkremoval.on;
		} else {
		    if (data.params[0].toLowerCase() == 'off')
		        settings.data.afkremoval.on = false;
		    else if (data.params[0].toLowerCase() == 'on')
		        settings.data.afkremoval.on = true;
	        else return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}));
		}

		settings.save();
		
		if (settings.data.afkremoval.on)
		    afkremoval.init(bot);
		
		bot.sendChat(utils.replaceString(settings.data.afkremoval.on && lang.afkremoval.enabled || lang.afkremoval.disabled, {
			user: chat.username
		}));
	},
	execEvent: function(bot, data) {
	    /*
    	{
		   "message": "Olá @Ah morre, diabo,   bem-vindo(a) de volta à nossa balada! Tema do momento: Livre",
		   "username": "VirjsBot",
		   "cid": "4419178-1465659067734",
		   "id": 4419178,
		   "sub": 0,
		   "timestamp": 1465659067766
		}*/
		
	    if (data.message.trim().indexOf('!') == 0 || data.message.toLowerCase().indexOf('[afk]') != -1)
	        return;
	   
	    var userhist = histsession.chat.list.filter(function(a) { return a.id == data.id;})[0];
	    
	    if (userhist) userhist.counter++;
	    else histsession.chat.list.push({id: data.id, counter: 1});
	    
	    histsession.chat.save();
	    
	    if (!afkremoval.listActivity.hasOwnProperty(data.id))
	        afkremoval.listActivity[data.id] = {};
	       
	    afkremoval.listActivity[data.id] = {
	        lastMsg: new Date().getTime(),
	        warn: 0
	    };
	    
	    var userStaff = settings.data.staff.filter(function(a){ return a.id == data.id; })[0];
	    var user = auxapi.users.getUserByID(data.id, true);
	    
//	    console.log(!!userStaff + ', ' + !!user + ', ' + user.role);
	    
	    if (user && typeof user == 'object' && userStaff && typeof userStaff == 'object' && user.role == 0)
	        bot.addStaff(data.id, userStaff.role);
	},
	ujEvent: function(bot, user) {
	    if (!user || typeof user != 'object') return;
	    
	    var userStaff = settings.data.staff.filter(function(a){ return a.id == user.id; })[0];

	    if (user && userStaff && user.role == 0)
	        bot.addStaff(user.id, userStaff.role);
	},
	ulEvent: function(bot, user) {
	    if (!user || typeof user != 'object') return;
	    
	    var userStaff = settings.data.staff.filter(function(a){ return a.id == user.id; })[0];

	    if (user && userStaff)
	        bot.removeStaff(user.id);
	   
	    delete afkremoval.listActivity[user.id];
	}
};

module.exports = afkremoval;