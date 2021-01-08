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

const inversePixelRatio = 4; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels
const roadSegments = 6; // How long the stripes of paint are
const roadPaintWidth = 3; // How wide the stripes of paint are
const flyingRarity = 20; // The higher the number, the less often emotes will fly off the windshield

let roadWidth = null; // set in resize function
let horizonStart = null; // set in resize function
let groundHeight = null; // set in resize function

const bloodSplatter = new Image();
bloodSplatter.src = require('./blood-splatter.png');

const shadowImage = new Image();
shadowImage.src = require('./shadow.gif');

const carImage = new Image();
carImage.src = require('./car.png');

const carImageDriftFlipped = document.createElement('canvas');

const carImageDrift = new Image();
carImageDrift.addEventListener('load', () => {
	carImageDriftFlipped.width = carImageDrift.width;
	carImageDriftFlipped.height = carImageDrift.height;
	const ctx = carImageDriftFlipped.getContext('2d');
	ctx.scale(-1, 1);
	ctx.drawImage(carImageDrift, -carImageDrift.width, 0);
})
carImageDrift.src = require('./car-turn-2.png')

const carImageDriftHalfFlipped = document.createElement('canvas');
const carImageDriftHalf = new Image();
carImageDriftHalf.addEventListener('load', () => {
	carImageDriftHalfFlipped.width = carImageDriftHalf.width;
	carImageDriftHalfFlipped.height = carImageDriftHalf.height;
	const ctx = carImageDriftHalfFlipped.getContext('2d');
	ctx.scale(-1, 1);
	ctx.drawImage(carImageDriftHalf, -carImageDriftHalf.width, 0);
})
carImageDriftHalf.src = require('./car-turn-1.png');

