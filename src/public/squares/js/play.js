(function(){
	var b = bucefalo,
		canvasRenderer = b.latigo("canvasRenderer",{
			fps:30,
			elements:[],
			initCanvas: function(){
				var canvas = document.createElement('canvas');
				document.body.appendChild(canvas);
				this.canvas = canvas;
			},
			initStage: function(){
				var stage = new createjs.Stage(this.canvas);
				createjs.Touch.enable(stage);
				stage.enableMouseOver(this.fps);
				stage.mouseMoveOutside = true;
				this.stage = stage;
			},
			init: function(){
				this.initCanvas();
				this.initStage();
			},
			resize: function(w, h){
				this.canvas.width = w;
				this.canvas.height = h;
			},
			createButton: function(x, y, w, h, color, label, onClick){
				var g,
					c = new createjs.Container(),
					lbl = new createjs.Text(label, "20px Arial", "#33FF22");
				c.btn = new createjs.Shape();
				g = c.btn.graphics;
				g.setStrokeStyle(1, 'round', 'round');
				g.beginStroke('#000');
				g.beginFill(color);
				g.drawRoundRect(0, 0, w, h, 1);
				g.endFill();
				c.addChild(c.btn);
				c.addChild(lbl);
				c.x = x;
				c.y = y;
				this.elements.push(c);
				c.onPress = function(evt){
					onClick(evt);
				};
				this.stage.addChild(c);
				return c;
			},
			remove: function(o){
				this.stage.removeChild(o.o);
				o.o = null;
			},
			add: function(s){
				var g,
					c = new createjs.Container();
				c.square = new createjs.Shape();
				g = c.square.graphics;
				g.setStrokeStyle(1, 'round', 'round');
				g.beginStroke('#000');
				g.beginFill(s.c);
				g.drawRoundRect(0, 0, s.s.w, s.s.h, 1);
				g.endFill();
				c.addChild(c.square);
				c.data = s;
				c.x = s.o.x;
				c.y = s.o.y;
				c.data.o = c;
				this.dragabble(c);
				this.elements.push(c);
				this.stage.addChild(c);
			},
			addSquare: function(s){
				var g,
					c = new createjs.Container();
				c.square = new createjs.Shape();
				c.lbl =  new createjs.Text(s.text, "26px Arial", "#33FF22");
				g = c.square.graphics;
				g.setStrokeStyle(1, 'round', 'round');
				g.beginStroke('#000');
				g.beginFill(s.c);
				g.drawRoundRect(0, 0, s.s.w, s.s.h, 1);
				g.endFill();
				c.addChild(c.square);
				c.addChild(c.lbl);
				c.data = s;
				c.x = s.o.x;
				c.y = s.o.y;
				c.data.o = c;
				s.renewText = function(){
					c.removeChild(c.lbl);
					c.lbl =  new createjs.Text(this.text, "26px Arial", "#33FF22");
					c.addChild(c.lbl);
				};
				this.elements.push(c);
				this.stage.addChild(c);
			},
			showInitScreen: function(cb){
				var g,
					pt,
					s = new createjs.Container();
				s.lbl = new createjs.Text("Ingrese su Id:", "26px Arial", "#33FF22");
				s.bg = new createjs.Shape();
				g = s.bg.graphics;
				g.setStrokeStyle(1, 'round', 'round');
				g.beginStroke('#000');
				g.beginFill('#DDDDEE');
				g.drawRoundRect(0, 0, 300, 300, 1);
				g.endFill();
				s.addChild(s.bg);
				s.addChild(s.lbl);
				s.input = document.createElement('input');
				s.input.type = 'text';
				s.input.style.position = 'absolute';
				document.body.appendChild(s.input);
				this.initScreen = s;
				this.stage.addChild(s);
				pt = s.localToGlobal(0,40);
				s.input.style.top = Math.round(pt.y + this.canvas.offsetTop -10) +'px';
				s.input.style.left = Math.round(pt.x + this.canvas.offsetLeft ) +'px';
			},
			dragabble: function(c){
				var that = this;
				c.onPress = function(evt) {
					var dt = c.data.world.dt,
						old ={
							x: 0,
							y: 0
						},
						delta = {
							x: 0,
							y: 0
						},
						offset = {
							x: c.x - evt.stageX, 
							y: c.y - evt.stageY
						};
					old.x = c.x;
					old.y = c.y;
					c.data.disable();
					that.stage.setChildIndex(c, that.stage.children.length - 1);
					
					evt.onMouseMove = function(ev) {
						c.x = ev.stageX + offset.x;
						c.y = ev.stageY + offset.y;
						delta.x = c.x - old.x;
						delta.y = c.y - old.y;
						old.x = c.x;
						old.y = c.y;
						c.data.p.x = c.x;
						c.data.p.y = c.y;
						c.data.v.x = delta.x/dt;
						c.data.v.y = delta.y/dt;
					
					};

					evt.onMouseUp = function(ev){
						c.data.p.x = c.x;
						c.data.p.y = c.y;
						c.data.v.x = delta.x/dt;
						c.data.v.y = delta.y/dt;
						evt.onMouseMove=null;
						c.data.enable();
					};
				};
			},
			update: function(){
				this.stage.update();
			}
		}),
		unmutable = b.latigo("unmutable",{
			o: {
				x: 0,
				y: 0
			},
			p: {
				x: 0,
				y: 0
			},
			v: {
				x: 0,
				y: 0
			},
			s: {
				w: 100,
				h: 100
			},
			c: '#CC0000',
			text: ''
		}),
		square = b.latigo("square", {
			o: {
				x: 0,
				y: 0
			},
			s: {
				h: 60,
				w: 60
			},
			p: {
				x: 0,
				y: 0
			},
			v: {
				x: 0,
				y: 0
			},
			a: {
				x: 0,
				y: 0
			},
			r: 0.8,
			c: '#CC0000',
			update: function(){
				var a = this.a,
					v = this.v,
					p = this.p,
					o = this.o,
					dt = this.world.dt;
				a.x = -1 * v.x;
				a.y = -1 * v.y;
				v.x += a.x * dt;
				v.y += a.y * dt;
				p.x += v.x * dt;
				p.y += v.y * dt;
				o.x = parseInt(p.x, 10);
				o.y = parseInt(p.y, 10);
				this.world.collitionDetection(this);
			},
			enable: function(){
				this.world.add(this);
			},
			disable: function(){
				this.world.remove(this);
			}
		}),
		dynWorld = b.latigo("dynWorld", {
			objects: [],
			updatables: [],
			w: 640,
			h: 480,
			dt: 1/30,
			update: function(){
				var up = this.updatables,
					i = up.length;
				while(i--){
					up[i].update();
				}
			},
			createSquare: function(){
				var s = square();
				s.world = this;
				this.objects.push(s);
				return s;
			},
			createUnmutable: function(){
				var u = unmutable();
				this.objects.push(u);
				return u;
			},
			add: function(obj){
				var objs = this.updatables;
				if(objs.indexOf(obj) === -1){
					objs.push(obj);
				}
			},
			remove: function(obj){
				var objs = this.updatables,
					idx = objs.indexOf(obj);
				if(idx !== -1){
					objs.splice(idx,1);
				}	
			},
			collitionDetection: function(o){
				this.collitionFrame(o);
				this.collitionObjects(o);
			},
			collitionObjects: function(o){
				var objs = this.objects,
					i = objs.length,
					o2,vx,v1,v2,vy, xColl, yColl;
				while(i--){
					o2 = objs[i];
					if(o !== o2){
						xColl = false;
						yColl = false;
						if((o.o.x <= o2.o.x + o2.s.w) && (o.o.x >= o2.o.x)){
							vx = Math.abs(o.v.x);
							v2 = vx * o.r * -1;
							v1 = vx * o.r;
							xColl = true;
						}
						if((o.o.x + o.s.w >= o2.o.x) && (o.o.x + o.s.w <= o2.o.x + o2.s.w)){
							vx = Math.abs(o.v.x);
							v2 = vx * o.r;
							v1 = vx * o.r * -1;
							xColl = true;
						}
						if(xColl){
							if((o.o.y <= o2.o.y + o2.s.h) && (o.o.y >= o2.o.y)){
								vy = Math.abs(o.v.y);
								o2.v.y = vy * o.r * -1;
								o.v.y = vy * o.r;
								yColl = true;
							}
							if((o.o.y + o.s.h >= o2.o.y) && (o.o.y + o.s.h <= o2.o.y + o2.s.h)){
								vy = Math.abs(o.v.y);
								o2.v.y = vy * o.r;
								o.v.y = vy * o.r * -1;
								yColl = true;	
							}
							if(yColl){
								o2.v.x = v2;
								o.v.x = v1;
								if(o2.collition){
									o2.collition(o);
								}
								if(o.collition){
									o.collition(o2);
								}
							}
						}
					}
				}

			},
			collitionFrame: function(o){
				var p = o.o,
					v = o.v,
					s = o.s,
					r = o.r;
				if(p.x <= 0){
					v.x = Math.abs(v.x) * r; 
				};
				if(p.x + s.w >= this.w){
					v.x = Math.abs(v.x) * -r;
				}
				if(p.y <= 0){
					v.y = Math.abs(v.y) * r;
				}
				if(p.y + s.h >= this.h){
					v.y = Math.abs(v.y) * -r;
				}
			}
		}),
		squares = b.latigo("squares",{
			dt: 1/30,
			world: null,
			renderer: null,
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
				this.left = param['left'];
				this.right = param['right'];
			},
			initSocket: function(){
				var that = this,
					socket = io.connect();
				socket.on('send-to', function(data){
					that.recieve(data);
				});
				socket.on('list',function(data){
					that.list(data);
				});
				this.socket = socket;
			},
			getList: function(){
				this.socket.emit('list',{id: this.id});
			},
			tick: function(){
				this.world.update();
				this.renderer.update();
			},
			createSquare: function(color,x,y){
				var s = this.world.createSquare();
				s.c = color;
				s.o.x = x;
				s.o.y = y;
				this.renderer.add(s);
			},
			recieve: function(data){
				var s = this.world.createSquare();
				if(data.from === 'left'){
					s.p.x = s.o.x = this.world.w - data.o.s.w;
					s.v.x = Math.abs(data.v.x) * -1;
				}else{
					s.p.x = s.o.x = 0;
					s.v.x = Math.abs(data.v.x);
				}
				if (data.o.o.y >= this.wordl.h-20){
					s.p.y = s.o.y = parseInt(this.world.h/2,10);
				}
				s.v.y = data.o.v.y;
				s.c = data.o.c;
				s.enable();
				this.renderer.add(s);
			},
			createClient: function(title, color, x, y, w, h, cb){
				var u = this.world.createUnmutable();
				u.c = color;
				u.text = title;
				u.o.x = x;
				u.o.y = y;
				u.s.h = h;
				u.s.w = w;
				u.collition = cb;
				/*function(o){
					u.text = "OUCH!";
					u.renewText();
				};*/
				this.renderer.addSquare(u);
			},
			showInitScreen: function(){
				var that = this;
				this.renderer.showInitScreen(function(id){
					that.id = id;
					that.socket.emit('init', {id: id });
				});
			},
			initGame: function(){
				var that = this;
				//this.showInitScreen();
				this.getParams();
				this.socket.emit('init', {
					id: this.id
				});
				this.renderer.createButton(100, 0, 80, 20, '#CC0000', 'Rojo', function(){
					that.createSquare('#CC0000', 100, 10);
				});
				this.renderer.createButton(180, 0, 80, 20, '#00CC00', 'Verde', function(){
					that.createSquare('#00CC00', 180, 10);
				});
				this.renderer.createButton(260, 0, 80, 20, '#0000CC', 'Azul', function(){
					that.createSquare('#0000CC', 260,10);
				});
				/*this.renderer.createButton(300,0, 100, 40, '#0000CC', 'List', function(){
					that.getList();
				});*/

				this.createClient(this.left,"#CC0000", 0, 20, 30, this.world.h - 40, function(o){
					o.disable();
					that.renderer.remove(o);
					that.socket.emit('send-to',{
						from: 'left',
						o: {
							p: o.p,
							v: o.v,
							c: o.c
						}
					});
				});
				this.createClient(this.right,"#0000CC", this.world.w - 30, 20, 30, this.world.h - 40, function(o){
					o.disable();
					that.renderer.remove(o);
					that.socket.emit('send-to',{
						from: 'right',
						o: o
					});
				});

			},
			init: function(){
				var that = this;
				this.renderer.init();
				this.world = dynWorld();
				that.resize(window.innerWidth, window.innerHeight);
				this.initSocket();
				this.initGame();
				setInterval(function(){
					that.tick();
				}, parseInt(this.dt * 1000));
			},
			startOnLoad: function(w){
				var that = this;
				w.onload = function(){
					that.init();
					w.onresize = function(){
						that.resize(w.innerWidth, w.innerHeight);
					};
				};
			},
			resize: function(w,h){
				this.world.w = w;
				this.world.h = h;
				this.renderer.resize(w, h);
			}
		},
		function(renderer){
			this.renderer = renderer;
		}),
		renderer = canvasRenderer(),
		game = squares(renderer);
	game.startOnLoad(window);
}());