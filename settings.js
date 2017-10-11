var fs = require('fs');

var settings = {
	data: null,
	path: './config.json',
	save: function() {
		fs.writeFile(settings.path, JSON.stringify(settings.data, null, 3), 'utf8');
	},
	load: function() {
		settings.data = JSON.parse(fs.readFileSync(settings.path, 'utf8'));
	}
};

module.exports = settings;