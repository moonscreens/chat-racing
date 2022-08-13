import './main.css'
import * as THREE from 'three';
import Stats from 'stats-js';
import TwitchChat from "twitch-chat-emotes-threejs";

import { groundInit, getPositionModifier, getHeightModifier } from './ground';
import { Car } from './car';
import config from './config';
import biomes from './biomes';

let channels = ['moonmoon'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}
window.biome = query_vars.biome;
console.log(query_vars)

const ChatInstance = new TwitchChat({
	THREE,

	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.SpriteMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	channels,
	maximumEmoteLimit: 2,
	duplicateEmoteLimit: 0,
})

const pendingEmoteArray = [];
const emotes = [];

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

let stats = null;

function init() {
	if (window.location.hostname === 'localhost') {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

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


	ChatInstance.listen((emotes) => {
		const output = [];
		for (let index = 0; index < emotes.length; index++) {
			const emote = emotes[index];
			output.push(new THREE.Sprite(emote.material));
		}
		pendingEmoteArray.push(output);
	});

	window.dispatchEvent(new CustomEvent('biome-change', { detail: window.biome }));
	draw();
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
let fastFrames = 0;
function draw() {
	if (stats) stats.begin();

	let delta = (Date.now() - lastFrame) / 1000;
	lastFrame = Date.now();

	if (fastFrames < 600) {
		delta = 16 / 1000;
		setTimeout(draw, 0);
		fastFrames++;
	} else requestAnimationFrame(draw);

	for (let index = 0; index < tickArray.length; index++) {
		tickArray[index](delta);
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
			deco.lastSpawn = Date.now() + ((Math.random() * deco.intervalVariance * 2) - deco.intervalVariance);
			const group = createGroup();
			let mat = deco.materials[Math.floor(Math.random() * deco.materials.length)];
			if (deco.sequential) {
				mat = deco.materials[deco.index];
				deco.index++;
				if (deco.index >= deco.materials.length) deco.index = 0;
			}

			let x = Math.random() > 0.5 ? 1 : -1;
			if (deco.side === 'left') x = -1;
			if (deco.side === 'right') x = 1;

			if (deco.flip && x === -1 && mat.flipped) mat = mat.flipped;
			const sprite = new THREE.Sprite(mat);
			sprite.center.y = 0;
			group.add(sprite);

			group.scale.setScalar(deco.size);
			group.position.x += (25 + deco.size / 2) * x + (Math.random() * config.emoteSpawnVariance * 10 * x) * deco.spawnDistanceMultiplier + (deco.offset * x);
			scene.add(group);
		}
	}

	renderer.render(scene, camera);
	if (stats) stats.end();
}

if (window.biome === undefined) {
	window.biome = Object.keys(biomes)[Math.floor(Math.random() * Object.keys(biomes).length)];
}
window.addEventListener('load', init);
