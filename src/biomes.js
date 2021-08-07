import * as THREE from 'three';
import config from './config';
import streetsignurl from './streetsign.png';
const streetSignDecoration = {
    imageUrl: [streetsignurl],
    interval: 20000,
    intervalVariance: 0,
    spawnDistanceMultiplier: 0,
    size: 10,
}

import treeUrl from './tree.png';
import tree2Url from './tree2.png';
import rockUrl from './rock.png';
import rock2Url from './rock2.png';
import rock3Url from './rock3.png';
import cactiUrl from './cacti.png';
import cliffUrl from './cliff.png';
import cliff2Url from './cliff2.png';
import cliff3Url from './cliff3.png';
import seagulUrl from './seagul.png';
import boatUrl from './boat.png';

const biomes = {
    desert: {
        sky: '#7EBDFC',
        clouds: {
            light: '#F8F8F8',
            dark: '#BCE0DB',
        },
        decorations: [
            {
                imageUrl: [cactiUrl],
                interval: 200,
                intervalVariance: 0,
                spawnDistanceMultiplier: 2,
                size: 10,
            },
            {
                imageUrl: [cactiUrl],
                interval: 200,
                intervalVariance: 0,
                spawnDistanceMultiplier: 2,
                size: 256,
            },
            { ...streetSignDecoration },
        ],
    },
    grass: {
        sky: '#8BC7C8',
        clouds: {
            light: '#DEF7E9',
            dark: '#A9CEE5',
        },
        decorations: [
            {
                imageUrl: [treeUrl, treeUrl, treeUrl, tree2Url],
                interval: 30,
                intervalVariance: 0,
                spawnDistanceMultiplier: 1.5,
                size: 200,
            },
            {
                imageUrl: [rockUrl, rock2Url, rock3Url],
                interval: 50,
                intervalVariance: 0,
                spawnDistanceMultiplier: 2,
                sequential: true,
                size: 40,
            },
            { ...streetSignDecoration },
        ],
    },
    beach: {
        sky: '#87C4F1',
        clouds: {
            light: '#E0ECFC',
            dark: '#9FBCE6',
        },
        decorations: [
            {
                imageUrl: [cliffUrl, cliff2Url, cliff3Url],
                interval: 200,
                side: 'left',
                intervalVariance: 0,
                spawnDistanceMultiplier: 0.05,
                size: 65,
                sequential: true,
            },
            {
                side: 'right',
                ...streetSignDecoration
            },
            {
                imageUrl: [seagulUrl],
                interval: 3000,
                side: 'right',
                intervalVariance: 0.5,
                spawnDistanceMultiplier: 1,
                size: 10,
            },
            {
                imageUrl: [boatUrl],
                interval: 3000,
                side: 'right',
                intervalVariance: 0.5,
                spawnDistanceMultiplier: 1,
                size: 50,
            }
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
        biome.clouds.lightColor = new THREE.Color(biome.clouds.light);
        biome.clouds.darkColor = new THREE.Color(biome.clouds.dark);
        for (let o = 0; o < biome.decorations.length; o++) {
            const deco = biome.decorations[o];
            deco.index = 0;
            deco.images = [];
            deco.canvases = [];
            deco.materials = [];
            deco.textures = [];
            deco.lastSpawn = Date.now() + Math.random() * deco.intervalVariance;
            for (let index = 0; index < deco.imageUrl.length; index++) {
                const imageUrl = deco.imageUrl[index];
                console.log(imageUrl);

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