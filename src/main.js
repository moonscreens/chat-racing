import generateCloud from './cloud';

const pallet = {
	road: '#373A43',
	road2: '#424651',
	roadPaint: '#FFFFFF',
	roadPaint2: '#373A43',
}
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let horizonStart = null;
const roadSegments = 6;
const roadPaintWidth = 2;
let roadWidth = null;

ctx.drawRoad = (segment, x, y, w, h) => {
	if (segment < Math.floor(roadSegments / 2)) {
		ctx.fillStyle = pallet.road;
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = pallet.roadPaint;
		ctx.fillRect(Math.floor(x + w / 2), y, roadPaintWidth, h);
		ctx.fillStyle = pallet.roadPaint2;
	} else {
		ctx.fillStyle = pallet.road2;
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = pallet.roadPaint;
	}
	ctx.fillRect(x, y, roadPaintWidth, h);
	ctx.fillRect(x + w - roadPaintWidth, y, roadPaintWidth, h);
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
	ctx.fillStyle = '#5ADBFF';
	ctx.fillRect(0, 0, canvas.width, horizonStart);

	/*
		Draw clouds
	*/
	for (let index = clouds.length - 1; index >= 0; index--) {
		const cloud = clouds[index];
		ctx.imageSmoothingEnabled = false;
		const p = (cloud.t / cloudLifespan);


		let y = horizonStart * (1 - p * p);

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
	ctx.fillStyle = '#F6F5AE';
	ctx.fillRect(0, horizonStart, canvas.width, canvas.height);


	/*
		Draw road
	*/
	let tempRoadTick = roadTick;
	for (let index = Math.ceil(canvas.height); index >= horizonStart; index--) {

		let y = index;
		let width = roadWidth;
		width *= 0.15 + getScale(y) * 0.85;

		let x = getSinY(y) * 10;
		ctx.drawRoad(
			tempRoadTick,
			Math.round((canvas.width / 2 - width / 2) + x),
			index,
			Math.round(width),
			1
		)

		let tickScale = 1 - getScale(y);
		tickScale *= tickScale
		tempRoadTick += tickScale;
		while (tempRoadTick >= roadSegments) tempRoadTick = 0;
	}

	roadTick += 0.25;
	while (roadTick >= roadSegments) roadTick = 0;
}

function resize() {
	canvas.width = Math.round(window.innerWidth / 6);
	canvas.height = Math.round(window.innerHeight / 6);
	horizonStart = Math.round(canvas.height * 0.65);

	console.log(getScale(0), getScale(horizonStart - 1), getScale(horizonStart), getScale(horizonStart + 1), getScale(canvas.height))

	roadWidth = Math.floor(canvas.width * 0.75);
	ctx.imageSmoothingEnabled = false;
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);

	draw();
})