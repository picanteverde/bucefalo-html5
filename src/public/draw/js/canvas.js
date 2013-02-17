(function(){
	var b = bucefalo,
		canvas = b.latigo("canvas",{
			dt: 1/30,
			cursors:[],
			w: 640,
			h: 480,
			initCanvas: function(){
				var canvas = document.createElement('canvas');
				document.body.appendChild(canvas);
				this.canvas = canvas;
			},
			getParams: function(){
				var param = {};
				if(location.search){
					location.search.replace(
						new RegExp("([^?=&]+)(=([^&]*))?", "g"),
						function($0, $1, $2, $3) { 
							param[$1] = $3;
						}
					);
				}
				this.id = param['id'];
			},
			initStage: function(){
				var stage = new createjs.Stage(this.canvas);
				createjs.Touch.enable(stage);
				stage.enableMouseOver(20);
				stage.mouseMoveOutside = true;
				this.stage = stage;
			},
			initSocket: function(){
				var that = this,
					canvasId = 'canvas',
					socket = io.connect();
				socket.emit('init', { id: canvasId});
				socket.emit('subscribe', { id: canvasId, event: canvasId });
				socket.on(canvasId, function(data){
					that.update(data);
				});
				this.socket = socket;
			},
			update: function(data){
				switch(data.type){
					case 'move':
						this.move(data);
						break;
					case 'center':
						this.center(data);
						break;
					case 'out':
						this.out(data);
						break;
				}
			},
			center: function(data){
				var c;
				if(this.cursors[data.id]){
					c = this.cursors[data.id];
					c.cen.a = data.o.a;
					c.cen.b = data.o.b;
				}
			},
			move: function(data){
				var c,g;
				if(this.cursors[data.id] && !data.drawing){
					c = this.cursors[data.id];
					if(c.color !== data.color){
						c.removeChild(c.circle);
						c.circle = new createjs.Shape();
						g = c.circle.graphics;
						g.setStrokeStyle(1, 'round', 'round');
						g.beginStroke('#000');
						g.beginFill(data.color);
						g.drawCircle(40,40,40);
						g.endFill();
						c.addChild(c.circle);	
					}
				}else{
					c = new createjs.Container();
					c.circle = new createjs.Shape();
					g = c.circle.graphics;
					g.setStrokeStyle(1, 'round', 'round');
					g.beginStroke('#000');
					g.beginFill(data.color);
					g.drawCircle(40,40,40);
					g.endFill();
					c.addChild(c.circle);
					c.cen = {a:0,b:0,g:0};
					this.stage.addChild(c);
					this.cursors[data.id] = c;
				}
				c.x = (Math.sin((data.o.a - c.cen.a) * Math.PI / 180) * -1 ) * this.w/2 + this.w/2;
				c.y = Math.sin((data.o.b * Math.PI / 180)* -1 ) * this.h/2 + this.h/2;
				c.color = data.color;
				c.drawing = data.drawing;
			},
			tick: function(){
				this.stage.update();
			},
			init: function(){
				var that = this;
				this.initCanvas();
				this.initStage();
				this.initSocket();
				setInterval(function(){
					that.tick();
				}, parseInt(this.dt * 1000));
			},
			startOnLoad: function(w){
				var that = this;
				window.onload = function(){
					that.init();
					that.resize(window.innerWidth, window.innerHeight);
					window.onresize = window.onload = function(){
						that.resize(window.innerWidth, window.innerHeight);
					};
				};
			},
			resize: function(w,h){
				this.canvas.width = this.w = w;
				this.canvas.height = this.h = h;
			}
		}),
	c = canvas();
	c.startOnLoad(window);
}());
