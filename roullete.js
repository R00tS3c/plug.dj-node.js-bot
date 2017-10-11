var lang = require(process.cwd() + '/lang.json');
var auxapi = require(process.cwd() + '/auxapi');
var utils = require(process.cwd() + '/utils/utils');
var histsession = require(process.cwd() + '/utils/histsession');

function roulleteThread(pp) {
    var users = histsession.chat.data
        .filter(function(data) {
            var user = auxapi.users.getCachedUsersByID(data.id);
            
            return roullete.ignore.indexOf(data.id) == -1 && user &&
                (pp ? (roullete.bot.getWaitlist() || []).indexOf(data.id) != -1 : user.role == 0);
        })
        .sort(function(a,b){
            if (a.counter > b.counter) return -1; if (a.counter < b.counter) return 1; return 0;
        });
    
    if (users.length) {
        var target = users.shift();
        var user = auxapi.users.getUserByID(target.id);
        
        if (!user) return;
        
        roullete.ignore.push(target.id);
        
        if (!pp) {
            roullete.bot.sendChat(utils.replaceString(lang.roullete.lotteryWinner, {
    			user: user.username
    		}));
            roullete.bot.moveDJ(target.id, 0);
        } else {
            roullete.bot.sendChat(utils.replaceString(lang.roullete.ppWinner, {
    			user: user.username
    		}));
        }
    } else {
        roullete.bot.sendChat(lang.roullete.noUsers);
    }
}

var roullete = {
	commands: ['roullete'],
	cooldown: 5,
	lastUsed: 0,
	thread: null,
	listActivity: {},
	bot: null,
	ignore: [],
	roleRequired: 'manager',
	init: function(bot) {
	    roullete.bot = bot;
	    
	    clearInterval(roullete.thread);
        roullete.thread = setInterval(roulleteThread, 60 * 60 * 1e3);
	},
	exec: function(bot, chat, data) {
	    if (data.params.length == 0) {
	        roullete.init(bot);
	    }
	    
	    if (data.params[0] == 'pp')
	        roulleteThread('pp');
	}
};

module.exports = roullete;
