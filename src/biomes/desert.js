import streetSignDecoration from './streetsigns.js';

const biome = {
	sky: '#7EBDFC',
	ground: '#EAB560',
	ground2: '#D8A04B',
	clouds: {
		light: '#F8F8F8',
		dark: '#BCE0DB',
	},
	decorations: [
		{
			imageUrl: ['/sprites/cacti.png', '/sprites/cacti2.png', '/sprites/cacti3.png'],
			interval: 200,
			intervalVariance: 0,
			spawnDistanceMultiplier: 2,
		},
		{
			imageUrl: ['/sprites/dune.png', '/sprites/dune2.png', '/sprites/dune3.png'],
			interval: 1000,
			spawnDistanceMultiplier: 2,
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

export default biome;