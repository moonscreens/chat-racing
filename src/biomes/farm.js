import streetSignDecoration from './streetsigns.js';

const biome = {
	sky: '#8BC7C8',
	ground: '#699148',
	ground2: '#7EA75B',
	farmland: '#5C4033',
	farmland2: '#6F4E37',
	clouds: {
		light: '#DEF7E9',
		dark: '#A9CEE5',
	},
	canBeBumpy: false,
	decorations: [
		{
			imageUrl: ['/sprites/farm/fence.png'],
			interval: 75,
			spawnDistanceMultiplier: 0,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/fenceRight.png'],
			interval: 75,
			spawnDistanceMultiplier: 0,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/farm/farmrow1.png'],
			interval: 250,
			spawnDistanceMultiplier: 0,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/farm_windmill.png'],
			interval: 12500,
			intervalVariance: 500,
			spawnDistanceMultiplier: 3,
			offset: 0,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/biplane.png'],
			interval: 15000,
			intervalVariance: 500,
			spawnDistanceMultiplier: 3.33,
			offset: -60,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/barn.png'],
			interval: 11000,
			intervalVariance: 500,
			spawnDistanceMultiplier: 2.5,
			offset: 50,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/house.png'],
			interval: 11000,
			intervalVariance: 500,
			spawnDistanceMultiplier: 2,
			offset: 25,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/farm/silos.png'],
			interval: 12000,
			intervalVariance: 500,
			spawnDistanceMultiplier: 0.5,
			offset: 10,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/silos.png'],
			interval: 10050,
			intervalVariance: 500,
			spawnDistanceMultiplier: 3,
			offset: 250,
			side: 'left',
		},
		{
			imageUrl: ['/sprites/farm/horse.png'],
			interval: 2500,
			intervalVariance: 500,
			spawnDistanceMultiplier: 2,
			offset: 10,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/farm/tree.png'],
			interval: 1000,
			intervalVariance: 100,
			spawnDistanceMultiplier: 2,
			offset: 10,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/farm/grasslands1.png'],
			interval: 33,
			intervalVariance: 5,
			spawnDistanceMultiplier: 2,
			offset: 10,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/farm/horspa.png'],
			interval: 15000,
			intervalVariance: 500,
			spawnDistanceMultiplier: 1,
			offset: 10,
			side: 'right',
		},
		{
			imageUrl: ['/sprites/rock.png', '/sprites/rock2.png', '/sprites/rock3.png'],
			interval: 5000,
			spawnDistanceMultiplier: 2,
			sequential: true,
			side: 'right',
		},
		{ ...streetSignDecoration },
	],
};

biome.drawRoad = (canvas, ctx, x, w, index) => {
	// draw the ground
	ctx.fillStyle = biome.ground;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw the stripes
	//ctx.fillStyle = biome.ground2;
	//for (let index = 0; index < canvas.width; index += 20) {
	//    ctx.fillRect(index, 0, 5, canvas.height);
	//}


	ctx.fillStyle = biome.ground2;
	for (let index = 0; index < canvas.width; index++) {
		if (Math.random() > 0.9) ctx.fillRect(index, 0, 1, canvas.height);
	}

	ctx.fillStyle = biome.farmland;
	ctx.fillRect(-25, 0, Math.floor(canvas.width / 2), canvas.height);

	ctx.fillStyle = biome.farmland2;
	for (let index = Math.floor(canvas.width / 2); index > 0; index--) {
		if (Math.random() > 0.9) ctx.fillRect(index, 0, 1, canvas.height);
	}

	/*
	ctx.fillStyle = biome.farmland;
	ctx.fillRect(Math.floor(canvas.width / 2), 0, 25, canvas.height);
	
	ctx.fillStyle = biome.farmland2;
	for (let index = Math.floor(canvas.width / 2); index >  Math.floor(canvas.width / 2) - 25; index--) {
		if (Math.random() > 0.9) ctx.fillRect(index, 0, 1, canvas.height);
	}
	*/
}

export default biome;