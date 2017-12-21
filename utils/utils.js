var fs = require('fs');

var utils = {
	zeroOrOff: function(val) {
		return parseInt(val) == 0 || val.toString() == 'off';
	},
	replaceString: function(str, obj) {
		if (typeof obj != 'object') return str;
		
		var objk = Object.keys(obj);
		
		objk.forEach(function(k) {
			str = str.split('%%' + k.toUpperCase() + '%%');
			str = str.join(obj[k]);
		});
		return str;
	},
	valueBetween: function(val, min, max) {
		return Math.max(min, Math.min(val, max));
	},
	randomNumberBetween: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	timeConvert: function(d1, d2) {
		var parsed = {
			years: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milisseconds: 0
		};
		var times = {
			year: 31536000e3,
			month: 2628000e3,
			day: 86400e3,
			hour: 3600e3,
			min: 60e3,
			sec: 1e3
		};
		var diff = d1 - (d2||0);

		if (diff >= times.year){
			parsed.years = Math.floor(diff/times.year);
			diff -= parsed.years*times.year;
		}

		if (diff >= times.month){
			parsed.months = Math.floor(diff/times.month);
			diff -= parsed.months*times.month;
		}

		if (diff >= times.day){
			parsed.days = Math.floor(diff/times.day);
			diff -= parsed.days*times.day;
		}

		if (diff >= times.hour){
			parsed.hours = Math.floor(diff/times.hour);
			diff -= parsed.hours*times.hour;
		}

		if (diff >= times.min){
			parsed.minutes = Math.floor(diff/times.min);
			diff -= parsed.minutes*times.min;
		}

		if (diff >= times.sec){
			parsed.seconds = Math.floor(diff/times.sec);
			diff -= parsed.seconds*times.sec;
		}

		parsed.milisseconds = diff;

		return parsed;
	},
	timeToString: function(time) {
		var str = '';
		
		if (time.years)
			str += time.years + ' ano' + (str > 1 ? 's ' : ' ');
		
		if (time.months)
			str += time.months + (str > 1 ? ' meses ' : ' mês ');
		
		if (time.days)
			str += time.days + 'd ';
		
		if (time.hours)
			str += time.hours + 'h ';
		
		if (time.minutes)
			str += time.minutes + 'm ';
		
		if (time.seconds)
			str += time.seconds + 's ';
		
		return str.trim();
	},
	parseYTDur: function(dur) {
		if (typeof dur != 'string') return 0;
		
		var el = dur.match(/\d+[DHMS]/gi);
		
		if (el == null) return 0;
		
		var sec = 0;
		
		el.forEach(function(a) {
			if (a.match(/\d+D/))
				sec += parseInt(a) * 86400;
			
			if (a.match(/\d+H/))
				sec += parseInt(a) * 3600;
			
			if (a.match(/\d+M/))
				sec += parseInt(a) * 60;
			
			if (a.match(/\d+S/))
				sec += parseInt(a);
		});
		
		return sec;
	},
	getSeconds : function(data) {
		var val = -1;
		data+='';
		if ( !isNaN(data) ){
			val = Math.round(parseInt(data));
		}else{
			if ( data.match(/^(\d{1,2}:?){1,3}[^:]$/) ){
				var time = data.split(':').reverse(),
					h = parseInt(time[2]||0),
					min = parseInt(time[1]||0),
					sec = parseInt(time[0]||0);
				
				val = ( min > 59 || sec > 59 ? -1 :  h * 3600 + min*60 + sec);
			}
		}
		return val;
	},
	formatNumber : function(num,corn) {
		num = parseInt(num);
		
		if (isNaN(num))
			num = 0;
			
		var result = num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."),
			dotc = result.match(/\./g)||[];
		
		return result + (corn && dotc.length==2? ' :corn:' : '');
	},
	cloneObject: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	loadModules: function(dir, callback) {
		fs.readdir(dir, function(err, list) {
		    if (err)
		        return console.log(err);
		        
			list.forEach(function(a) { 
				var pathFile = dir + '/' + a;
				
				fs.lstat(pathFile, function(err, stat) {
					if (err) return console.log(err.message);
					
					if (stat.isDirectory())
						utils.loadModules(pathFile, callback);
					else if (stat.isFile() && pathFile.match(/\.js$/i)) {
						if (!callback)
							console.log("Erro: " + pathFile);
							
						callback(require(pathFile), pathFile);
						console.log(pathFile);
					}
				});
			});
		});
	}
};

module.exports = utils;
