var port = 8027,
	connect = require("connect"),
	util = require("util"),
	app = connect().use(connect.static(__dirname + '/public')).listen(port),
	io = require('socket.io').listen(app),
	screens = {};

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

	socket.on('list',function(msg){
		var s,list =[];
		for(s in screens){
			if(screens.hasOwnProperty(s)){
				list.push(screens[s].id);
			}
		}
		socket.emit('list',list);
	});

	socket.on('disconnect', function(){
		var s, scr;
		for (s in screens){
			if(screens.hasOwnProperty(s)){
				scr = screens[s];
				if(scr.socket === socket){
					delete screens[s];
				}
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
},500);

util.puts("node static on port: " + port)
