import * as THREE from 'three';
import { Car } from './car';
import config from './config';
import biomes from './biomes';

const spawningPosition = -config.groundLength / 2;

let roadChange = Date.now();
const roadPresets = [
    //'straight',
    'wavy',
    'bumpy',
    'wavybumpy',
];
let roadPreset = Math.floor(Math.random() * roadPresets.length);

setInterval(() => {
    roadPreset = Math.floor(Math.random() * roadPresets.length);
    roadChange = Date.now();
}, config.roadPresetDuration);

const roadPresetOffset = config.roadPresetDuration - config.roadPresetEasing;
export function getRoadPresetProgress() {
    const t = Date.now() - roadChange;
    if (t < config.roadPresetEasing) {
        return t / config.roadPresetEasing;
    } else if (t > roadPresetOffset) {
        return 1 - (t - roadPresetOffset) / config.roadPresetEasing;
    } else {
        return 1;
    }
}

export function getPositionModifier() {
    switch (roadPresets[roadPreset]) {
        case 'wavy':
            return (
                Math.sin(Date.now() / 750) * 5
            ) * getRoadPresetProgress();
            break;
        case 'wavybumpy':
            return (
                Math.sin(Date.now() / 750) * 5
            ) * getRoadPresetProgress();
            break;
        default:
            return 0;
    }
}
export function getHeightModifier() {
    if (!biomes[window.biome].canBeBumpy) {
        return 0;
    }
    switch (roadPresets[roadPreset]) {
        case 'bumpy':
            return (
                (
                    Math.sin(Date.now() / 500) / 2 + 0.5
                ) * -config.groundHeight
            ) * getRoadPresetProgress();
            break;
        case 'wavybumpy':
            return (
                (
                    Math.sin(Date.now() / 500) / 2 + 0.5
                ) * -config.groundHeight
            ) * getRoadPresetProgress();
            break;
        default:
            return 0;
    }
}

export function groundInit(scene, tickArray) {
    for (let index = 0; index < config.groundSlices; index++) {
        generateSlice(scene, index);
    }

    tickArray.push((delta) => {
        for (let index = 0; index < roadArray.length; index++) {
            const slice = roadArray[index];
            slice.position.z += delta * config.speedMultiplier;
            if (slice.position.z > 0) {
                drawRoad(slice.canvas, slice.ctx, slice.roadIndex);
                slice.material.map.needsUpdate = true;
                slice.material.needsUpdate = true;
                slice.position.z += spawningPosition;
                slice.position.x = getPositionModifier();
                slice.position.y = (-config.groundHeight / 2) + getHeightModifier();
            } else if (Math.round(slice.position.z) === Math.round(Car.position.z)) {
                Car.position.y = slice.position.y + config.groundHeight / 2;
                Car.baseX = slice.position.x;
            }
        }
    });
}

const roadArray = [];

const sliceDepth = (config.groundLength / 2) / config.groundSlices;
//const ground_geometry = new THREE.PlaneBufferGeometry(config.groundWidth, sliceDepth, 1);
const ground_geometry = new THREE.BoxBufferGeometry(config.groundWidth, config.groundHeight, sliceDepth, 1);

function drawRoad(canvas, ctx, index) {
    const w = config.roadPxWidth;
    const x = Math.round(canvas.width / 2 - w / 2);

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    biomes[window.biome].drawRoad(canvas, ctx, x, w, index);



    ctx.fillStyle = config.pallet.road;
    if (Math.round(index / 5) % 2 > 0) {
        ctx.fillStyle = config.pallet.road2;
    }
    ctx.fillRect(x, 0, w, canvas.height);


    ctx.fillStyle = config.pallet.roadPaint;
    if (Math.round(index / 5) % 2 > 0) {
        ctx.fillStyle = config.pallet.roadPaint2;
    } else {
        ctx.fillRect(x + Math.round(w / 2 - config.roadPaintWidth / 2), 0, config.roadPaintWidth, canvas.height);
    }
    ctx.fillRect(x, 0, config.roadPaintWidth, canvas.height);
    ctx.fillRect(x + w - config.roadPaintWidth, 0, config.roadPaintWidth, canvas.height);
}

export function generateSlice(scene, index) {
    const canvas = document.createElement('canvas');
    canvas.width = config.groundResolutionX;
    canvas.height = config.groundResolutionY;
    const ctx = canvas.getContext('2d');
    drawRoad(canvas, ctx, index);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.format = THREE.RGBAFormat;

    const ground_material = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        map: texture,
    });

    const ground_mesh = new THREE.Mesh(ground_geometry, ground_material);
    ground_mesh.canvas = canvas;
    ground_mesh.roadIndex = index;
    ground_mesh.ctx = ctx;
    //ground_mesh.rotation.x = -Math.PI / 2;
    ground_mesh.position.y = -config.groundHeight / 2;
    ground_mesh.position.z = spawningPosition + (index * sliceDepth);
    roadArray.push(ground_mesh);
    scene.add(ground_mesh);
}