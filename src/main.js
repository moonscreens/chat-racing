import * as THREE from 'three';
import generateCloud from './cloud';
import Chat from 'twitch-chat-emotes';
import {groundInit} from './ground';


const initScene = require('./scene');

const config = require('./config');

const inversePixelRatio = 4; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels
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
	renderer.render(scene, camera);
}

window.addEventListener('load', init);