import * as THREE from 'three';
import config from './config';
import { easeInOutElastic } from 'js-easing-functions';
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

function drawImage(image, flipped = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const x = Math.round(canvas.width / 2 - image.width / 2);
    ctx.save();
    if (flipped) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(
        image,
        x,
        canvas.height - image.height,
    );
    ctx.restore();
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
        sprite.defaultY = sprite.scale.y / 2;
        Car.add(sprite);
    }
}

export const Car = new THREE.Group();
Car.baseX = 0;
let lastDigit = 0;

const carHorizontalVariance = config.emoteSpawnVariance / 2;
let lastLaneChange = Date.now();
let laneChangeSpeed = 8000;
let laneChangeInterval = 15000;
let lane = Math.random() < 0.5 ? 1 : -1;
let position = 0;
let nextChange = 0;

Car.tick = (delta) => {
    if (Date.now() - lastLaneChange > nextChange) {
        lane *= -1;
        lastLaneChange = Date.now();
        nextChange = (laneChangeInterval - laneChangeSpeed) * Math.random() + laneChangeSpeed;
    }
    if (Date.now() - lastLaneChange < laneChangeSpeed) {
        position = easeInOutElastic(Date.now() - lastLaneChange, lane * -1, lane * 2, laneChangeSpeed);
    } else {
        position = lane;
    }


    Car.position.x = Car.baseX + (position * carHorizontalVariance);
    const digit = Math.min(2, Math.max(-2, Math.round(Car.position.x / (config.emoteSpawnVariance / 4))));
    sprite.position.y = sprite.defaultY + (Math.sin(Date.now() / 200) + 1) / 20;

    let bumpProg = (Date.now() - lastBump) / bumpDuration;
    let bumpMult = 1;
    if (bumpProg >= 2) bumpProg = 0;
    else if (bumpProg >= 1) {
        bumpProg = 2 - bumpProg;
        bumpMult = 0.5;
    };

    if (Math.abs(digit) >= 2) { // Jiggle when we're far from the center
        sprite.position.y += Math.cos(Date.now() / 50) * 0.05;
    }

    sprite.position.y += Math.sin(bumpProg * Math.PI) * bumpMult * 0.5;

    if (lastDigit !== digit) {
        lastDigit = digit;
        switch (digit) {
            case -2:
                drawImage(carImage2, true);
                break;
            case -1:
                drawImage(carImage1, true);
                break;
            case 1:
                drawImage(carImage1, false);
                break;
            case 2:
                drawImage(carImage2, false);
                break;
            default:
                drawImage(carImage0, false);
                break;
        }
        texture.needsUpdate = true;
    }
}

let lastBump = 0;
const bumpDuration = 125;
Car.bump = function () {
    lastBump = Date.now();
}