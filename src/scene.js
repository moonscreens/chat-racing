import * as THREE from 'three';
const config = require('./config');

module.exports = function (scene, tickArray) {
	//const geometry = new THREE.PlaneBufferGeometry(100, 100, 2);
	const geometry = new THREE.BoxGeometry(5, 5, 5);
	const material = new THREE.MeshBasicMaterial({ color: config.pallet.road, side: THREE.FrontSide });
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	mesh.position.y = 5;
	tickArray.push((delta) => {
		mesh.rotation.y += delta;
		mesh.rotation.x += delta;
	});

	scene.background = new THREE.Color(config.pallet.sky_blue);

	const ground_geometry = new THREE.PlaneGeometry(225, 100, 1);
	const ground_material = new THREE.MeshBasicMaterial({ color: config.pallet.ground_desert, side: THREE.FrontSide });
	const ground_mesh = new THREE.Mesh(ground_geometry, ground_material);
	ground_mesh.rotation.x = -Math.PI / 2;
	scene.add(ground_mesh);
}