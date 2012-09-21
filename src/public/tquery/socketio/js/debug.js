var socket = io.connect(),
	height = 400,
	width = 1000,
	square = 400,
	half = height /2,
	maxLength = 100,
	id,
	players = {},
	createPLayerDebug = function(id, height, width, square){
		var createCanvas = function(height, width){
				var w2 = width / 2,
					h2 = height / 2,
					canvas = document.createElement("canvas"),
					ctx = canvas.getContext('2d');
				canvas.height = height;
				canvas.width = width;
				ctx.clear = function(){
					this.fillStyle = "#FFFFFF";
					this.fillRect(0, 0, width, height);
				};
				ctx.drawY = function (){
					this.strokeStyle = "#DDDDDD";
					this.beginPath();
					this.moveTo(0, h2);
					this.lineTo(width, h2);
					this.stroke();
				};
				ctx.drawX = function(){
					this.strokeStyle = "#DDDDDD";
					this.beginPath();
					this.moveTo(w2, 0);
					this.lineTo(w2, height);
					this.stroke();	
				};
				ctx.drawValues = function (values, y, color, scale){
					var i, 
						l, 
						v,
						deltaX = 0,
						step = width/maxLength;
					l = values.length;
					this.strokeStyle = color;
					this.beginPath();
					for(i = 0; i <l; i++){
						v = values[i];
						if(i === 0){
							this.moveTo(0,h2 - (v[y] * scale));
						}
						this.lineTo(deltaX,h2 - (v[y] * scale));
						deltaX += step;
					}
					this.stroke();
				};
				ctx.drawPoint = function(x ,y , color, scale){
					this.fillStyle = color;
					this.fillRect(((x*scale)+w2)-2, ((y*scale)+w2)-2, 4, 4);
				};
				return {
					canvas: canvas,
					ctx: ctx
				};
			},
			p = { 
				id: id, 
				motion: createCanvas(height, width), 
				orientation: createCanvas(height, width),
				dxy: createCanvas(square, square),
				dxz: createCanvas(square, square),
				xy: createCanvas(square, square),
				xz: createCanvas(square, square),
			};

		p.motion.values = [];
		p.motion.vars = {
			"x": {
				color: "#FF0000",
				scale: 10
			},
			"y": {
				color: "#00FF00",
				scale: 10
			},
			"z": {
				color: "#0000FF",
				scale: 10
			}
		};
		p.orientation.values = [];
		p.orientation.vars = {
			"a": {
				color: "#FF0000",
				scale: 0.5
			},
			"b": {
				color: "#00FF00",
				scale: 0.5
			},
			"g": {
				color: "#0000FF",
				scale: 0.5
			}	
		};
		p.orientation.update = p.motion.update = function(){
			var v,
				vars = this.vars;
			this.ctx.clear();
			this.ctx.drawY();
			for(v in vars){
				if(vars.hasOwnProperty(v)){
					this.ctx.drawValues(this.values, v, vars[v].color, vars[v].scale);
				}
			}
		};
		p.dxy.update = p.dxz.update = p.xy.update = p.xz.update = function(x,y,scale){
			this.ctx.clear();
			this.ctx.drawY();
			this.ctx.drawX();
			this.ctx.drawPoint(x,y,"#FF0000", scale);
		};
		p.delta = {};
		p.position = {
			reset: function(){
				this.x = this.y = this.z = 0;
			}
		};
		p.position.reset();
		p.update = function(){
			this.orientation.update();
			this.motion.update();
			this.dxy.update(-this.delta.x, this.delta.y, 1);
			this.dxz.update(this.delta.x, this.delta.z, 1);
			this.xy.update(-this.position.x, this.position.y, 0.1);
			this.xz.update(this.position.x, this.position.z,0.1);
		};
		return p;
	};


socket.emit('newScreen', { my: 'data' });

if(location.search){
	var p;
	id = location.search.split("=")[1];
	players[id] = p = createPLayerDebug(id,height, width, square);
	document.body.appendChild(p.motion.canvas);
	document.body.appendChild(p.orientation.canvas);
	document.body.appendChild(p.dxy.canvas);
	document.body.appendChild(p.dxz.canvas);
	document.body.appendChild(p.xy.canvas);
	document.body.appendChild(p.xz.canvas);
	var btn = document.createElement("span");
	btn.innerHTML = 'Reset Position';
	btn.addEventListener('click', function(){
		p.position.reset();
	});
	document.body.appendChild(btn);
	socket.emit('debug', {
		id: id
	});
}else{
	setInterval(function(){
		socket.emit('screenReady', {});
	},200);
}



socket.on('debug-data', function(d){
	var p = players[id];
	p.motion.values.push({ x: d.x, y: d.y, z: d.z});
	p.orientation.values.push({ a: d.a, b: d.b, g: d.g});
	p.delta.x = d.px;
	p.delta.y = d.py;
	p.delta.z = d.pz;
	p.position.x += d.px;
	p.position.y += d.py;
	p.position.z += d.pz;
	if(p.motion.values.length > maxLength){
		p.motion.values.shift();
		p.orientation.values.shift();
	}
});

socket.on('positions', function (data) {
	var p,d;
	for(player in data){
		if(data.hasOwnProperty(player)){
			d = data[player];
			if (!players[player]){
				players[player] = p = createPLayerDebug(player, height, width, square);
				document.body.appendChild(p.motion.canvas);
				document.body.appendChild(p.orientation.canvas);
			}
			p = players[player];
			p.motion.values.push({ x: d.x, y: d.y, z: d.z});
			p.orientation.values.push({ a: d.a, b: d.b, g: d.g});

			if(p.motion.values.length > maxLength){
				p.motion.values.shift();
				p.orientation.values.shift();
			}
		}
	}
});



setInterval(function(){
	for(pid in players){
		p = players[pid];
		p.update();
	}
},100);













