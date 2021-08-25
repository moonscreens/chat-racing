import streetSignDecoration from './streetsigns.js';

const biome = {
    sky: '#8BC7C8',
    ground: '#699148',
    ground2: '#7EA75B',
    clouds: {
        light: '#DEF7E9',
        dark: '#A9CEE5',
    },
    decorations: [
        {
            imageUrl: ['/sprites/tree.png'],
            interval: 30,
            intervalVariance: 0,
            spawnDistanceMultiplier: 1.5,
        },
        {
            imageUrl: ['/sprites/tallTree.png', '/sprites/tallTree2.png', '/sprites/tallTree3.png'],
            interval: 2500,
            intervalVariance: 0.5,
            sequential: true,
        },
        {
            imageUrl: ['/sprites/rock.png', '/sprites/rock2.png', '/sprites/rock3.png'],
            interval: 50,
            intervalVariance: 0,
            spawnDistanceMultiplier: 2,
            sequential: true,
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