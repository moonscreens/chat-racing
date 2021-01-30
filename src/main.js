import * as THREE from 'three';
import generateCloud from './cloud';
import Chat from 'twitch-chat-emotes';

const initScene = require('./scene');

const config = require('./config');

const inversePixelRatio = 4; // How pixelated things are, 4 = 1 "pixel" takes up 4 real pixels
const roadSegments = 6; // How long the stripes of paint are
const roadPaintWidth = 3; // How wide the stripes of paint are
const flyingRarity = 20; // The higher the number, the less often emotes will fly off the windshield

const cameraDistance = 30;

let roadWidth = null; // set in resize function

let camera, scene, renderer;
const tickArray = [];

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(Math.round(window.innerWidth / inversePixelRatio), Math.round(window.innerHeight / inversePixelRatio));
}

function init() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 200);
	camera.position.x = 0;
	camera.position.y = cameraDistance / 4;
	camera.position.z = cameraDistance;
	//camera.lookAt(0, 0, 0);

	scene = new THREE.Scene();

	const light = new THREE.AmbientLight(0x555555);
	scene.add(light);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(0, 100, 0.25);

	scene.add(directionalLight);

	renderer = new THREE.WebGLRenderer({ antialias: false });
	window.addEventListener('resize', resize);
	resize();
	document.body.appendChild(renderer.domElement);

	initScene(scene, tickArray);

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