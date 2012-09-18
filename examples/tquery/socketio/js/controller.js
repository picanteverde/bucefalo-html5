var socket = io.connect(),
	sensitivity = 0.4,
	ax,ay, az,
	al,be,ga,ab,
	id =Math.random();
//socket.emit('my other event',{hello:"world"});
// Lock screen
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


window.addEventListener('devicemotion', function (e) {
	//ax = e.accelerationIncludingGravity.x ;
	//ay = -e.accelerationIncludingGravity.y;
	//az = -e.accelerationIncludingGravity.z;
	ax = e.acceleration.x;
	ay = -e.acceleration.y;
	az = -e.acceleration.z;
}, false);


window.addEventListener('deviceorientation', function (e) {
	al = e.alpha;
	be = e.beta;
	ga 	= e.gamma;
}, false);

setInterval(function(){
	popup.innerHTML = '<h1>x: ' + ax + '<br/>y: ' + ay + '<br/>z:' + az + '<br/>alpha:' + al + '<br/>beta:' + be + '<br/>gamma:' + ga +'</h1>';
},30);

window.addEventListener('load', function () {
	

	var popup = document.getElementById('popup');
	
	/*
	if (!navigator.appVersion.match(/ipad/gi)) {
		popup.innerHTML = 'Sorry, this app is for iPad only';
		popup.style.display = 'block';
		return;
	}
*/
	if (!('ondevicemotion' in window)) {
		popup.innerHTML = 'Sorry, you need iOS ≥ 4.2 to run this app';
		document.getElementById('popup').style.display = 'block';
		return;
	}
	
	setInterval(function(){
			socket.emit('update',{id:id, x:ax, y:ay, z: az, a:al, b:be, g:ga});
		});

}, false);
