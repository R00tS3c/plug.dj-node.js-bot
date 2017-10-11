var fs = require('fs');

var session = {
	dclist: './dclist.json',
	votelist: './votelist.json',
	chatlist: './chatlist.json',
	dc: {
	    save: function() {
	    	fs.writeFile(session.dclist, JSON.stringify(session.dc.list, null, 3), 'utf8');
    	},
    	load: function() {
    	    try {
    		    session.dc.list = JSON.parse(fs.readFileSync(session.dclist, 'utf8'));
    	    } catch(e) {}
    	},
    	list: []
	},
	vote: {
	    save: function() {
	    	fs.writeFile(session.votelist, JSON.stringify(session.vote.list, null, 3), 'utf8');
    	},
    	load: function() {
    	    try {
    		    session.vote.list = JSON.parse(fs.readFileSync(session.votelist, 'utf8'));
    	    } catch(e) {}
    	},
    	list: []
	},
	chat: {
	    save: function() {
	    	fs.writeFile(session.chatlist, JSON.stringify(session.chat.list, null, 3), 'utf8');
    	},
    	load: function() {
    	    try {
        		session.chat.list = JSON.parse(fs.readFileSync(session.chatlist, 'utf8'));
        	} catch(e) {}
    	},
    	list: []
	}
};

module.exports = session;