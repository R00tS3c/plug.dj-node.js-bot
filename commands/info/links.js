var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var songinfo = require(process.cwd() + '/commands/info/songinfo');

var links = {
    commands: ['fb', 'facebook', 'rules', 'regras', 'commands', 'comandos', 'image', 'imagem', 'song'],
	cooldown: 1,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'user',
	exec: function(bot, chat, data) {
	    switch(data.cmd) {
/*	        case 'fb':
	        case 'facebook':
	            return bot.sendChat(utils.replaceString(lang.links.fb, {url: settings.data.links.fb}));
*/	           
	        case 'rules':
	            return bot.sendChat(utils.replaceString(lang.links.rules, {url: settings.data.links.rules}));
	       
	        case 'commands':
	            return bot.sendChat(utils.replaceString(lang.links.commands, {url: settings.data.links.commands}));
	        
	        case 'image':
	            return bot.sendChat(utils.replaceString(lang.links.image, {url: songinfo.songImage || lang.links.notAvaliable}));
	    	
	    	case 'song':
	            return bot.sendChat(utils.replaceString(lang.links.song, {url: songinfo.songURL || lang.links.notAvaliable}));
	    }
	}
};

module.exports = links;