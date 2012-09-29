(function(){
	var createPhysicWorld = function(options){
		var world = {
			dt: options.dt || 1/30,
			g: options.g === undefined ? 9.81 : options.g,
			s: options.s || 1,
			objects:[],
			objs_update:[],
			update: function(){
				var objs = this.objs_update,
					i = objs.length;
				while(i--){
					objs[i].update();
				}
			},
			addSim: function(obj){
				var objs = this.objs_update;
				if(objs.indexOf(obj) === -1){
					objs.push(obj);
				}
			},
			removeSim: function(obj){
				var objs = this.objs_update,
					idx = objs.indexOf(obj);
				if(idx !== -1){
					objs.splice(idx,1);
				}	
			},
			createObject: function(options){
				var obj = {
						world: this,
						F: options.F || {x: 0, y: 0}, //Force
						Fs: options.Fs || [],
						p: options.p || {x: 0, y: 0}, //position
						v: options.v || {x: 0, y: 0}, //velocity
						a: options.a || {x: 0, y: 0}, //aceleration
						m: options.m || 1, //mass
						r: options.r || -0.7, //restitution
						o: options.o || {x:0, y:0},
						getData: function(){
							return {
								p: this.p,
								v: this.v,
								a: this.a,
								m: this.m,
								r: this.r
							};
						},
						getPx: function(){ 
							var p = this.p;
							return {
								x: parseInt(p.x, 10),
								y: parseInt(p.y, 10)
							};
						},
						reset: function(){
							this.v.x = this.v.y = this.a.x = this.a.y = this.p.x = this.p.y = 0;
						},
						enable: function(){
							this.world.addSim(this);
						},
						disable: function(){
							this.world.removeSim(this);
						},
						addForce: function(f){
							if(this.Fs.indexOf(f) === -1){
								this.Fs.push(f);								
							}
							return f;
						},
						removeForce: function(f){
							if(this.Fs.indexOf(f) !== -1){
								this.Fs.splice(this.Fs.indexOf(f),1);
							}
							return f;
						},
						update: function(){
							var a = this.a,
								v = this.v,
								p = this.p,
								o = this.o,
								dt = this.world.dt,
								dt2 = dt*dt,
								s = this.world.s;
							a.x = -2 * v.x;
							a.y = -2 * v.y;
							v.x += a.x * dt;
							v.y += a.y * dt;
							p.x += v.x * dt ;
							p.y += v.y *dt;
							o.x = parseInt(p.x, 10);
							o.y = parseInt(p.y, 10);

						},
						update1: function(){
							var F = this.F,
								Fs = this.Fs,f,
								i = Fs.length,
								a = this.a,
								v = this.v,
								p = this.p,
								m = this.m,
								g = this.world.g,
								s = this.world.s,
								dt = this.world.dt,
								o = this.o;

							F.x = 0;
							F.y = 0;

							while(i--){
								f = Fs[i]();
								F.x += f.x;
								F.y += f.y;
							}

							F.x = isNaN(F.x) ? 0 : F.x;
							F.y = isNaN(F.y) ? 0 : F.y;
							
							//inertia
							F.x += m * (a.x) * 0.1;
							F.y += m * (a.y) * 0.1;

							a.x = F.x/m;
							a.y = g + F.y/m;
							
							v.x += a.x * dt;
							v.y += a.y * dt;

							p.x += v.x * dt * s;
							p.y += v.y * dt * s;
							
							o.x = parseInt(p.x, 10);
							o.y = parseInt(p.y, 10);
						}
					};
				this.objects.push(obj);
				return obj;
			}
		};


		return world;
	};

	createWindow = function(stage, phy){
		var win = new createjs.Container(),
			title = new createjs.Shape(),
			content = new createjs.Shape(),
			g = title.graphics,
			g1 = content.graphics,
			addDragAndDrop = function(title, win){

				title.onPress = function(evt) {
					var old ={x:0, y:0},
						delta = {x:0, y:0};
					var offset = {
						x: win.x - evt.stageX, 
						y: win.y - evt.stageY
					};
					old.x = win.x;
					old.y = win.y;
					win.phy.disable();
					//win.phy.reset();
					//win.phy.p.x = win.x;
					//win.phy.p.y = win.y;

					stage.setChildIndex(win, stage.children.length - 1);
					
					// add a handler to the event object's onMouseMove callback
					// this will be active until the user releases the mouse button:
					evt.onMouseMove = function(ev) {
						win.x = ev.stageX + offset.x;
						win.y = ev.stageY + offset.y;
						delta.x = win.x - old.x;
						delta.y = win.y - old.y;
						old.x = win.x;
						old.y = win.y;
						//win.phy.to.x = ev.stageX + offset.x;
						//win.phy.to.y = ev.stageY + offset.y;
						// indicate that the stage should be updated on the next tick:
						
					};

					evt.onMouseUp = function(ev){
						win.phy.reset();
						win.phy.p.x = win.x;
						win.phy.p.y = win.y;
						win.phy.v.x = delta.x/win.phy.world.dt;
						win.phy.v.y = delta.y/win.phy.world.dt;
						win.phy.enable();
					};
				};

				
				/*target.onMouseOver = function() {
					target.scaleX = target.scaleY = target.scale*1.2;
					update = true;
				}
				target.onMouseOut = function() {
					target.scaleX = target.scaleY = target.scale;
					update = true;
				}*/
				return win;
			};

		win.phy = phy;
		phy.o = win;

		g.setStrokeStyle(2, 'round', 'round');
		g.beginStroke('#000');
		g.beginFill('#00DD00');
		g.drawRoundRect(0, 0, 300, 40,1);
		g.endFill();

		g1.setStrokeStyle(2, 'round', 'round');
		g1.beginStroke('#000');
		g1.beginFill('#FFFFFF');
		g1.drawRoundRect(0, 0, 300, 200,1);
		g1.endFill();

		title.x = title.y = content.x = 0;
		content.y = 40;

		win.addChild(title);
		win.addChild(content);
		
		addDragAndDrop(title,win);
		win.x = phy.p.x;
		win.y = phy.p.y;

		stage.addChild(win);
		return win;
	};

	window.createGame = function(name){
		var fps = 30,
			defaultWidth = 640,
			defaultHeight = 480,
			socket = io.connect(),
			phyWorld = createPhysicWorld({
				dt: 1/createjs.Ticker.getFPS(),
				g: 0,
				s: 10
			}),
			param ={},
			canvas = document.createElement('canvas'),
			stage = new createjs.Stage(canvas);

			createjs.Touch.enable(stage);
			stage.enableMouseOver(20);
			stage.mouseMoveOutside = true;
			
			document.body.appendChild(canvas);
			
			if(location.search){
				location.search.replace(
					new RegExp("([^?=&]+)(=([^&]*))?", "g"),
					function($0, $1, $2, $3) { 
						param[$1] = $3;
					}
				);
				socket.emit('init-screen', {id: param["id"]});
			}

			return {
				w: defaultWidth,
				h: defaultHeight,
				windows: [],
				resize: function(w,h){
					canvas.width = this.w = w;
					canvas.height = this.h = h;
				},
				newWindow: function(){
					var phy = phyWorld.createObject({
							m: 40
						});
					phy.to = {x:0, y:0};
					phy.addForce(function(){
						return {
							x: (phy.to.x - phy.p.x)*2,
							y: (phy.to.y - phy.p.y)*2
						};
					});
					phy.enable();
					phy.p.x = 50;
					phy.p.y = 0;
					this.windows.push(createWindow(stage, phy));
				},
				tick: function(){
					phyWorld.update();
					stage.update();
					this.collitions();
				},
				collitions: function(){
					var w,
						ws = this.windows,
						i = ws.length;
					while(i--){
						w = ws[i];
						if(w.x < 10){
							this.send(w, 'left');
						};
						if(w.x + 300 > this.w - 10){
							this.send(w, 'right');
						}
					}
				},
				send: function(win, direction){
					stage.removeChild(win);
					win.phy.disable();
					this.windows.splice(this.windows.indexOf(win),1);
					socket.emit('send-to',{
						to: param[direction],
						from: direction,
						data: win.phy.getData()
					});
				},
				start: function(){
					var that = this;
					stage.upd = true;
					//createjs.Ticker.setFPS(fps);
					createjs.Ticker.addListener(this, false);
					this.newWindow();
					this.newWindow();
					socket.on('receive', function(msg){
						if(msg.from ==='left'){
							msg.data.p.x = that.w - 311;
						}else{
							msg.data.p.x = 11;
						}
						if(msg.data.p.y > that.h){
							msg.data.p.y = parseInt(that.h/2, 10);
						}
						var phy = phyWorld.createObject(msg.data);
						phy.to = {x:that.w/2, y:that.h/2};
						phy.addForce(function(){
							return {
								x: (phy.to.x - phy.p.x)*2,
								y: (phy.to.y - phy.p.y)*2
							};
						});
						phy.enable();
						that.windows.push(createWindow(stage, phy));
					});
				}
			};
	};
}());


var game = createGame('family');
game.start();
window.onresize = window.onload = function(){
	game.resize(window.innerWidth, window.innerHeight);
};