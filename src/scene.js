import * as THREE from 'three';
import generateCloud from './cloud';

const config = require('./config');

const clouds = [];

module.exports = function (scene, tickArray) {

	setInterval(() => {
		const cloudCanvas = generateCloud(300, 100);
		const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
		cloudTexture.magFilter = THREE.NearestFilter;
		cloudTexture.minFilter = THREE.NearestFilter;
		const material = new THREE.SpriteMaterial({
			map: cloudTexture,
		});
		const cloud = new THREE.Sprite(material);
		clouds.push(cloud);
		scene.add(cloud);
		cloud.position.z = -config.groundLength / 2;
		cloud.position.y = 100 + Math.random() * 50;
		cloud.position.x = (Math.random() - 0.5) * 2 * config.groundWidth;
		cloud.scale.setScalar(100);
		cloud.scale.x *= 1 + 1.25 * Math.random();
	}, 100);

	tickArray.push((delta) => {
		for (let index = clouds.length-1; index >= 0; index--) {
			const cloud = clouds[index];
			cloud.position.z += delta * config.speedMultiplier;
			if (cloud.position.z > 0) {
				scene.remove(cloud);
				clouds.splice(index, 1);
			}
		}
	});

	//const geometry = new THREE.PlaneBufferGeometry(100, 100, 2);

	/*const geometry = new THREE.BoxBufferGeometry(100, 100, 100);
	const material = new THREE.MeshBasicMaterial({ color: config.pallet.road, side: THREE.FrontSide });
	material.wireframe = true;
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	mesh.position.y = 5;
	mesh.position.z = - 100;
	tickArray.push((delta) => {
		mesh.rotation.y += delta;
		mesh.rotation.x += delta;
	});*/

	scene.background = new THREE.Color(config.pallet.sky_blue);
	scene.fog = new THREE.Fog(scene.background, config.groundLength * 0.35, config.groundLength *0.5);


	/*const ground_geometry = new THREE.PlaneBufferGeometry(config.groundWidth, config.groundLength, 1);
	const ground_material = new THREE.MeshBasicMaterial({ color: config.pallet.desert.ground, side: THREE.FrontSide });
	const ground_mesh = new THREE.Mesh(ground_geometry, ground_material);
	ground_mesh.rotation.x = -Math.PI / 2;
	ground_mesh.position.y = -0.01;
	scene.add(ground_mesh);*/
}