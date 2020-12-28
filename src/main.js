import generateCloud from './cloud';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let horizonStart = null;
const roadSegments = 20;
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

function getScale(y) {
	let scale = 0;
	if (y > horizonStart) {
		scale = (y - horizonStart) / (canvas.height - horizonStart);
	} else if (y < horizonStart) {
		scale = 1 - y / horizonStart;
	}

	return Math.min(1, Math.max(0, scale));
}


function getSinY(y) {
	return Math.sin((y / canvas.height) * 8 + Date.now() / 1000);
}

let lastFrame = Date.now();

const clouds = [];
const cloudLifespan = 15;
setInterval(() => {
	clouds.push({
		t: 0,
		x: Math.round(canvas.width * Math.random()),
		y: 0,
		canvas: generateCloud(80, 40),
	})
}, 500);

const roadTickSlow = 3;
let roadTick = 0;
function draw() {
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;
	lastFrame = Date.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	/*
		Draw sky
	*/
	ctx.fillStyle = '#87CEEB';
	ctx.fillRect(0, 0, canvas.width, horizonStart);

	/*
		Draw clouds
	*/
	for (let index = clouds.length - 1; index >= 0; index--) {
		const cloud = clouds[index];
		ctx.imageSmoothingEnabled = false;
		const p = (cloud.t / cloudLifespan);


		let y = horizonStart * (1 - p*p);

		const sizeMult = getScale(y);
		const width = Math.round(cloud.canvas.width * sizeMult);
		const height = Math.round(cloud.canvas.height * sizeMult);

		let offset = canvas.width / 4;
		if (cloud.x < canvas.width / 2) {
			offset *= -1;
		}
		offset *= p;

		ctx.drawImage(
			cloud.canvas,
			Math.round(cloud.x - width / 2),
			y,
			width,
			height,
		);
		cloud.t += delta;
		if (cloud.t >= cloudLifespan * 1.5) {
			clouds.splice(index, 1);
		}
	}

	/*
		Draw ground
	*/
	ctx.fillStyle = '#FFE877';
	ctx.fillRect(0, horizonStart, canvas.width, canvas.height);


	/*
		Draw road
	*/
	let tempRoadTick = Math.floor(roadTick / roadTickSlow);
	for (let index = Math.ceil(canvas.height); index >= horizonStart; index--) {

		let y = index;
		let width = roadWidth;
		width *= getScale(y);

		let x = getSinY(y) * 10;
		ctx.drawRoad(
			tempRoadTick,
			Math.round((canvas.width / 2 - width / 2) + x),
			index,
			Math.round(width),
			1
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
	horizonStart = Math.round(canvas.height * 0.65);

	console.log(getScale(0), getScale(horizonStart - 1), getScale(horizonStart), getScale(horizonStart + 1), getScale(canvas.height))

	roadWidth = Math.floor(Math.min(canvas.width, canvas.height) * 0.75);
	ctx.imageSmoothingEnabled = false;
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);

	draw();
})