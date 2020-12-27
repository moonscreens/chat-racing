const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let horizonStart = null;
const roadSegments = 5;
let roadWidth = null;

ctx.drawRoad = (segment, x, y, w, h) => {
	ctx.fillStyle = '#000';
	ctx.fillRect(x, y, w, h);
	ctx.fillStyle = '#fff';
	if (segment < Math.floor(roadSegments / 2)) {
		ctx.fillRect(Math.round(x + w / 2), y, 1, h);
		ctx.fillStyle = '#f00';
	} else {
		ctx.fillStyle = '#fff';
	}
	ctx.fillRect(x, y, 1, h);
	ctx.fillRect(x + w - 1, y, 1, h);

}


function getSinY (y) {
	return Math.sin((y / canvas.height) * 8 + Date.now() / 1000);
}

let lastFrame = Date.now();

const roadTickSlow = 3;
let roadTick = 0;
function draw() {
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;
	lastFrame = Date.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#87CEEB';
	ctx.fillRect(0, 0, canvas.width, horizonStart);
	ctx.fillStyle = '#FFE877';
	ctx.fillRect(0, horizonStart, canvas.width, canvas.height);


	let tempRoadTick = Math.floor(roadTick / roadTickSlow);
	for (let index = Math.ceil(canvas.height); index >= horizonStart; index--) {

		let y = index;
		let width = roadWidth;
		width *= y / canvas.height;

		let x = getSinY(y) * 10;
		ctx.drawRoad(
			tempRoadTick,
			Math.round((canvas.width / 2 - width / 2) + x),
			index,
			Math.round(width),
			2
		)

		tempRoadTick++;
		if (tempRoadTick >= roadSegments) tempRoadTick = 0;
	}

	roadTick++;
	if (roadTick >= roadSegments * roadTickSlow) roadTick = 0;
}

function resize() {
	canvas.width = Math.round(window.innerWidth / 8);
	canvas.height = Math.round(window.innerHeight / 8);
	horizonStart = Math.round(canvas.height / 2);

	roadWidth = Math.floor(Math.min(canvas.width, canvas.height) * 0.75);
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);

	draw();
})