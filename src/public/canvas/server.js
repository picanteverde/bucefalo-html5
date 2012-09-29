var port = 8027,
	connect = require("connect"),
	util = require("util"),
	app = connect().use(connect.static(__dirname + '/public')).listen(port),
	io = require('socket.io').listen(app),
	screens = {}, players={};

io.configure('production', function(){
  io.set('log level', 0);
});

io.sockets.on('connection', function (socket) {

	socket.on('init-screen', function(msg){
		screens[msg.id] ={
			socket: socket,
			id: msg.id
			};
	});

	socket.on('send-to', function(msg){
		if(screens[msg.to]){
			screens[msg.to].socket.emit('receive',msg);
		}
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
	var s, i = 0;
	console.log("players: ");
	for(s in screens){
		i++
		console.log(s);
	}
	console.log("Total: "+ i);
},200);

util.puts("node static on port: " + port)
