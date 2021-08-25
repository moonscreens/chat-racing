import * as THREE from 'three';
import config from './config';
import SimlexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

import SimplexNoise from 'simplex-noise';

const carImage0 = new Image();
carImage0.src = '/sprites/car.png';
const carImage1 = new Image();
carImage1.src = '/sprites/car-turn-1.png';
const carImage2 = new Image();
carImage2.src = '/sprites/car-turn-2.png';

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
        sprite.center.y = 0;
        sprite.position.y = sprite.scale.y / 2;
        Car.add(sprite);
    }
}

export const Car = new THREE.Group();
Car.baseX = 0;
let lastDigit = 0;

const carHorizontalVariance = config.emoteSpawnVariance / 2;
let position = 0;

Car.tick = (delta) => {
    if (!sprite) return;

    position = simplex.noise2D(0, Date.now() / 3000);


    Car.position.x = Car.baseX + (position * carHorizontalVariance);
    let digit = Math.min(2, Math.max(-2, Math.round(Car.position.x / (config.emoteSpawnVariance / 3.5))));
    sprite.position.y = (Math.sin(Date.now() / 200) + 1) / 20;

    // make car bump when you hit an emote
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

    let flipped = true;
    if (digit < 0) {
        flipped = false;
    }

    // turn the car based on position relative to the camera
    if (lastDigit !== digit) {
        lastDigit = digit;
        if (Math.abs(digit) >= 2) {
            drawImage(carImage2, flipped);
        } else if (Math.abs(digit) >= 1) {
            drawImage(carImage1, flipped);
        } else {
            drawImage(carImage0, flipped);
        }
        texture.needsUpdate = true;
    }
}

let lastBump = 0;
const bumpDuration = 125;
Car.bump = function () {
    lastBump = Date.now();
}