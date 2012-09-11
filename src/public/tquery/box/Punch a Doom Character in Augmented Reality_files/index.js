// # Punch Quake II Character
// This is annoted source of an example of [augmentedgesture.js](https://github.com/jeromeetienne/augmentedgesture.js) library.
// This is a minigame in which the player can punch Doom Character in augmented reality.
// The character is displayed in 3D with WebGL.
// The player gestures are recognized thru the webcam by [augmentedgesture.js](https://github.com/jeromeetienne/augmentedgesture.js) library.
// It uses [WebRTC](http://webrtc.org) [getUserMedia](http://dev.w3.org/2011/webrtc/editor/getusermedia.html) to get the webcam
// using open standard.
// You can play this minigame [here](../../examples/punchquake2character/examples)
 
// ## The 3D World

// First we initialize the world in 3D.
// With ```tQuery.createWorld()```, we create a ```tQuery.World```.
// With ```.boilerplate()```, we setup a boilerplate on this world. A boilerplate is
// a fast way to get you started on the right foot. It is the [learningthreejs
// boilerplate for three.js](http://learningthreejs.com/blog/2011/12/20/boilerplate-for-three-js/)
// With ```.start()```, we start the rendering loop. So from now on, the world scene
// gonna be rendered periodically, typically 60time per seconds.
var world	= tQuery.createWorld().boilerplate().start();

// We setup the camera now. We remove the default camera controls from the boilerplate.
// Then we put the camera at 0,1.5,5
world.removeCameraControls()
world.camera().position.set(0,1.5, 10);
world.camera().lookAt(new THREE.Vector3(0,1,-1));

// Change the background color. This confusing line ensure the background of the
// 3D scene will be rendered as ```0x000000``` color, aka black. We set a black
// background to give an impression of night.
world.renderer().setClearColorHex( 0x000000, world.renderer().getClearAlpha() );

// We had a fog to the scene. For that, we use ```tquery.world.createfog.js``` plugins.
world.addFogExp2({density : 0.05});

// ## The Lights 

// Here we setup the lights of our scene. This is important as it determine how
// your scene looks. We add a ambient light and a directional light.
tQuery.createAmbientLight().addTo(world).color(0x444444);
tQuery.createDirectionalLight().addTo(world).position(-1,1,1).color(0xFFFFFF).intensity(3);

// # The Ground

// We create a large checkerboard with ```tquery.checkerboard.js``` plugin.
// We scale the checkerboard to 100 per 100 units in the 3D world. Thus it is
// quite large and disappears into the fog. It gives the cheap impression of
// an infinite checkerboard.
tQuery.createCheckerboard({
	segmentsW	: 100,	// number of segment in width
	segmentsH	: 100	// number of segment in Height
}).addTo(world).scaleBy(100);
// # The Character 

// We use ```tQuery.RatamahattaMD2Character``` plugin. Its inherits from
// ```tQuery.MD2Character``` plugin. All the configuration for this particular
// character ```ratamahatta``` is already done for you.
// We attach it to tQuery world.
var character	= new tQuery.RatamahattaMD2Character().attach(world);
// When an animation is completed, switch to animation
character.bind('animationCompleted', function(character, animationName){
	console.log("anim completed", animationName);
	this.animation('stand');
});
var punch = tQuery.createSphere(new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    })).addTo(world);

punch.position(1,1,1);

var threshold = 128;


var video = document.createElement('video');
video.width = 640;
video.height = 480;
video.loop = true;
video.volume = 0;
video.autoplay = true;


var getUserMedia = function (t, onsuccess, onerror) {
    if (navigator.getUserMedia) {
        return navigator.getUserMedia(t, onsuccess, onerror);
    } else if (navigator.webkitGetUserMedia) {
        return navigator.webkitGetUserMedia(t, onsuccess, onerror);
    } else if (navigator.mozGetUserMedia) {
        return navigator.mozGetUserMedia(t, onsuccess, onerror);
    } else if (navigator.msGetUserMedia) {
        return navigator.msGetUserMedia(t, onsuccess, onerror);
    } else {
        onerror(new Error("No getUserMedia implementation found."));
    }
};
var URL = window.URL || window.webkitURL;
var createObjectURL = URL.createObjectURL || webkitURL.createObjectURL;
if (!createObjectURL) {
    throw new Error("URL.createObjectURL not found.");
}

