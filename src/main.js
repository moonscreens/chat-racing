import './main.css'
import * as THREE from 'three';
import Chat from 'twitch-chat-emotes';
import { groundInit, getPositionModifier, getHeightModifier } from './ground';
import { Car } from './car';
import config from './config';

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
})

const emoteTextures = {};
const emoteMaterials = {};
const pendingEmoteArray = [];
const emotes = [];
window.biome = undefined;

import initScene from './scene';

const inversePixelRatio = 1; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels

let camera, scene, renderer;
const tickArray = [];

tickArray.push(Car.tick);

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(Math.round(window.innerWidth / inversePixelRatio), Math.round(window.innerHeight / inversePixelRatio));
}

function init() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, config.groundLength * 2);
	camera.position.x = 0;
	camera.position.y = config.cameraHeight;
	camera.position.z = 0;
	camera.rotation.x = 0.1;
	//camera.lookAt(0, 0, 0);

	scene = new THREE.Scene();

	scene.add(Car);
	Car.position.z = -config.cameraHeight * 4.5;
	Car.position.y = 0;

	renderer = new THREE.WebGLRenderer({ antialias: false });
	window.addEventListener('resize', resize);
	resize();
	document.body.appendChild(renderer.domElement);

	initScene(scene, tickArray);
	groundInit(scene, tickArray);


	ChatInstance.on("emotes", (emotes) => {
		const output = [];
		for (let index = 0; index < emotes.length; index++) {
			const emote = emotes[index];

			if (!emoteTextures[emote.gif.id]) {
				emoteTextures[emote.gif.id] = new THREE.CanvasTexture(emote.gif.canvas);
				emoteTextures[emote.gif.id].magFilter = THREE.NearestFilter;
				emoteTextures[emote.gif.id].minFilter = THREE.NearestFilter;

				emoteMaterials[emote.gif.id] = new THREE.SpriteMaterial({
					map: emoteTextures[emote.gif.id],
				});
			}
			emote.texture = emoteTextures[emote.gif.id];

			output.push(new THREE.Sprite(emoteMaterials[emote.gif.id]));
		}
		pendingEmoteArray.push(output);
	});

	draw();
}

import streetsignurl from './streetsign.png';
const streetSignDecoration = {
	imageUrl: streetsignurl,
	interval: 20000,
	intervalVariance: 0,
	spawnDistanceMultiplier: 0,
	size: 10,
}

import cactiUrl from './cacti.png';
const biomes = {
	desert: {
		decorations: [
			{
				imageUrl: cactiUrl,
				interval: 200,
				intervalVariance: 0,
				spawnDistanceMultiplier: 2,
				size: 10,
			},
			{ ...streetSignDecoration },
		],
	},
	grass: {
		decorations: [
			{ ...streetSignDecoration },
		],
	},
	beach: {
		decorations: [
			{ ...streetSignDecoration },
		],
	},
}

setInterval(() => {
	///change to random biome
	const keys = Object.keys(biomes);
	let lastBiome = window.biome;
	while (window.biome === lastBiome) {
		window.biome = keys[Math.floor(Math.random() * keys.length)];
	}
	console.log("switching to", window.biome);
}, config.roadPresetDuration * 3);

for (const key in biomes) {
	if (Object.hasOwnProperty.call(biomes, key)) {
		const biome = biomes[key];
		for (let index = 0; index < biome.decorations.length; index++) {
			const deco = biome.decorations[index];
			deco.image = new Image();
			deco.lastSpawn = Date.now() + Math.random() * deco.intervalVariance;
			deco.texture = new THREE.Texture(deco.image, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
			deco.material = new THREE.SpriteMaterial({
				map: deco.texture,
			});
			deco.image.addEventListener('load', () => {
				deco.material.needsUpdate = true;
				deco.texture.needsUpdate = true;
			});
			deco.image.src = deco.imageUrl;
		}
	}
}

function createGroup(thing) {
	const group = new THREE.Group();

	group.position.y = getHeightModifier();
	group.position.x = getPositionModifier();
	group.position.z = -config.groundLength / 2;

	scene.add(group);
	emotes.push(group);
	return group;
}

let lastFrame = Date.now();
function draw() {
	requestAnimationFrame(draw);
	const delta = Math.min((Date.now() - lastFrame) / 1000, 1);
	lastFrame = Date.now();

	for (let index = 0; index < tickArray.length; index++) {
		tickArray[index](delta);
	}

	for (const key in emoteMaterials) {
		if (Object.hasOwnProperty.call(emoteMaterials, key)) {
			emoteMaterials[key].needsUpdate = true;
			emoteTextures[key].needsUpdate = true;
		}
	}

	for (let index = emotes.length - 1; index >= 0; index--) {
		const element = emotes[index];
		element.position.z += delta * config.speedMultiplier;
		if (element.position.z > 0) {
			scene.remove(element);
			emotes.splice(index, 1);
		} else if (
			element.dying === undefined &&
			element.dead === undefined &&
			element.position.z > Car.position.z - Car.scale.y * 4 &&
			element.position.z < Car.position.z &&
			element.position.x < Car.position.x + Car.scale.x * 4 &&
			element.position.x > Car.position.x - Car.scale.x * 4
		) {
			Car.bump();
			if (Math.random() > 0.9) {
				element.dying = Date.now();
				element.startY = element.position.y;
			} else {
				element.dead = true;
				element.rotation.z = Math.PI / 2;
				element.position.y -= config.emoteSize / 3;
				for (let i = 0; i < element.children.length; i++) {
					element.children[i].material = element.children[i].material.clone();
					element.children[i].material.rotation = Math.PI / 2;
				}
			}
		} else if (element.dying) {
			element.position.y = element.startY + (
				(Math.sin(((Date.now() - element.dying) / config.emoteDeathLength) * Math.PI) / 2) *
				config.emoteDeathArc * config.emoteSize
			);
		}
	}

	for (let index = 0; index < pendingEmoteArray.length; index++) {
		const element = pendingEmoteArray[index];
		const group = createGroup();
		for (let i = 0; i < element.length; i++) {
			const sprite = element[i];
			if (element.length > 1) sprite.position.x = (-element.length / 2) + i;
			group.add(sprite);
		}
		group.scale.setScalar(config.emoteSize);
		group.position.y += config.emoteSize / 2;
		group.position.x += (Math.random() - 0.5) * 2 * config.emoteSpawnVariance;
	}
	if (pendingEmoteArray.length > 0) pendingEmoteArray.splice(0, pendingEmoteArray.length);

	for (let index = 0; index < biomes[window.biome].decorations.length; index++) {
		const deco = biomes[window.biome].decorations[index];

		if (Date.now() - deco.lastSpawn > deco.interval) {
			deco.lastSpawn = Date.now();
			const group = createGroup();
			const sprite = new THREE.Sprite(deco.material);
			group.add(sprite);
			const x = Math.random() > 0.5 ? 1 : -1;
			group.scale.setScalar(deco.size);
			group.position.y += deco.size / 2;
			group.position.x += (25 + deco.size / 2) * x + (Math.random() * config.emoteSpawnVariance * 10 * x) * deco.spawnDistanceMultiplier;
			scene.add(group);
		}
	}

	renderer.render(scene, camera);
}

if (window.biome === undefined) window.biome = Object.keys(biomes)[Math.floor(Math.random() * Object.keys(biomes).length)];

window.addEventListener('load', init);