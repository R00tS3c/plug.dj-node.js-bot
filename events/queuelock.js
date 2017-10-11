var events = [
	require(process.cwd() + '/commands/util/dc'),
];

var ql = {
	bot: null,
    init: function(bot) {
    	ql.bot = bot;
		
        bot.on(bot.DJ_LIST_LOCKED, ql.onLocked);
    },
    onLocked: function(data) {
		events.forEach(function(listener) {
			if (listener.lockEvent(ql.bot, data) === false) return false;
		});
    }
};

module.exports = ql;