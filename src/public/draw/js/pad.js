(function(){
	var b = bucefalo,
		pad = b.latigo("pad",{
			a:{x:0, y:0, z:0},
			o:{a:0, b:0, g:0},
			s: 0.01,
			t: 0,
			drawing: false,
			labels:[],
			color: '#000',
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
			initSocket: function(){
				var socketid = 'canvas',
					socket = io.connect();
				socket.emit('init', { id: this.id});
				this.socket = socket;
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
				this.createColorBtn('GREEN','#00CC00');
				this.createColorBtn('RED','#CC0000');
				this.createColorBtn('BLUE','#0000CC');
				this.createColorBtn('BLACK','#000000');
				this.createColorBtn('WHITE','#FFFFFF');
			},
			createColorBtn: function(label, color){
				var that =this;
				document.body.appendChild(document.createElement('br'));
				document.body.appendChild(document.createElement('br'));
				var lbl = document.createElement('div');
				lbl.innerHTML ='<h1 style="background-color:'+ color +'">' + label + '</h1>';
				document.body.appendChild(lbl);
				lbl.onclick = function(){
					that.setColor(color);
					that.drawing = !that.drawing;
				};

				this.labels.push(lbl);	
			},
			setColor: function(color){
				this.color = color;
			},
			updateScreen: function(){
				var a = this.a,
					o = this.o;
				this.label.innerHTML = '<h1>x: ' + a.x + '<br/>y: ' + a.y + '<br/>z:' + a.z + '<br/>alpha:' + o.a + '<br/>beta:' + o.b + '<br/>gamma:' + o.g +'</h1>';
			},
			sendInfo: function(){
				var evt = 'canvas';
				this.socket.emit('publish',{
					event: evt,
					id: this.id,
					type: 'move',
					a: {
						x: this.a.x,
						y: this.a.y,
						z: this.a.z
					},
					o: {
						a: this.o.a,
						b: this.o.b,
						g: this.o.g
					},
					color: this.color,
					drawing: this.drawing
				});
			},
			sendCenter: function(){
				var evt = 'canvas';
				this.socket.emit('publish',{
					event: evt,
					id: this.id,
					type: 'center',
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
				this.id = parseInt(Math.random()*100);
				this.initSocket();
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