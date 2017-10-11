var fs = require('fs');
var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var utils = require('../utils/utils');
var path_sep = '/';

var commands = [];

function loadFiles(dir) {
	fs.readdir(dir, function(err, list) {
	    if (err)
	        return console.log(err);
	        
		list.forEach(function(a) { 
			var pathFile = dir + path_sep + a;
			
			fs.lstat(pathFile, function(err, stat) {
				if (err) return console.log(err.message);
				
				if (stat.isDirectory())
					loadFiles(pathFile);
				else if (stat.isFile() && pathFile.match(/\.js$/i)) {
					commands.push(require(pathFile));
					console.log(pathFile);
				}
			});
		});
	});
}

var chat = {
	bot: null,
    init: function(bot) {
    	chat.bot = bot;
		
		console.log('carregando os comandos');
		
		utils.loadModules(process.cwd() + '/commands', function(module, path) {
			console.log("loaded: " + path);
			commands.push(module);
			typeof module.init == 'function' && module.init(bot);
		});
		
//		loadFiles(process.cwd() + '/commands');

        bot.on(bot.CHAT, chat.onReceive);
		bot.on(bot.CHAT_MENTION, chat.onReceive);
		bot.on(bot.CHAT_COMMAND, chat.onReceive);
    },
    onReceive: function(data) {
	

/*
Special events like flood control, mute,
among others. The event may abort the execution
other events.
*/
		
		var chatevts = commands.filter(function(a) { return a.commands.indexOf('*') != -1; });

		for (var i = 0; i < chatevts.length; i++) {
			if (chatevts[i].execEvent(chat.bot, data) === false) return;
		}
		
		if (data.message.indexOf('!') != 0) return;
		
		var split = data.message.split(' '),
			cmd = split.shift().toLowerCase().substr(1),
			params = split;
		
		var chatcmd = commands.filter(function(a) { return a.commands.indexOf(cmd) != -1;})[0];
		
		if (!chatcmd) return;
		
		var user = auxapi.users.getUserByID(data.id, true);
		
		if (!user) {
			auxapi.users.getUser(data.id, function(_user) {
				if (!_user) return;
				auxapi.users.updateOnlineUser(_user);
			});
			return console.log('user: null');
		}
		
		if (!auxapi.users.hasPermission(user, chatcmd.roleRequired) && settings.data.boss.indexOf(user.id) == -1)
			return console.log('sem permissão: ' + user.role);
		
		var now = new Date().getTime();
		
		if (chatcmd.lastUsed + chatcmd.cooldown > now) return;
		
		chatcmd.lastUsed = now;
		
		var lastmsg = chat.bot.getChat().slice(-2)[0];
		
		chatcmd.exec(chat.bot, data, {cmd: cmd, params: params});
		
		if (chatcmd.deleteMessage && (!lastmsg || lastmsg.id != data.id)) {
			chat.bot.deleteMessage(data.cid);
		}
    }
};

module.exports = chat;