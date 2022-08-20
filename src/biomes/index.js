import * as THREE from 'three';
import config from '../config';

import desertBiome from './desert.js';
import forestBiome from './forest.js';
import cityBiome from './city.js';
import beachBiome from './beach.js';
import farmBiome from './farm.js';
import longDriveDesert from './long-drive-desert.js';
import { NearestFilter } from 'three';

const biomes = {
	desertBiome,
	forestBiome,
	cityBiome,
	beachBiome,
	farmBiome,
	longDriveDesert
}

setInterval(() => {
	///change to random biome
	if (window.biomeLock) return;
	const keys = Object.keys(biomes);
	let lastBiome = window.biome;
	while (window.biome === lastBiome) {
		window.biome = keys[Math.floor(Math.random() * keys.length)];
	}
	console.log("switching to", window.biome);
	window.dispatchEvent(new CustomEvent('biome-change', { detail: window.biome }));
}, config.roadPresetDuration * 3);

for (const key in biomes) {
	if (Object.hasOwnProperty.call(biomes, key)) {
		const biome = biomes[key];
		if (biome.canBeBumpy === undefined) {
			biome.canBeBumpy = true;
		}
		biome.clouds.lightColor = new THREE.Color(biome.clouds.light);
		biome.clouds.darkColor = new THREE.Color(biome.clouds.dark);
		for (let o = 0; o < biome.decorations.length; o++) {
			const deco = biome.decorations[o];
			deco.index = 0;
			deco.size = 0;
			if (deco.spawnDistanceMultiplier === undefined) deco.spawnDistanceMultiplier = 1;
			if (deco.intervalVariance === undefined) deco.intervalVariance = 1;
			if (deco.offset === undefined) deco.offset = 0;
			deco.images = [];
			deco.canvases = [];
			deco.materials = [];
			deco.textures = [];
			if (deco.lastSpawn === undefined) deco.lastSpawn = Date.now() + Math.random() * deco.intervalVariance;
			for (let index = 0; index < deco.imageUrl.length; index++) {
				const imageUrl = deco.imageUrl[index];

				if (typeof imageUrl === 'string') deco.images[index] = new Image();
				else deco.images[index] = imageUrl;

				deco.canvases[index] = document.createElement('canvas');
				deco.textures[index] = new THREE.CanvasTexture(deco.canvases[index]);
				deco.textures[index].magFilter = deco.magFilter || NearestFilter;
				deco.textures[index].minFilter = deco.minFilter || NearestFilter;
				deco.materials[index] = new THREE.SpriteMaterial({
					map: deco.textures[index],
				});

				deco.materials[index].flipped = null;

				const postProcess = () => {
					//fix threejs squishing images into squares
					deco.canvases[index].width = Math.max(deco.images[index].width, deco.images[index].height);
					deco.canvases[index].height = deco.canvases[index].width;
					deco.size = deco.canvases[index].width / 4;
					const ctx = deco.canvases[index].getContext('2d');
					ctx.drawImage(deco.images[index], Math.round(deco.canvases[index].width / 2 - deco.images[index].width / 2), deco.canvases[index].height - deco.images[index].height);

					//update texture/material
					deco.materials[index].needsUpdate = true;
					deco.textures[index].needsUpdate = true;

					// clone and flip the material/texture
					const flippedCanvas = document.createElement('canvas');
					flippedCanvas.width = deco.canvases[index].width;
					flippedCanvas.height = deco.canvases[index].height;
					const flippedCtx = flippedCanvas.getContext('2d');
					flippedCtx.scale(-1, 1);
					flippedCtx.drawImage(deco.canvases[index], -flippedCanvas.width, 0);
					deco.materials[index].flipped = new THREE.SpriteMaterial({
						map: new THREE.CanvasTexture(flippedCanvas, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter),
					});
				}

				if (typeof imageUrl === 'string') {
					deco.images[index].addEventListener('load', () => {
						postProcess();

						//update texture/material
						deco.materials[index].needsUpdate = true;
						deco.textures[index].needsUpdate = true;
					});
					deco.images[index].src = imageUrl;
				} else {
					postProcess();
				}
			}
		}
	}
}

export default biomes;