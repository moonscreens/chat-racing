import * as THREE from 'three';
const config = require('./config');

const spawningPosition = -config.groundLength / 2;

const startTime = Date.now();

export function getPositionModifier() {
    return (Math.sin(Date.now() / 750) * Math.sin(Date.now() / 7500)) * 15;
    return 0;
}

export function groundInit(scene, tickArray) {
    for (let index = 0; index < config.groundSlices; index++) {
        generateSlice(scene, index);
    }

    tickArray.push((delta) => {
        for (let index = 0; index < roadArray.length; index++) {
            const slice = roadArray[index];
            slice.position.z += delta * 50;
            if (slice.position.z > 0) {
                slice.position.z += spawningPosition;
                slice.position.x = getPositionModifier()
            }
        }
    });
}

const roadArray = [];

const sliceDepth = (config.groundLength / 2) / config.groundSlices;
const ground_geometry = new THREE.PlaneBufferGeometry(config.groundWidth, sliceDepth, 1);

function drawRoad(canvas, ctx, index) {
    const w = config.roadPxWidth;
    const x = Math.round(canvas.width / 2 - w / 2);

    ctx.fillStyle = config.pallet.desert.ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


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
    texture.format = THREE.RGBFormat;

    const ground_material = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        map: texture,
    });

    const ground_mesh = new THREE.Mesh(ground_geometry, ground_material);
    ground_mesh.rotation.x = -Math.PI / 2;
    ground_mesh.position.z = spawningPosition + (index * sliceDepth);
    roadArray.push(ground_mesh);
    scene.add(ground_mesh);
}