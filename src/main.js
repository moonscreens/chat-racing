import * as THREE from 'three';
import Chat from 'twitch-chat-emotes';
import { groundInit, getPositionModifier, getHeightModifier } from './ground';
import { Car } from './car';
const config = require('./config');

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

const inversePixelRatio = 3; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels

let camera, scene, renderer;
const tickArray = [];

tickArray.push(Car.tick);

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

	scene.add(Car);
	Car.position.z = -config.cameraHeight * 4.5;
	Car.position.y = 0;

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

const cactus_image = new Image();
cactus_image.addEventListener('load', () => {
	cactus_texture.needsUpdate = true;
	cactus_material.needsUpdate = true;
})
cactus_image.src = require('./cacti.png');
const cactus_texture = new THREE.Texture(cactus_image, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
const cactus_material = new THREE.SpriteMaterial({
	map: cactus_texture,
});
setInterval(() => {
	const group = createGroup();
	const cactus = new THREE.Sprite(cactus_material);
	group.add(cactus);
	const x = Math.random() > 0.5 ? 1 : -1;
	group.scale.setScalar(10);
	group.position.y += 5;
	group.position.x += (25 * x) + (Math.random() * config.emoteSpawnVariance * 10 * x);
	scene.add(group);
}, 100);

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

	renderer.render(scene, camera);
}

window.addEventListener('load', init);