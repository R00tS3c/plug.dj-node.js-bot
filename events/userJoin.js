var events = [
	require(process.cwd() + '/commands/util/afk')
];

var uj = {
	bot: null,
    init: function(bot) {
    	uj.bot = bot;
		
        bot.on(bot.USER_JOIN, uj.onJoin);
    },
    onJoin: function(user) {
		events.forEach(function(listener) {
			if (listener.ujEvent(uj.bot, user) === false) return false;
		});
    }
};

module.exports = uj;