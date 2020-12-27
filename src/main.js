const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;


const inversePixelRatio = 15;
let horizonStart = 0;

let roadWidth = 10;

const roadCanvases = [];
const roadCtx = [];
for (let index = 0; index < 5; index++) {
	roadCanvases[index] = document.createElement('canvas');
	roadCtx[index] = roadCanvases[index].getContext('2d');
}

function generateRoads() {
	for (let index = 0; index < roadCanvases.length; index++) {
		const canvas = roadCanvases[index];
		canvas.width = roadWidth * inversePixelRatio;
		canvas.height = 1 * inversePixelRatio;

		const ctx = roadCtx[index];
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#fff';
		if (index < Math.floor(roadCanvases.length / 2)) {
			ctx.fillRect(Math.round(canvas.width / 2), 0, inversePixelRatio, inversePixelRatio);
			ctx.fillStyle = '#f00';
		} else {
			ctx.fillStyle = '#fff';
		}
		ctx.fillRect(0, 0, inversePixelRatio, inversePixelRatio);
		ctx.fillRect(canvas.width - inversePixelRatio, 0, inversePixelRatio, inversePixelRatio);
	}
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
	ctx.fillRect(0, 0, canvas.width, horizonStart * inversePixelRatio);
	ctx.fillStyle = '#00ff00';
	ctx.fillRect(0, horizonStart * inversePixelRatio, canvas.width, canvas.height);


	let tempRoadTick = Math.floor(roadTick / roadTickSlow);
	for (let index = Math.ceil(canvas.height / inversePixelRatio); index >= horizonStart; index--) {
		const c = roadCanvases[tempRoadTick];

		let y = index * inversePixelRatio;
		let width = c.width;
		width *= y / canvas.height;

		let x = Math.sin((y / canvas.height) * 4 + Date.now() / 1000) * roadWidth;
		ctx.drawImage(c, Math.round(canvas.width / 2 - width / 2) + x, y, width, c.height);

		tempRoadTick++;
		if (tempRoadTick >= roadCanvases.length) tempRoadTick = 0;
	}

	roadTick++;
	if (roadTick >= roadCanvases.length * roadTickSlow) roadTick = 0;
}

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	horizonStart = Math.round(canvas.height / 2 / inversePixelRatio);

	roadWidth = Math.floor(Math.min(canvas.width, canvas.height) * 0.75 / inversePixelRatio);
	generateRoads();
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);

	draw();
})