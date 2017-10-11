var events = [
	require(process.cwd() + '/commands/util/dc'),
	require(process.cwd() + '/commands/util/afk'),
];

var ul = {
	bot: null,
    init: function(bot) {
    	ul.bot = bot;
		
        bot.on(bot.USER_LEAVE, ul.onLeave);
    },
    onLeave: function(user) {
		events.forEach(function(listener) {
			if (listener.ulEvent(ul.bot, user) === false) return false;
		});
    }
};

module.exports = ul;