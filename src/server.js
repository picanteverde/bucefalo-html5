var port = 8027,
	connect = require("connect"),
	util = require("util"),
	app = connect().use(connect.static(__dirname + '/public')).listen(port),
	io = require('socket.io').listen(app),
	screens = {},
	players = {};

io.configure('production', function(){
  io.set('log level', 0);
});

io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});

	socket.on('newScreen', function(msg){
		screens[socket.sessionId] = {type: "screen", socket: socket};
		console.log('new Screen');
	});

	socket.on('screenReady', function(msg){
		socket.emit('positions', players);
	});

	socket.on('debug', function(msg){
		if(players[msg.id]){
			players[msg.id].debug = socket;
			console.log('debuging: ' + msg.id);
		}
	});

	socket.on('update',function(msg){
		var data = { x: msg.x, y: msg.y, z: msg.z, a:msg.a, b:msg.b, g:msg.g, px:msg.px, py: msg.py, pz:msg.pz };
		if(players[msg.id] && players[msg.id].debug){
			players[msg.id].debug.emit('debug-data', data);
			data.debug = players[msg.id].debug;
		}
		players[msg.id] = data;
		//console.log("player " + msg.id + " x:" + msg.x + " y:" +msg.y + " z:" +msg.z);
	});

	socket.on('disconnect', function(){
		if(this.sessionId in players){
			delete players[this.sessionId];
			for(scr in screens){
				screens[scr].socket.emit('leave', this.sessionId);
			}
		}
	});


});

setInterval(function(){
	var p, i = 0;
	console.log("controllers: ");
	for(p in players){
		i++
		console.log(p);
	}
	console.log("Total: "+ i);
},2000);

util.puts("node static on port: " + port)
