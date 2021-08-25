import streetSignDecoration from './streetsigns.js';

const biome = {
    sky: '#87C4F1',
    ground: '#739F45',
    ground2: '#E8E69B',
    ocean: '#659FDA',
    ocean2: '#A0D2F5',
    clouds: {
        light: '#E0ECFC',
        dark: '#9FBCE6',
    },
    canBeBumpy: false,
    decorations: [
        {
            imageUrl: ['/sprites/cliff.png', '/sprites/cliff2.png', '/sprites/cliff3.png'],
            interval: 200,
            side: 'left',
            intervalVariance: 0,
            spawnDistanceMultiplier: 0.05,
            sequential: true,
        },
        {
            side: 'right',
            ...streetSignDecoration
        },
        {
            imageUrl: ['/sprites/seagul.png'],
            interval: 3000,
            side: 'right',
            intervalVariance: 0.5,
            spawnDistanceMultiplier: 2,
        },
    ],
};

biome.drawRoad = (canvas, ctx, x, w, index) => {
    // draw the far side sand textures
    ctx.fillStyle = biome.ground;
    ctx.fillRect(0, 0, Math.floor(canvas.width / 2), canvas.height);

    // draw the actual water
    ctx.fillStyle = biome.ocean;
    ctx.fillRect(Math.ceil(canvas.width / 2), 0, Math.ceil(canvas.width / 2), canvas.height);

    // draw the sprays of water in the ocean
    ctx.fillStyle = biome.ocean2;
    for (let index = Math.floor(canvas.width / 2); index < canvas.width; index += 4) {
        if (Math.random() > 0.9) ctx.fillRect(index, 0, 1, canvas.height);
    }

    // draw the beach separating the ocean from the road
    ctx.fillStyle = biome.ground2;
    ctx.fillRect(Math.floor(canvas.width / 2), 0, 35, canvas.height);
}

export default biome;