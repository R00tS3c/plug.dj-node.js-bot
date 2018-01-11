var fs = require('fs');
var Plugged = require("./plugged");
var auxapi = require('./auxapi');
var utils = require('./utils/utils');
var settings = require(process.cwd() + '/settings');
const express = require('express');
const app = express();



var plugged = new Plugged();

plugged.log = console.log;

// log into the service
plugged.login({ email: "balkanparty291@gmail.com", password: "wizzard1997" });
//fb login
/*
plugged.login({
    userID: "your ID here",
    accessToken: "your access token here"
} callback);
*/

plugged.on(plugged.LOGIN_SUCCESS, function(data) {
	console.log('Login ok');
    plugged.cacheChat(true);
    plugged.connect("anime404balkan");
});

plugged.on(plugged.LOGIN_ERROR, function(err) {
	console.log('Erro no login');
    console.log(err);
});

plugged.on(plugged.JOINED_ROOM, function() {
	auxapi.init(plugged);
	settings.load();
	
	utils.loadModules(process.cwd() + '/events', function(module, path) {
		module.init(plugged);
	});
		
	plugged.woot();
	
//	require(process.cwd() + '/events/chat').init(plugged);
});


plugged.on(plugged.JOINED_ROOM, function _joinedRoom() {
    plugged.on(plugged.ADVANCE, function() {
        //WOOT!
        plugged.woot();
    });
});
/*
plugged.on(plugged.CHAT_DELETE, function(data) {
	console.log(data ? JSON.stringify(data, null, 3) : 'Nada');
});

plugged.on(plugged.VOTE, function(data) {
	console.log(data ? JSON.stringify(data, null, 3) : 'Nada');
});*/

app.get('/', (req, res) => res.send('Community Bot'));
app.listen(process.env.PORT || 3000, () => console.log('Bot Running!'));
