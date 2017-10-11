var events = [
	require(process.cwd() + '/commands/util/medialimit'),
	require(process.cwd() + '/commands/util/historycheck'),
	require(process.cwd() + '/commands/admin/autoskip'),
	require(process.cwd() + '/commands/info/songstats'),
	require(process.cwd() + '/commands/info/songinfo')
];

var adv = {
	bot: null,
    init: function(bot) {
    	adv.bot = bot;
		
        bot.on(bot.ADVANCE, adv.onAdvance);
    },
    onAdvance: function(dj, media, prev) {
		events.forEach(function(listener) {
			if (listener.advEvent(adv.bot, dj, media, prev) === false) return false;
		});
    }
};

module.exports = adv;