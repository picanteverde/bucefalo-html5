window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();


var socket = io.connect(),
	sensitivity = 0.01,
	ax,ay, az, lax = 0, lay = 0, laz = 0, vx = 0 , vy = 0, vz = 0,
	al,be,ga,
	px = 0, py = 0, pz = 0, t = performance.now(),
	id = Math.random();

if(location.search){
	id = location.search.split("=")[1];
}
// Lock screen
document.addEventListener('touchmove', function (e) { 
	e.preventDefault(); 
}, false);


window.addEventListener('devicemotion', function (e) {
	//ax = e.accelerationIncludingGravity.x ;
	//ay = -e.accelerationIncludingGravity.y;
	//az = -e.accelerationIncludingGravity.z;
	var time = (performance.now() - t);
	time = time * time;
	ax = e.acceleration.x;
	ay = e.acceleration.y;
	az = e.acceleration.z;
	t = performance.now();

	vx = ((ax - lax)*sensitivity/2) * time;
	vy = ((ay - lay)*sensitivity/2) * time;
	vz = ((az - laz)*sensitivity/2) * time;
	px = ax*sensitivity * time;
	py = ay*sensitivity * time;
	pz = az*sensitivity * time;
	lax = ax;
	lay = ay;
	laz = az;
}, false);


window.addEventListener('deviceorientation', function (e) {
	al = e.alpha;
	be = e.beta;
	ga 	= e.gamma;
}, false);

setInterval(function(){
	popup.innerHTML = '<h1>x: ' + ax + '<br/>y: ' + ay + '<br/>z:' + az + '<br/>alpha:' + al + '<br/>beta:' + be + '<br/>gamma:' + ga +'</h1>' + '<h1>px: ' + px + '<br/>py: ' + py + '<br/>pz:' + pz;
	
},1000);

setInterval(function(){
	vx = 0;
	vy = 0;
	vz = 0;
	px = 0;
	py = 0;
	pz = 0;
},5000);
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
		popup.innerHTML = 'Sorry, you need a browser with Device Motion Event to run this app';
		document.getElementById('popup').style.display = 'block';
		return;
	}
	
	setInterval(function(){
			socket.emit('update',{id:id, x:ax, y:ay, z: az, a:al, b:be, g:ga, px: px, py: py, pz: pz});
		});

}, false);
