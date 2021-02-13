import * as THREE from 'three';
import config from './config';
const carImage0 = new Image();
carImage0.src = require('./car.png');

const carImage1 = new Image();
carImage1.src = require('./car-turn-1.png');

const carImage2 = new Image();
carImage2.src = require('./car-turn-2.png');


carImage0.addEventListener('load', checkLoaded);
carImage1.addEventListener('load', checkLoaded);
carImage2.addEventListener('load', checkLoaded);

let width, height, texture, material, sprite;
let complete = false;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function drawImage(image) {
    ctx.drawImage(image, Math.round(canvas.width / 2 - image.width / 2), canvas.height - image.height);
}

function checkLoaded() {
    if (complete) return;
    if (carImage0.complete == true && carImage1.complete == true && carImage2.complete == true) {
        complete = true;
        width = Math.max(carImage0.width, carImage1.width, carImage2.width);
        height = Math.max(carImage0.height, carImage1.height, carImage2.height);

        canvas.width = width;
        canvas.height = height;
        drawImage(carImage0);

        texture = new THREE.CanvasTexture(canvas, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
        material = new THREE.SpriteMaterial({
            map: texture,
        });
        sprite = new THREE.Sprite(material);
        sprite.scale.x = (width / Math.max(width, height)) * config.carSize;
        sprite.scale.y = (height / Math.max(width, height)) * config.carSize;
        sprite.position.y = sprite.scale.y / 2;
        Car.add(sprite);
    }
}

export const Car = new THREE.Group();