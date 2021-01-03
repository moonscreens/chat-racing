import generateCloud from './cloud';
import Chat from 'twitch-chat-emotes';
import * as PIXI from 'pixi.js';

const pallet = {
	road: 0x373A43,
	road2: 0x424651,
	roadPaint: 0xFFFFFF,
	roadPaint2: 0x373A43,
	sky: 0x5ADBFF,
	ground: 0xF6F5AE,
}

const width = 1920 / 4;
const height = 1080 / 4;
const app = new PIXI.Application({
	width, height, backgroundColor: pallet.sky, resolution: 1,
});
const stage = new PIXI.Container();
app.stage.addChild(stage);

const getScale = (x) => {
	let scale = x * 0.85 + 0.15;
	return scale * scale;
}
const getY = (x) => {
	let y = x * x;
	return y * (height / 2);
}


const bloodSplatter = new Image();
bloodSplatter.src = require('./blood-splatter.png');

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

let terrainModifier = [];
for (let index = 0; index < height; index++) {
	terrainModifier.push([0, 0]);
}
let roadTick = 0;
function draw(delta) {

	for (let index = terrainModifier.length-1; index > 0; index--) {
		terrainModifier[index][0] = terrainModifier[index-1][0];
		terrainModifier[index][1] = terrainModifier[index-1][1];
	}
	terrainModifier[0][0] = Math.sin(Date.now() / 100) * width/40;
	terrainModifier[0][1] = Math.cos(Date.now() / 230) * width/40;
	
	for (let index = 0; index < ground.children.length; index++) {
		const element = ground.children[index];
		element.p += 3 / ground.children.length;
		if (element.p > 1) element.p -= 1;
		const p = element.p;
		element.scale.x = getScale(p);
		element.position.y = getY(p);

		element.zIndex = Math.round(p * height);

		try {
			element.position.y -= terrainModifier[Math.floor(p * height/2)][1] * element.scale.x;
			element.position.x = terrainModifier[Math.floor(p * height/2)][0] * element.scale.x;
		} catch (e) {
			console.log(element.p, height)
		}
	}

	roadTick++;
}

const ground = new PIXI.Container();
ground.sortableChildren = true;
stage.addChild(ground);

const roadPaintWidth = 0.025;
const roadSegments = 3 * 2; // should always be an even number
const roadDrawHeight = 64;
const roadLanes = 3;
const road = new PIXI.Container();
road.zIndex = 10;
ground.addChild(road);

function resize() {
	//app.resize(window.innerWidth, window.innerHeight);
	stage.x = Math.round(width / 2);
	stage.y = Math.round(height / 2);

	for (let index = 0; index < height; index++) {
		const slice = new PIXI.Container();
		ground.addChild(slice);
		slice.p = index / (height);
		slice.position.y = index;

		const groundGraphic = new PIXI.Graphics();
		groundGraphic.beginFill(pallet.ground);
		groundGraphic.drawRect(Math.round(-stage.x * 100), 0, width * 100, roadDrawHeight);
		groundGraphic.endFill();
		slice.addChild(groundGraphic);


		const roadSegment = new PIXI.Graphics();
		const type = Math.floor((index / height) * roadSegments) % 2;
		roadSegment.beginFill(pallet.road2);
		if (type === 0) {
			roadSegment.beginFill(pallet.road);
		}
		roadSegment.drawRect(Math.round(-stage.x), 0, width, roadDrawHeight);
		roadSegment.endFill();

		if (type === 0) {
			const pWidth = width * roadPaintWidth;
			for (let i = 0; i < (roadLanes - 1); i++) {
				roadSegment.beginFill(pallet.roadPaint);
				roadSegment.drawRect(Math.round(-stage.x) + (width/roadLanes)*(1 + i) - pWidth, 0, pWidth, roadDrawHeight);
				roadSegment.endFill();
			}
		}

		slice.addChild(roadSegment);
	}

}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(app.view);
	resize();

	// Listen for animate update
	app.ticker.add(draw);
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
	//pendingEmoteArray.push(output);
})