import streetSignDecoration from './streetsigns.js';

const biome = {
    sky: '#8BC7C8',
    ground: '#767D8E',
    ground2: '#626877',
    clouds: {
        light: '#DEF7E9',
        dark: '#A9CEE5',
    },
    decorations: [
        {
            imageUrl: ['/sprites/city/billding1.png', '/sprites/city/billding2.png', '/sprites/city/billding3.png', '/sprites/city/billding4.png', '/sprites/city/building1.png', '/sprites/city/building2.png', '/sprites/city/building3.png', '/sprites/city/building4.png', '/sprites/city/building5.png', '/sprites/city/building6.png'],
            interval: 100,
			flip: true,
            intervalVariance: 0,
            spawnDistanceMultiplier: 1.5,
			offset: 30,
        },
        {
            imageUrl: ['/sprites/city/lcar1.png', '/sprites/city/lcar2.png', '/sprites/city/lcar3.png'],
            interval: 300,
            side: 'left',
            spawnDistanceMultiplier: 0,
			offset: -25,
            sequential: true,
        },
        {
            imageUrl: ['/sprites/city/rcar1.png', '/sprites/city/rcar2.png', '/sprites/city/rcar3.png'],
            interval: 300,
            side: 'right',
            spawnDistanceMultiplier: 0,
			offset: -25,
            sequential: true,
        },
        {
            imageUrl: ['/sprites/city/light.png'],
            interval: 1000,
            spawnDistanceMultiplier: 0,
			side: 'left',
			offset: -10,
			flip: true,
        },
        {
            imageUrl: ['/sprites/city/light.png'],
            interval: 1000,
            spawnDistanceMultiplier: 0,
			side: 'right',
			offset: -10,
			flip: true,
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
}

export default biome;