var port = 8028,
	connect = require("connect"),
	util = require("util"),
	app = connect().use(connect.static(__dirname + '/public')).listen(port);
util.puts("node static on port: " + port)
