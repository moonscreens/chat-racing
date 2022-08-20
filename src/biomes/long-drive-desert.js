import config from '../config.js';
import streetSignDecoration from './streetsigns.js';

const biome = {
	sky: '#97CFE5',
	ground: '#D1A76C',
	ground2: '#BF975F',
	clouds: {
		light: '#F8F8F8',
		dark: '#BCE0DB',
		frequency: 0.1,
	},
	decorations: [
		{
			imageUrl: [
				'/sprites/longdrive/car1.png',
				'/sprites/longdrive/car2.png',
				'/sprites/longdrive/car3.png',
				'/sprites/longdrive/car4.png',
				'/sprites/longdrive/tower.png',
				'/sprites/longdrive/rock1.png',
				'/sprites/longdrive/rock1.png',
				'/sprites/longdrive/rock1.png',
				'/sprites/longdrive/rock2.png',
				'/sprites/longdrive/rock2.png',
				'/sprites/longdrive/rock2.png',
				'/sprites/longdrive/rockformation.png',
			],
			interval: 2500,
			intervalVariance: 1.5,
			flipRandom: true,
			spawnDistanceMultiplier: 3,
		},
		{
			imageUrl: [
				'/sprites/longdrive/cactus.png',
				'/sprites/longdrive/brush.png',
				'/sprites/longdrive/stone.png',
			],
			interval: 500,
			spawnDistanceMultiplier: 3,
		},
		{
			imageUrl: ['/sprites/longdrive/phoneline.png'],
			interval: 2000,
			spawnDistanceMultiplier: 0,
			offset: -38,
			side: 'right',
		},
		{
			imageUrl: [
				'/sprites/longdrive/brush.png',
				'/sprites/longdrive/stone.png',
			],
			interval: 2000,
			intervalVariance: 1,
			offset: -80,
			spawnDistanceMultiplier: 0.5,
		},
		{ ...streetSignDecoration },
	],
};

biome.drawGround = (canvas, ctx, x, w, index) => {
	// draw the ground
	ctx.fillStyle = biome.ground;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw the stripes
	ctx.fillStyle = biome.ground2;
	for (let i = 0; i < canvas.width; i += 20) {
		ctx.fillRect(i + Math.round(Math.sin(index / 5) * 2), 0, 5, canvas.height);
	}

	/*ctx.fillStyle = biome.ground2;
	for (let index = 0; index < canvas.width; index += 4) {
		if (Math.random() > 0.95) ctx.fillRect(index, 0, 1, canvas.height);
	}*/
}
biome.customRoad = (canvas, ctx, x, w, index) => {
	ctx.fillStyle = '#5B534B';
	if (Math.round(index / 5) % 2 > 0) {
		ctx.fillStyle = '#4F4840';
	}
	ctx.fillRect(x + w / 3, 0, w / 3, canvas.height); // assfault


	if (Math.round(index / 5) % 2 > 0) {
		ctx.fillStyle = '#d1bf6f';
		ctx.fillRect(x + Math.round(w / 2), 0, 1, canvas.height);
	}
}

export default biome;