const possibleDecorations = [
	{ url: require('./cacti.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
	{ url: require('./randomdots.png'), },
];

class Decoration {
	constructor(url, range = null) {
		this.image = new Image();
		this.image.src = url;
		if (typeof range === "number") {
			this.x = (Math.random() > 0.5 ? 1 : -1) * range
		} else if (typeof range === 'array') {

		} else {
			this.x = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
		}
		this.life = 0;
	}
}

for (let index = 0; index < possibleDecorations.length; index++) {
	const element = possibleDecorations[index];
	element.cache = new Decoration(element.url, element.range);
}

const decorations = [];

setInterval(() => {
	const dec = possibleDecorations[Math.floor(Math.random() * possibleDecorations.length)];
	decorations.push(new Decoration(dec.url, dec.range));
}, 100);


const car = {
	x: 0,
	y: 0,
	last_x: 0,
	last_y: 0,
	collision: 0,
}

function carCollision(x, y) {
	const halfx = carImage.width / 2;
	const halfy = carImage.height / 2;
	return (
		(x < car.last_x + halfx && x > car.last_x - halfx)
		&&
		(y < car.last_y + halfy && y > car.last_y - halfy)
	)
}

ctx.drawRoad = (segment, x, y, w, h) => {
	if (segment < Math.floor(roadSegments / 2)) {
		ctx.fillStyle = pallet.road;
		ctx.fillRect(x, y, w, h);

		ctx.fillStyle = pallet.roadPaint;
		ctx.fillRect(Math.floor(x + w / 3), y, roadPaintWidth, h);
		ctx.fillRect(Math.floor(x + (w / 3) * 2), y, roadPaintWidth, h);


		ctx.fillStyle = pallet.roadPaint2;
	} else {
		ctx.fillStyle = pallet.road2;
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = pallet.roadPaint;
	}
	ctx.fillRect(x, y, roadPaintWidth, h);
	ctx.fillRect(x + w - roadPaintWidth, y, roadPaintWidth, h);
}


ctx.drawEmote = (delta, element, index) => {
	const p = element.life;
	let y = horizonStart + ((p * p) * groundHeight);
	let x = getX(y, element.position.x);

	element.pxpos.x = x;
	element.pxpos.y = y;

	let size = (getScale(y) * 0.85 + 0.15) * (roadWidth / 10);

	ctx.save();
	ctx.translate(x, y);


	if (!element.dying || (element.dying && element.flying)) {
		ctx.globalAlpha = 0.35;
		for (let i = 0; i < element.emotes.length; i++) {
			const x = Math.round(
				(size * i) -
				(size * element.emotes.length / 2));
			ctx.drawImage(shadowImage,
				x,
				-Math.round(size / 8),
				Math.round(size),
				Math.round(size / 4)
			);
		}
		ctx.globalAlpha = 1;
	}

	if (element.dying) {
		let dieP = (Date.now() - element.dying) / 1000;
		let fadeOut = 1;
		if (dieP > 1) {
			dieP = 2 - dieP;
			fadeOut = dieP;
		}
		dieP = EasingFunctions.easeOutCubic(dieP);

		ctx.globalAlpha = 0.5;
		ctx.drawImage(bloodSplatter, -size / 2, -size / 2, size, size)
		ctx.globalAlpha = 1;

		if (element.flying) {
			ctx.globalAlpha = fadeOut;
			ctx.translate(0, -groundHeight * (dieP) * 2);
		} else {
			ctx.rotate(Math.PI / 2);
			ctx.scale(0.5, 0.5);
		}
	}

	for (let i = 0; i < element.emotes.length; i++) {
		const emote = element.emotes[i];
		ctx.drawImage(
			emote.material.canvas,
			Math.round(
				(size * i) -
				(size * element.emotes.length / 2)),
			Math.round(-size),
			Math.round(size),
			Math.round(size)
		);
	}
	element.life += delta / 1.5;
	if (element.life > 2) {
		pendingEmoteArray.splice(index, 1);
	} else if (!element.dying && carCollision(element.pxpos.x, element.pxpos.y - size)) {
		element.dying = Date.now();
		car.collision = Date.now();
		element.flying = Math.floor(Math.random() * flyingRarity) === 0;
	}
	ctx.restore();
	ctx.globalAlpha = 1;
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

function getTransparency(y) {
	const p = ((y - horizonStart) / groundHeight);
	let t = p * 10;
	if (y > canvas.height) {
		t = (2 - p);
	}
	return Math.min(1, t * t);
}

function getX(y, x) {
	const scale = 0.15 + getScale(y) * 0.85;
	const sin = getSinY(y);

	const center = canvas.width / 2 + sin * roadWidth / 10;

	return center + x * scale * roadWidth / 2;
}


const EasingFunctions = {
	// no easing, no acceleration
	linear: t => t,
	// accelerating from zero velocity
	easeInQuad: t => t * t,
	// decelerating to zero velocity
	easeOutQuad: t => t * (2 - t),
	// acceleration until halfway, then deceleration
	easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	// accelerating from zero velocity 
	easeInCubic: t => t * t * t,
	// decelerating to zero velocity 
	easeOutCubic: t => (--t) * t * t + 1,
	// acceleration until halfway, then deceleration 
	easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	// accelerating from zero velocity 
	easeInQuart: t => t * t * t * t,
	// decelerating to zero velocity 
	easeOutQuart: t => 1 - (--t) * t * t * t,
	// acceleration until halfway, then deceleration
	easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
	// accelerating from zero velocity
	easeInQuint: t => t * t * t * t * t,
	// decelerating to zero velocity
	easeOutQuint: t => 1 + (--t) * t * t * t * t,
	// acceleration until halfway, then deceleration 
	easeInOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
}


let sinStart = Date.now();
let sinLength = 20000; // How long each road profile lasts for, 20000 = 20 seconds
let sinDate = 1;
let sinOptions = 5; // The number of types of road profiles
let sinProfile = Math.floor(Math.random() * sinOptions); // The default starting profile
function getSinY(y) {
	//return 0;
	//return Math.sin((y / canvas.height) * 8 + Date.now() / 1000);
	let sinp = sinDate;
	if (sinDate >= sinLength / 2) {
		sinp = sinLength / 2 - (sinDate - sinLength / 2)
	}
	sinp /= sinLength / 2;
	const p = 1 - (y - horizonStart) / groundHeight;

	if (sinProfile === 0) { // straight road
		return 0;
	} else if (sinProfile === 1) { // curvy road (left)
		let sin1 = Math.sin(Math.min(1, p * p) * 3 + Date.now() / 500);
		let sin2 = Math.sin(EasingFunctions.easeInCubic(sinp) * Math.PI / 2);
		return sin1 * sin2;
	} else if (sinProfile === 2) { // curvy road (right)
		let sin1 = Math.sin(Math.min(1, p * p) * 3 + Date.now() / 500);
		let sin2 = Math.sin(EasingFunctions.easeInCubic(sinp) * -Math.PI / 2);
		return sin1 * sin2;
	} else if (sinProfile === 3) { // Turning road (right)
		let sin1 = p * p * EasingFunctions.easeInOutCubic(sinp) * 4;
		return sin1;
	} else if (sinProfile === 4) { // Turning road (left)
		let sin1 = p * p * EasingFunctions.easeInOutCubic(sinp) * -4;
		return sin1;
	}
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
	const delta = Math.min(1, (Date.now() - lastFrame) / 1000);
	lastFrame = Date.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	sinDate = Date.now() - sinStart;
	if (sinDate >= sinLength) {
		sinStart = Date.now();
		sinDate = 0;
		sinProfile = Math.floor(Math.random() * sinOptions);
	}

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
			Math.round(canvas.width / 2 + (cloud.x * roadWidth * (sizeMult * 0.5 + 0.5)) - width / 2),
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

		let x = getX(y, 0);
		let size = roadWidth * (getScale(y) * 0.85 + 0.15);

		ctx.drawRoad(
			tempRoadTick,
			Math.round(x - size / 2),
			index,
			Math.round(size),
			1
		)

		let tickScale = 1 - scale;
		tempRoadTick += tickScale * tickScale;
		while (tempRoadTick >= roadSegments) tempRoadTick = 0;
	}

	roadTick += 0.25;
	while (roadTick >= roadSegments) roadTick = 0;

	/*
		Draw distant emotes
	*/

	let foregroundEmoteIndex = pendingEmoteArray.length - 1;
	for (let index = pendingEmoteArray.length - 1; index >= 0; index--) {
		const element = pendingEmoteArray[index];
		if (element.pxpos.y < car.last_y + carImage.height) {
			ctx.drawEmote(delta, element, index);
		} else {
			foregroundEmoteIndex = index;
			break;
		}
		foregroundEmoteIndex = -1;
	}

	/*
		Draw decorations
	*/

	for (let index = decorations.length - 1; index >= 0; index--) {
		const decoration = decorations[index];
		decoration.life += delta / 2;
		const p = decoration.life * decoration.life;
		const y = horizonStart + groundHeight * p;
		const x = getX(y, decoration.x);
		const scale = getScale(y) * 0.85 + 0.15;
		const width = scale * decoration.image.width * 1.5;
		const height = scale * decoration.image.height * 1.5;
		ctx.globalAlpha = getTransparency(y);
		ctx.drawImage(decoration.image, Math.round(x - width / 2), Math.round(y - height), Math.round(width), Math.round(height));
		if (decoration.life > 1.5) {
			decorations.splice(index, 1);
		}
	}
	ctx.globalAlpha = 1;

	/*
		Draw car
	*/
	const carY = canvas.height - (carImage.height + 5);
	const carX = getX(carY, car.x);
	let image = carImage;
	const roadDirection = (getX(carY, 0) - getX(carY - carImage.height, 0)) / 180;
	console.log(carY, carY - carImage.height, roadDirection)
	if (roadDirection < -0.25) {
		image = carImageDriftHalfFlipped;
	} else if (roadDirection > 0.25) {
		image = carImageDriftHalf;
	}
	if (roadDirection < -0.5) {
		image = carImageDriftFlipped;
	} else if (roadDirection > 0.5) {
		image = carImageDrift;
	}
	car.x += (delta * roadDirection) * 2;
	//car.x = Math.max(-1, Math.min(1, car.x));

	if (car.x > 0) car.x -= delta * (car.x * car.x);
	if (car.x < 0) car.x += delta * (car.x * car.x);

	const passiveBounce = Math.sin(Date.now() / 50) * 0.6;
	const collisionProgress = Date.now() - car.collision;
	const collisionBounce = collisionProgress < 250 ? Math.sin(Date.now() / 20) * 2 : 0;

	ctx.drawImage(
		image,
		Math.round(carX - carImage.width / 2),
		Math.round(carY + passiveBounce - collisionBounce)
	);
	car.last_x = carX;
	car.last_y = carY;

	/*
		Draw close emotes
	*/
	for (let index = foregroundEmoteIndex; index >= 0; index--) {
		const element = pendingEmoteArray[index];
		ctx.drawEmote(delta, element, index);
	}
}

function resize() {
	canvas.width = Math.round(Math.min(1920, window.innerWidth) / inversePixelRatio);
	canvas.height = Math.round(Math.min(1080, window.innerHeight) / inversePixelRatio);
	horizonStart = Math.round(canvas.height * 0.75);
	groundHeight = canvas.height - horizonStart;

	roadWidth = Math.floor(canvas.width * 1);
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
	duplicateEmoteLimit: 0,
	duplicateEmoteLimit_pleb: 0,
	maximumEmoteLimit: 2,
	maximumEmoteLimit_pleb: 1,
})

const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {
	const output = {
		position: { x: (Math.random() - 0.5) * 2 },
		pxpos: { x: 0, y: 0 },
		emotes: [],
		life: 0,
	};
	for (let index = 0; index < e.emotes.length; index++) {
		const emote = e.emotes[index];
		output.emotes.push(emote);
	}

	pendingEmoteArray.push(output);
})