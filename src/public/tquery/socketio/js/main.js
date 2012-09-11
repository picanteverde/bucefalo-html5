var world	= tQuery.createWorld().boilerplate().start();

world.removeCameraControls()
world.camera().position.set(0,1.5, 10);
world.camera().lookAt(new THREE.Vector3(0,1,-1));

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


var socket = io.connect();
socket.emit('newScreen', { my: 'data' });
setInterval(function(){
	socket.emit('screenReady',{});
},50);
var players = {};
socket.on('positions', function (data) {
	var i=0;
	for(player in data){
		i++;
		if (!players[player]){
			players[player] = tQuery.createSphere(new THREE.MeshLambertMaterial(
			{
				color: 0xCC0000
			})).addTo(world);
		}
		players[player].position(data[player].x, data[player].y, data[player].z);
	}
	//console.log('positions ' + i);
});
