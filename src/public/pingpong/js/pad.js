(function(){
	var b = bucefalo,
		pad = b.latigo("pad",{
			a:{x:0, y:0, z:0},
			o:{a:0, b:0, g:0},
			s: 0.01,
			t: 0,
			shim: function(){
				window.performance = window.performance || {};
				window.performance.now = (function() {
					return  window.performance.now       ||
							window.performance.mozNow    ||
							window.performance.msNow     ||
							window.performance.oNow      ||
							window.performance.webkitNow ||
							function() { return new Date().getTime(); };
				})();				
			},
			initSocket: function(game, id){
				var socketid = 'pong-' + game + '-pad-' + id,
					socket = io.connect();
				socket.emit('init', { id: socketid});
				this.socket = socket;
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
				this.game = param['game'];
				this.id = param['id'];
			},
			addEventsHandlers: function(){
				var that = this,
					a = this.a,
					o = this.o,
					s = this.s;
				// Lock screen
				document.addEventListener('touchmove', function (e) { 
					e.preventDefault(); 
				}, false);

				window.addEventListener('devicemotion', function (e) {
					//ax = e.accelerationIncludingGravity.x ;
					//ay = -e.accelerationIncludingGravity.y;
					//az = -e.accelerationIncludingGravity.z;
					var time = (performance.now() - that.t);
					time = time * time;
					a.x = e.acceleration.x * s;
					a.y = e.acceleration.y * s;
					a.z = e.acceleration.z * s;
					that.t = performance.now();
					
					/*
					vx = ((ax - lax)*s/2) * time;
					vy = ((ay - lay)*s/2) * time;
					vz = ((az - laz)*s/2) * time;
					px = ax*sensitivity * time;
					py = ay*sensitivity * time;
					pz = az*sensitivity * time;
					lax = ax;
					lay = ay;
					laz = az;
					*/
				}, false);

				window.addEventListener('deviceorientation', function (e) {
					o.a = e.alpha;
					o.b = e.beta;
					o.g 	= e.gamma;
				}, false);		
			},
			initScreen: function(){
				var that = this;
				this.label = document.createElement('div');
				document.body.appendChild(this.label);
				this.reset = document.createElement('div');
				this.reset.innerHTML ='<h1>RESET</h1>';
				document.body.appendChild(this.reset);
				this.reset.onclick = function(){
					that.sendCenter();
				};
				document.body.appendChild(document.createElement('br'));
				document.body.appendChild(document.createElement('br'));
				document.body.appendChild(document.createElement('br'));
				document.body.appendChild(document.createElement('br'));
				this.ball = document.createElement('div');
				this.ball.innerHTML ='<h1>MOVE BALL</h1>';
				document.body.appendChild(this.ball);
				this.ball.onclick = function(){
					that.sendMoveBall();
				};
			},
			updateScreen: function(){
				var a = this.a,
					o = this.o;
				this.label.innerHTML = '<h1>x: ' + a.x + '<br/>y: ' + a.y + '<br/>z:' + a.z + '<br/>alpha:' + o.a + '<br/>beta:' + o.b + '<br/>gamma:' + o.g +'</h1>';
			},
			sendInfo: function(){
				var evt = 'pong-' + this.game;
				this.socket.emit('publish',{
					event: evt,
					id: this.id,
					type: 'player',
					a: {
						x: this.a.x,
						y: this.a.y,
						z: this.a.z
					},
					o: {
						a: this.o.a,
						b: this.o.b,
						g: this.o.g
					}
				});
			},
			sendCenter: function(){
				var evt = 'pong-' + this.game;
				this.socket.emit('publish',{
					event: evt,
					id: this.id,
					type: 'player-center',
					a: {
						x: this.a.x,
						y: this.a.y,
						z: this.a.z
					},
					o: {
						a: this.o.a,
						b: this.o.b,
						g: this.o.g
					}
				});	
			},
			sendMoveBall: function(){
				var evt = 'pong-' + this.game;
				this.socket.emit('publish',{
					event: evt,
					id: this.id,
					type: 'ball-start',
					a: {
						x: this.a.x,
						y: this.a.y,
						z: this.a.z
					},
					o: {
						a: this.o.a,
						b: this.o.b,
						g: this.o.g
					}
				});	
			},
			init: function(){
				var that = this;
				this.shim();
				this.getParams();
				this.initSocket(this.game, this.id);
				this.t = performance.now();
				this.addEventsHandlers();
				this.initScreen();
				setInterval(function(){
					that.updateScreen();
					that.sendInfo();
				},100);
			},
			startOnLoad: function(w){
				var that = this;
				w.onload = function(){
					that.init();
				};
			}
		}),
		p = pad();
		p.startOnLoad(window);
}());