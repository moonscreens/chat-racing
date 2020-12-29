import generateCloud from './cloud';
import Chat from 'twitch-chat-emotes';

const pallet = {
	road: '#373A43',
	road2: '#424651',
	roadPaint: '#FFFFFF',
	roadPaint2: '#373A43',
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let horizonStart = null;
let groundHeight = null;
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

	return scale;
}

function getX(y, x) {
	const scale = 0.15 + getScale(y) * 0.85;
	const sin = getSinY(y);
	
	const center = canvas.width / 2 + sin * roadWidth / 10;

	return center + x * scale * roadWidth / 2;
}
function getXSky(y, x) {
	const scale = 1 - getScale(y) * 0.8 + 0.2;
	const sin = getSinY(y);

	const center = canvas.width / 2 + sin * roadWidth / 10;

	return center + x * scale * roadWidth / 2;
}


function getSinY(y) {
	//return 0;
	return Math.sin((y / canvas.height) * 8 + Date.now() / 1000);
}

let lastFrame = Date.now();

const clouds = [];
const cloudLifespan = 15;
setInterval(() => {
	const scale = Math.random() * 2 + 0.5;
	clouds.push({
		t: 0,
		x: Math.random() * 2 - 1,
		y: 0,
		canvas: generateCloud(Math.round(80 * scale), Math.round(40 * scale)),
	})
}, 250);

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
			Math.round(canvas.width/2 + (cloud.x * roadWidth * (sizeMult*0.5+0.5)) - width / 2),
			y - height,
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
		const scale = getScale(y);
		let y = index;
		let width = roadWidth;
		width *= 0.15 + scale * 0.85;

		let x = getSinY(y) * roadWidth / 10;
		ctx.drawRoad(
			tempRoadTick,
			Math.round((canvas.width / 2 - width / 2) + x),
			index,
			Math.round(width),
			1
		)

		let tickScale = 1 - scale;
		tickScale *= tickScale
		tempRoadTick += tickScale;
		while (tempRoadTick >= roadSegments) tempRoadTick = 0;
	}

	roadTick += 0.25;
	while (roadTick >= roadSegments) roadTick = 0;

	/*
		Draw emotes
	*/

	for (let index = pendingEmoteArray.length - 1; index >= 0; index--) {
		const element = pendingEmoteArray[index];
		const p = element.life;

		let y = horizonStart + ((p * p) * groundHeight);

		let size = (getScale(y) * 0.85 + 0.15) * (roadWidth / 10);
		for (let i = 0; i < element.emotes.length; i++) {
			const emote = element.emotes[i];
			ctx.drawImage(
				emote.material.canvas,
				Math.round(
					getX(y, element.position.x)
					+ (size * i) - 
					(element.emotes.length == 1 ? size / 2 : size * element.emotes.length / 2)),
				Math.round(y - size),
				Math.round(size),
				Math.round(size)
			);
		}
		element.life += delta / 1.5;
		if (element.life > 1.5) {
			pendingEmoteArray.splice(index, 1);
		}
	}
}

function resize() {
	canvas.width = Math.round(window.innerWidth / 4);
	canvas.height = Math.round(window.innerHeight / 4);
	horizonStart = Math.round(canvas.height * 0.65);
	groundHeight = canvas.height - horizonStart;

	roadWidth = Math.floor(canvas.width * 0.75);
	ctx.imageSmoothingEnabled = false;
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);

	draw();
})


let channels = ['moonmoon'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new Chat({
	channels,
	duplicateEmoteLimit: 1,
	duplicateEmoteLimit_pleb: 0,
	maximumEmoteLimit_pleb: 1,
})

const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {
	const output = {
		position: { x: (Math.random() - 0.5) * 2 },
		emotes: [],
		life: 0,
	};
	for (let index = 0; index < e.emotes.length; index++) {
		const emote = e.emotes[index];
		output.emotes.push(emote);
	}

	pendingEmoteArray.push(output);
})