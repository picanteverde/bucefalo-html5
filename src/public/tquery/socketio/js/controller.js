var socket = io.connect(),
	sensitivity = 0.4,
	ax,ay, az;
//socket.emit('my other event',{hello:"world"});
// Lock screen
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


window.addEventListener('devicemotion', function (e) {
	ax = e.accelerationIncludingGravity.x * sensitivity;
	ay = -e.accelerationIncludingGravity.y * sensitivity;
	az = -e.accelerationIncludingGravity.z * sensitivity * -1;
	popup.innerHTML = 'x: ' + ax + ' y: ' + ay + ' z:' + az;
}, false);


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
		popup.innerHTML = 'Sorry, you need iPad ≥ 4.2 to run this app';
		document.getElementById('popup').style.display = 'block';
		return;
	}
	
	setInterval(function(){
			socket.emit('update',{x:ax, y:ay, z: az});
		});

}, false);
