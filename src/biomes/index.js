import * as THREE from 'three';
import config from '../config';

const streetSignDecoration = {
    imageUrl: ['/sprites/streetsign_NaM.png', '/sprites/streetsign_borpa.png', '/sprites/streetsign_ratio.png'],
    interval: 90000,
    intervalVariance: 0.5,
    spawnDistanceMultiplier: 0,
}

const biomes = {
    desert: {
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
    },
    grass: {
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
    },
    beach: {
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
    },
}

setInterval(() => {
    ///change to random biome
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
            deco.images = [];
            deco.canvases = [];
            deco.materials = [];
            deco.textures = [];
            deco.lastSpawn = Date.now() + Math.random() * deco.intervalVariance;
            for (let index = 0; index < deco.imageUrl.length; index++) {
                const imageUrl = deco.imageUrl[index];

                if (typeof imageUrl === 'string') deco.images[index] = new Image();
                else deco.images[index] = imageUrl;

                deco.canvases[index] = document.createElement('canvas');
                deco.textures[index] = new THREE.CanvasTexture(deco.canvases[index], undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
                deco.materials[index] = new THREE.SpriteMaterial({
                    map: deco.textures[index],
                });

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