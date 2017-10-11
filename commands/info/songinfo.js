var https = require('https');

var auxapi = require(process.cwd() + '/auxapi');
var settings = require(process.cwd() + '/settings');
var lang = require(process.cwd() + '/lang.json');
var utils = require(process.cwd() + '/utils/utils');

var skipTO = null;

var songinfo = {
	commands: ['songinfo'],
	cooldown: 5,
	lastUsed: 0,
	deleteMessage: true,
	roleRequired: 'bouncer',
	songURL: null,
	songInfo: null,
	songImage: null,
	exec: function(bot, chat, data) {
		if (data.params.length == 0) {
			if (songinfo.songInfo)
				return bot.sendChat(songinfo.songInfo);
				
			return bot.sendChat(utils.replaceString(lang.songinfo.notLoaded, {
				user: chat.username
			}));
		} else {
		    if (data.params[0].toLowerCase() == 'off')
		        settings.data.songinfo.on = false;
		    else if (data.params[0].toLowerCase() == 'on')
		        settings.data.songinfo.on = true;
	        else return bot.sendChat(utils.replaceString(lang.general.insParams, {user: chat.username}), 60e3);
		}

		settings.save();
		
		bot.sendChat(utils.replaceString(settings.data.songinfo.on && lang.songinfo.enabled || lang.songinfo.disabled, {
			user: chat.username
		}));
	},
	advEvent: function(bot, booth, media, prev) {
		if (skipTO) {
			clearTimeout(skipTO);
			skipTO = null;
		}
		
	    songinfo.songURL = null;
		songinfo.songInfo = null;
		songinfo.songImage = null;
		
		if (booth && booth.dj && media && media.media && media.media.cid) {
			var hostname = (media.media.format == 1 ? 'www.googleapis.com' : 'api.soundcloud.com'),
				path = (media.media.format == 1 ? '/youtube/v3/videos?id=' + media.media.cid + '&part=snippet,contentDetails,statistics,status&key=AIzaSyDg9pSV0Tkbq8fo7I1z_gz4oVN0IZ3TeHw':'/tracks?ids=' + media.media.cid + '&client_id=bd7fb07288b526f6f190bfd02b31b25e&format=json&_status_code_map[302]=200'),
				options = {
					hostname: hostname,
					port: 443,
					path: path,
					method: 'GET',
					headers: {
						Accept:'*/*',
						Origin:'https://plug.dj',
						Referer:'https://plug.dj/balkanmusic-p',
						'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
					}
				};
			
			var req = https.request(options, function(res) {
				res.setEncoding('utf8');
				
				var body = '';
				res.on('data', function(d) {
					body += d;
				});
				res.on('end', function(){
				    var obj = {
				        media: media.media,
				        dj: auxapi.users.getUserByID(booth.dj) || {
				            id: booth.dj,
				            username: 'dj'
				        }
				    };
					if (media.media.format==1)
						songinfo.ytCheck(bot, body, obj);
					else
						songinfo.scCheck(bot, body, obj);
				});
			});

			req.on('error', function(e) {
				console.log(JSON.stringify({"error":e.message}));
			});

			req.end();
		}
	},
	ytCheck: function(bot, obj, adv) {
		if (!obj)
			return bot.sendChat(lang.songinfo.infoFailed);
		
		try{
			obj = JSON.parse(obj);
		}catch(e){
			obj = null;
		}
		
		var ls = settings.data.lockskip;
		
		if ( !obj)
			return bot.sendChat(lang.songinfo.infoFailed);
		if (!Array.isArray(obj.items) || !obj.items.length){
		    bot.sendChat(utils.replaceString(lang.songinfo.notFound, {
    			user: adv.dj.username,
    			pos: ls
    		}));
    		return auxapi.lockskip(ls);
		}
			
		var data = obj.items.shift(),
			rest = data.contentDetails.regionRestriction;

		songinfo.songURL = 'https://youtu.be/' + data.id;
			
		if (data.status && data.status.rejectionReason) {
			bot.sendChat(utils.replaceString(lang.songinfo.notFound, {
    			user: adv.dj.username,
    			pos: ls
    		}));
    		return auxapi.lockskip(ls);
		}
									
		if (data.status && !data.status.embeddable){
			bot.sendChat(utils.replaceString(lang.songinfo.embedDisabled, {
    			user: adv.dj.username,
    			pos: ls
    		}));
    		return auxapi.lockskip(ls);
		}
		
		var title = data.snippet.title,
			author = data.snippet.channelTitle,
			vc = utils.formatNumber(data.statistics.viewCount,true),
			lc = utils.formatNumber(data.statistics.likeCount,true),
			dc = utils.formatNumber(data.statistics.dislikeCount,true),
			cc = utils.formatNumber(data.statistics.commentCount,true),
			ud = new Date(data.snippet.publishedAt).toGMTString();

		var imgq = ['maxres','high','medium','standard','default'];
		
		for (var i in imgq){
			var q = data.snippet.thumbnails[imgq[i]];
			if (q){
				songinfo.songImage = q.url;
				break;
			}							
		}
								
		var ytdurstr = 'unavaliable',
			ytdur = null,
			pdur = adv.media.duration;
		
		try{							
			ytdur = utils.parseYTDur(data.contentDetails.duration);
			ytdurstr = utils.timeToString(utils.timeConvert(ytdur * 1e3));
		}catch(e){
			ytdur=pdur;
		}

		songinfo.songInfo = utils.replaceString(lang.songinfo.statsYT, {
			user: adv.dj.username,
			name: author + ' - ' + title,
			views: vc,
			like: lc,
			dislike: dc,
			comments: cc,
			dur: ytdurstr,
			uploaded: ud
		});
		
		var pdstr = utils.timeToString(utils.timeConvert(pdur * 1e3)),
			ytdstr = utils.timeToString(utils.timeConvert(ytdur * 1e3));
		
		if (ytdur > pdur+3) {
			bot.sendChat(utils.replaceString(lang.songinfo.shorterDuration, {
    			user: adv.dj.username,
    			plugtime: pdstr,
    			sourcetime: ytdstr
    		}));
		}
		if (pdur > ytdur+3) {
			bot.sendChat(utils.replaceString(lang.songinfo.longerDuration, {
    			user: adv.dj.username,
    			plugtime: pdstr,
    			sourcetime: ytdstr
    		}));
    		
    		skipTO = setTimeout(function() {
				bot.skipDJ(adv.dj.id);
			}, (ytdur - bot.getElapsedTime()) * 1e3);
		}

		if (settings.data.songinfo.on)
			bot.sendChat(songinfo.songInfo);

		if (rest){
			if (rest.allowed && rest.allowed.indexOf('BR') == -1 ||
				rest.denied && rest.denied.indexOf('BR') != -1 ||
				rest.blocked && rest.blocked.indexOf('BR') != -1) {
					bot.sendChat(utils.replaceString(lang.songinfo.coutryUnavaliable, {
		    			user: adv.dj.username,
		    			pos: ls
		    		}));
		    		return auxapi.lockskip(ls);
			}
		}
	},
	scCheck: function(bot, obj, adv) {
		if (!obj)
			return bot.sendChat(lang.songinfo.infoFailed);
		
		try{
			obj = JSON.parse(obj);
		}catch(e){
			obj = null;
		}
		
		var ls = settings.data.lockskip;
		
		if (!obj)
			return bot.sendChat(lang.songinfo.infoFailed);
		if (!Array.isArray(obj) || !obj.length){
		    bot.sendChat(utils.replaceString(lang.songinfo.notFound, {
    			user: adv.dj.username,
    			pos: ls
    		}));
    		return auxapi.lockskip(ls);
		}

		var data = obj.shift();

		var title = data.title,
			genre = data.genre,
			fc = utils.formatNumber(data.favoritings_count,true),
			pc = utils.formatNumber(data.playback_count,true),
			username = data.user.username,
			dc = utils.formatNumber(data.download_count,true);
		
		songinfo.songURL = data.permalink_url;
		
		var scdurstr = 'unavaliable',
			scdur = null,
			pdur = adv.media.duration;
		
		try{
			scdurstr = Math.round(data.duration/1e3);
			scdur = scdurstr;
		}catch(e){
			scdur=pdur;
		}

		var pdstr = utils.timeToString(utils.timeConvert(pdur * 1e3)),
			scdstr = utils.timeToString(utils.timeConvert(scdur * 1e3));

		songinfo.songInfo = utils.replaceString(lang.songinfo.statsSC, {
			user: adv.dj.username,
			name: username + ' - ' + title,
			play: pc,
			stars: fc,
			genre: genre,
			dl: dc,
			dur: scdstr,
			uploaded: data.created_at
		});
		
			if (settings.data.songinfo.on)
		bot.sendChat(songinfo.songInfo);
		
		if (scdur > pdur+3) {
			bot.sendChat(utils.replaceString(lang.songinfo.shorterDuration, {
    			user: adv.dj.username,
    			plugtime: pdstr,
    			sourcetime: scdstr
    		}));
		}
		if (pdur > scdur+3) {
			bot.sendChat(utils.replaceString(lang.songinfo.longerDuration, {
    			user: adv.dj.username,
    			plugtime: pdstr,
    			sourcetime: scdstr
    		}));
    		
    		skipTO = setTimeout(function() {
				bot.skipDJ(adv.dj.id);
			}, (scdur-bot.getElapsedTime()) * 1e3);
		}
	}
};

module.exports = songinfo;