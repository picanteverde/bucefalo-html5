(function(){
	var b = bucefalo,
		display = b.latigo("display",{
			world: null,
			ball: {
				a: {x:0, y:0, z:0},
				v: {x:0, y:0, z:0},
				p: {x:0, y:1, z:-10}
			},
			dt: 1/30,
			init3DWorld: function(){
				var world	= tQuery.createWorld().boilerplate().start();

				world.removeCameraControls()
				world.camera().position.set(0,6, 15);
				world.camera().lookAt(new THREE.Vector3(0,3,-1));

				// Change the background color. This confusing line ensure the background of the
				// 3D scene will be rendered as ```0x000000``` color, aka black. We set a black
				// background to give an impression of night.
				world.renderer().setClearColorHex( 0x000000, world.renderer().getClearAlpha() );

				// We had a fog to the scene. For that, we use ```tquery.world.createfog.js``` plugins.
				world.addFogExp2({density : 0.005});

				// ## The Lights 

				// Here we setup the lights of our scene. This is important as it determine how
				// your scene looks. We add a ambient light and a directional light.
				tQuery.createAmbientLight().addTo(world).color(0x444444);
				tQuery.createDirectionalLight().addTo(world).position(-1,1,1).color(0xFFFFFF).intensity(3);

				// # The Ground
				tQuery.createCheckerboard({
					segmentsW	: 100,	// number of segment in width
					segmentsH	: 100	// number of segment in Height
				}).addTo(world).scaleBy(100);
				this.myPad = tQuery.createCube(new THREE.MeshLambertMaterial(
					{
						color: 0xCC0000
					})).scale(4,2,1).addTo(world);
				this.otherPad = tQuery.createCube(new THREE.MeshLambertMaterial(
					{
						color: 0x0000CC
					})).scale(4,2,1).addTo(world);
				this.ball3d = tQuery.createSphere(new THREE.MeshLambertMaterial(
					{
						color: 0x00CC00
					})).addTo(world);

				this.ball3d.position(0, 1, -10);

				this.myPad.position(0, 1, 0);
				this.myPad.x = 0;
				this.myPad.y = 1;
				this.otherPad.position(0, 1, -20);
				this.otherPad.x = 0;
				this.otherPad.y = 1;
				this.myPad.center = {a:0, b:0};
				this.otherPad.center = {a:0, b:0};
				this.world = world;
			},
			initSocket: function(game,id){
				var that = this,
					gameid = 'pong-' + game,
					socketid = 'pong-'+ game + '-display-' + id,
					socket = io.connect();
				socket.emit('init', { id: socketid});
				socket.emit('subscribe', { id: socketid, event: gameid });
				socket.on(gameid, function(data){
					that.update(data);
				});
				this.socket = socket;
			},
			update: function(data){
				switch(data.type){
					case 'player':
						if(data.id == this.id){
							this.movePad('myPad', -1, data);
						}else{
							this.movePad('otherPad', 1, data);
						}
						break;
					case 'player-center':
						if(data.id == this.id){
							this.centerPad('myPad', data);
						}else{
							this.centerPad('otherPad', data);
						}
						break;
					case 'ball-hit':
						if(data.id != this.id){
							this.returnBall(data);
						}
						break;
					case 'ball-restart':
						this.ballRestart();
						break;
					case 'ball-start':
						if(data.id == this.id){
							this.moveBallFrom('myPad',-1, data);
						}else{
							this.moveBallFrom('otherPad',1, data);
						}
						break;
				}
			},
			moveBallFrom: function(pad, dir, data){
				var p= this[pad],
					b =  this.ball,
					v = b.v;
				v.x = (Math.sin((data.o.a-p.center.a) *Math.PI/180)*-1)*8;
				v.y = Math.sin(90-data.o.b)*8;
				v.z = dir*30;

			},
			returnBall: function(data){
				var b = this.ball,
					br = data.ball;
				b.a.x = br.a.x;
				b.a.y = br.a.y;
				b.a.z = br.a.z;
				b.v.x = br.v.x;
				b.v.y = br.v.y;
				b.v.z = br.v.z;
				b.p.x = br.p.x;
				b.p.y = br.p.y;
				b.p.z = br.p.z;
			},
			ballRestart: function(){
				var b = this.ball;
				b.a.x = 0;
				b.a.y = 0;
				b.a.z = 0;
				b.v.x = 0;
				b.v.y = 0;
				b.v.z = 0;
				b.p.x = 0;
				b.p.y = 1;
				b.p.z = -10;
			},
			movePad: function(pad, dir, data){
				var p = this[pad];
				p.x = (Math.sin((data.o.a-p.center.a) *Math.PI/180)*dir)*6;
				p.y = (data.o.b+90)/30;
				p.position(p.x, p.y ,pad =="myPad"?0:-20);

			},
			updateBall: function(){
				var b = this.ball,
					dt = this.dt,
					a = b.a,
					v = b.v,
					p = b.p;
				a.x = -0.2 * v.x;
				a.y = -0.2 * v.y;
				a.z = -0.2 * v.z;
				v.x += a.x * dt;
				v.y += a.y * dt;
				v.z += a.z * dt;
				p.x += v.x * dt;
				p.y += v.y * dt;
				p.z += v.z * dt;
				this.ball3d.position(p.x, p.y, p.z);
			},
			checkCollision: function(){
				var b = this.ball,
					pad = this.myPad,
					a = b.a,
					v = b.v,
					p = b.p;
				if(p.x> 6 || p.x <-6){
					v.x = v.x * -1;
				}
				if(p.y> 4 || p.y <1){
					v.y = v.y * -1;
				}
				if(p.z < -20){
					v.z = v.z * -1;
				}
				if(p.z > -1){
					if (p.x < pad.x + 2 && p.x > pad.x -2 && p.y < pad.y + 1 && p.y > pad.y -1){
						v.z = v.z * -1.4;
						console.log('hit');
						this.socket.emit('publish',{
							event: 'pong-' + this.game, 
							type:'ball-hit', 
							id:this.id,
							ball: {
								a: {
									x: a.x,
									y: a.y,
									z: a.z *-1
								},
								v: {
									x: v.x,
									y: v.y,
									z: v.z * -1
								},
								p: {
									x: p.x,
									y: p.y,
									z: (-20 - p.z)
								}
							}
						});
					}
				}
				if(p.z>2){
					console.log('restart');
					this.socket.emit('publish',{
						event :'pong-'+ this.game,
						type:'ball-restart'
					});
					this.ballRestart();
				}
			},
			centerPad: function(pad, data){
				var p = this[pad];
				p.center.a = data.o.a;
				p.center.b = data.o.b;
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
			init: function(){
				var that = this;
				this.init3DWorld();
				this.getParams();
				this.initSocket(this.game, this.id);
				setInterval(function(){
					that.updateBall();
					that.checkCollision();
				}, parseInt(this.dt * 1000));
			},
			startOnLoad: function(w){
				var that = this;
				w.onload = function(){
					that.init();
				};
			}
		}),
	d = display();
	d.startOnLoad(window);
}());