getUserMedia({
    'video': true
}, function (stream) {
    var url = createObjectURL(stream);
    video.src = url;
}, function (error) {
    alert("Couldn't access webcam.");
});

THREE.Matrix4.prototype.setFromArray = function (m) {
    return this.set(m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15]);
};

function copyMatrix(mat, cm) {
    cm[0] = mat.m00;
    cm[1] = -mat.m10;
    cm[2] = mat.m20;
    cm[3] = 0;
    cm[4] = mat.m01;
    cm[5] = -mat.m11;
    cm[6] = mat.m21;
    cm[7] = 0;
    cm[8] = -mat.m02;
    cm[9] = mat.m12;
    cm[10] = -mat.m22;
    cm[11] = 0;
    cm[12] = mat.m03;
    cm[13] = -mat.m13;
    cm[14] = mat.m23;
    cm[15] = 1;
}

window.onload = function () {

    document.body.appendChild(video);

    //Canvas for JSARToolKit Marker detection
    var canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    document.body.appendChild(canvas);
    canvas.id = "arvideo"


    var ctx = canvas.getContext('2d');
    ctx.font = "24px URW Gothic L, Arial, Sans-serif";

    //JSARToolkit configuration    
    var raster = new NyARRgbRaster_Canvas2D(canvas);
    var param = new FLARParam(320, 240);
    var resultMat = new NyARTransMatResult();
    var detector = new FLARMultiIdMarkerDetector(param, 120);
    detector.setContinueMode(true);
    
    //Auxiliar matrix for transformation
    var tmp = new Float32Array(16);
    
    var times = [];
    var markers = {};
    var lastTime = 0;
















	// # Gesture Analysis
	// now that augmentedgesture.js is giving us the position of each hand, we gonna
	// convert that into events. ```punchingRight``` when the user gives a punch with
	// the right hand and ```punchingLeft``` for the left hand.

	// We establish a variable to store the user moves. It is quite simple
	// ```.punchingRight``` is true when the use is punching with his right hand.
	// ```.punchingLeft``` is the same for the left hand.
	// and ```.changed``` is true when values change.
	var userMove	= {
		punchingRight	: false,
		punchingLeft	: false,
		changed		: false
	};

	// we bind the event ```mousemove.left``` thus we are notified when the user moves his
	// left hand. The algo we use is very simple: if the left hand is on the right part of
	// the screen, then the user is considered "punchingLeft". Dont forget
	// to ```.changed``` to true
	/*aGesture.bind("mousemove.left", function(event){
		var state	= event.x > 1 - 1/3;
		if( state === userMove.punchingLeft )	return;
		userMove.punchingLeft	= state;
		userMove.changed	= true;
	});
	// Now we need the same thing for the other hand. all the the same.
	aGesture.bind("mousemove.right", function(event){
		var state	= event.x < 1/3;
		if( state === userMove.punchingRight )	return;
		userMove.punchingRight	= state;
		userMove.changed	= true;
	});
	*/
	// Now we hook a function to the rendering loop. This function will be executed
	// every time the scene is renderered. The first thing we do in this function
	// is to check that userMove has ```.changed```. If not, we do nothing.
	world.loop().hook(function(){
		ctx.drawImage(video, 0, 0, 320, 240);
        
        canvas.changed = true;
        var x,y,z, change =false;
        var detected = detector.detectMarkerLite(raster, threshold);
        for (var idx = 0; idx < detected; idx++) {
            var id = detector.getIdMarkerData(idx);
            var currId;
            if (id.packetLength > 4) {
                currId = -1;
            } else {
                currId = 0;
                for (var i = 0; i < id.packetLength; i++) {
                    currId = (currId << 8) | id.getPacketData(i);
                }
            }
            if (!markers[currId]) {
                markers[currId] = {};
            }
            detector.getTransformMatrix(idx, resultMat);
            markers[currId].age = 0;
            markers[currId].transform = Object.asCopy(resultMat);
        }
        for (var i in markers) {
            var r = markers[i];
            if (r.age > 1) {
                delete markers[i];
                //world._scene.remove(r.model);
            }
            r.age++;
        }
        for (var i in markers) {
            var m = markers[i];

            copyMatrix(m.transform, tmp);
            x = tmp[12]/-300;
            y = (tmp[13]/300) + 0.5;
            z = (tmp[14]/1000)-1;
            punch.position(x,y,z);
            change = true;
        }
        if(change && x <0.5 && z <0.5){
			character.animation('crpain');
			//character.animation('crdeath');
        }

	});
}