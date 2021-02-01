import * as THREE from 'three';
import { SpriteMaterial } from 'three';
import Chat from 'twitch-chat-emotes';
import { groundInit, getPositionModifier } from './ground';

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

const initScene = require('./scene');

const config = require('./config');

const inversePixelRatio = 3; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels
const roadSegments = 6; // How long the stripes of paint are
const roadPaintWidth = 3; // How wide the stripes of paint are
const flyingRarity = 20; // The higher the number, the less often emotes will fly off the windshield

let roadWidth = null; // set in resize function

let camera, scene, renderer;
const tickArray = [];

function resize() {
	camera.aspect = 1920 / 1080;
	camera.updateProjectionMatrix();
	renderer.setSize(Math.round(1920 / inversePixelRatio), Math.round(1080 / inversePixelRatio));
}

function init() {
	camera = new THREE.PerspectiveCamera(70, 1920 / 1080, 1, config.groundLength * 2);
	camera.position.x = 0;
	camera.position.y = config.cameraHeight;
	camera.position.z = 0;
	camera.rotation.x = 0.1;
	//camera.lookAt(0, 0, 0);

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ antialias: false });
	window.addEventListener('resize', resize);
	resize();
	document.body.appendChild(renderer.domElement);

	initScene(scene, tickArray);
	groundInit(scene, tickArray);


	ChatInstance.on("emotes", (e) => {
		const output = [];
		for (let index = 0; index < e.emotes.length; index++) {
			const emote = e.emotes[index];

			if (!emoteTextures[emote.material.id]) {
				emoteTextures[emote.material.id] = new THREE.CanvasTexture(emote.material.canvas);
				emoteTextures[emote.material.id].magFilter = THREE.NearestFilter;
				emoteTextures[emote.material.id].minFilter = THREE.NearestFilter;

				emoteMaterials[emote.material.id] = new THREE.SpriteMaterial({
					map: emoteTextures[emote.material.id],
				});
			}
			emote.texture = emoteTextures[emote.material.id];

			output.push(new THREE.Sprite(emoteMaterials[emote.material.id]));
		}
		pendingEmoteArray.push(output);
	});

	draw();
}

let lastFrame = Date.now();
function draw() {
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;
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
		}
	}

	for (let index = 0; index < pendingEmoteArray.length; index++) {
		const element = pendingEmoteArray[index];
		const group = new THREE.Group();
		for (let i = 0; i < element.length; i++) {
			const sprite = element[i];
			if (element.length > 1) sprite.position.x = (-element.length / 2) + i;
			group.add(sprite);
		}
		group.scale.setScalar(config.emoteSize);
		group.position.y = config.emoteSize / 2;
		group.position.x = getPositionModifier() + (Math.random()-0.5)*2*config.emoteSpawnVariance;
		group.position.z = -config.groundLength / 2;
		scene.add(group);
		emotes.push(group);
	}
	if (pendingEmoteArray.length > 0) pendingEmoteArray.splice(0, pendingEmoteArray.length);

	renderer.render(scene, camera);
}

window.addEventListener('load', init);