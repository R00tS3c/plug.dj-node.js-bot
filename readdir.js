var fs = require('fs');
var path_sep = '\\';

function loadFiles(dir) {
	fs.readdir(dir, function(err, list) {
		list.forEach(function(a) { 
			var pathFile = dir + path_sep + a;
			
			fs.lstat(pathFile, function(err, stat) {
				if (err) return console.log(err.message);
				
				if (stat.isDirectory())
					loadFiles(pathFile);
				else if (stat.isFile() && pathFile.match(/\.js(on)?$/i)) {
					require(pathFile);
					console.log(pathFile);
				}
			});
		});
	});
}

loadFiles('N:\\virjs\\commands');