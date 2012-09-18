var socket = io.connect();
socket.emit('newScreen', { my: 'data' }),

setInterval(function(){
	socket.emit('screenReady',{});
},200);

var height = 400,
	width = 1000,
	half = height /2,
	maxLength = 100,
	players = {};

socket.on('positions', function (data) {
	var i=0,p,d,old;
	for(player in data){
		if(data.hasOwnProperty(player)){
			i++;
			d = data[player];
			if (!players[player]){
				p = {motion: {}, orientation: {}};
				p.motion.canvas = document.createElement("canvas");
				p.motion.canvas.height = height;
				p.motion.canvas.width = width;
				document.body.appendChild(p.motion.canvas);
				p.motion.ctx = p.motion.canvas.getContext('2d');
				p.motion.values = [];
				p.orientation.canvas = document.createElement("canvas");
				p.orientation.canvas.height = height;
				p.orientation.canvas.width = width;
				document.body.appendChild(p.orientation.canvas);
				p.orientation.ctx = p.orientation.canvas.getContext('2d');
				p.orientation.values = [];
				players[player] = p;
			}
			p = players[player];
			p.motion.values.push({ x: d.x, y: d.y, z: d.z});
			p.orientation.values.push({ a: d.a, b: d.b, g: d.g});

			if(p.motion.values.length>maxLength){
				p.motion.values.shift();
			}
			if(p.orientation.values.length>maxLength){
				p.orientation.values.shift();
			}
		}
	}
});



setInterval(function(){
	for(pid in players){
		p = players[pid];
		p.motion.ctx.fillStyle = "#FFFFFF";
		p.motion.ctx.fillRect(0, 0, width, height);
		p.motion.ctx.strokeStyle = "#DDDDDD";
		p.motion.ctx.beginPath();
		p.motion.ctx.moveTo(0,half);
		p.motion.ctx.lineTo(width,half);
		p.motion.ctx.stroke();

		p.orientation.ctx.fillStyle = "#FFFFFF";
		p.orientation.ctx.fillRect(0, 0, width, height);
		p.orientation.ctx.strokeStyle = "#DDDDDD";
		p.orientation.ctx.beginPath();
		p.orientation.ctx.moveTo(0,half);
		p.orientation.ctx.lineTo(width,half);
		p.orientation.ctx.stroke();
		
		drawValues(p.motion.ctx, p.motion.values, "x", "#FF0000", 10 );
		drawValues(p.motion.ctx, p.motion.values,"y","#00FF00", 10 );
		drawValues(p.motion.ctx, p.motion.values,"z","#0000FF", 10 );
		drawValues(p.orientation.ctx, p.orientation.values,"a","#FF0000",0.5 );
		drawValues(p.orientation.ctx, p.orientation.values,"b","#00FF00",0.5 );
		drawValues(p.orientation.ctx, p.orientation.values,"g","#0000FF",0.5 );
	}
},50);

function drawValues(ctx,values,y,color, scale){
	var i, 
		l, 
		v,
		deltaX = 0,
		step = 10;
	l = values.length;
	ctx.strokeStyle = color;
	ctx.beginPath();
	for(i = 0; i <l; i++){
		v = values[i];
		if(i === 0){
			ctx.moveTo(0,half - (v[y] * scale));
		}
		ctx.lineTo(deltaX,half - (v[y] * scale));
		deltaX += step;
	}
	ctx.stroke();
};














