var port = 8027,
	connect = require("connect"),
	util = require("util"),
	app = connect().use(connect.static(__dirname)).listen(port),
	io = require('socket.io').listen(app),
	b = require("./libs/bucefalo-base.js"),
	clients = {},
	eventsManager = b.latigo("eventManager",{
		events:{},
		publish: function(evt, data){
			var i, arr, f;
			if(this.events[evt]){
				arr = this.events[evt];
				i = arr.length;
				while(i--){
					f = arr[i];
					f(data);
				}
			}
		},
		subscribe: function(evt, fn){
			var events = this.events;
			if(!events[evt]){
				events[evt] = [];
			}
			events[evt].push(fn);
		}
	}),
	em = eventsManager();

io.configure('development', function(){
  io.set('log level', 0);
});

io.sockets.on('connection', function (socket) {

	socket.on('init', function(data){
		clients[data.id] ={
			socket: socket,
			id: data.id
			};
	});

	socket.on('subscribe', function(data){
		var skt, evt = data.event;
		if(clients[data.id]){
			skt = clients[data.id].socket;
			em.subscribe(evt, function(data){
				skt.emit(evt,data);
			});
		}
	});

	socket.on('publish',function(data){
		em.publish(data.event, data);
	});

	socket.on('disconnect', function(){
		var c, client;
		for (c in clients){
			if(clients.hasOwnProperty(c)){
				client = clients[c];
				if(client.socket === socket){
					delete clients[c];
				}
			}
		}
	});


});

setInterval(function(){
	var c, i = 0;
	console.log("clients: ");
	for(c in clients){
		i++
		console.log(c);
	}
	console.log("Total: "+ i);
},200);

util.puts("node static on port: " + port)
