import { createShader, createProgram } from './util';

const pallet = {
	road: '#373A43',
	road2: '#424651',
	roadPaint: '#FFFFFF',
	roadPaint2: '#373A43',
}

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2', { antialias: false });

const vertexShader = createShader(gl, gl.VERTEX_SHADER, require('./shaders/test.vert'));
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, require('./shaders/test.frag'));
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// three 2d points
const positions = [
	0, 0,
	0, 0.5,
	0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(
	positionAttributeLocation, size, type, normalize, stride, offset);

gl.useProgram(program);
gl.bindVertexArray(vao);


let lastFrame = Date.now();
function draw() {
	requestAnimationFrame(draw);
	const delta = Math.min(1, (Date.now() - lastFrame) / 1000);
	lastFrame = Date.now();

	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 3;

	gl.drawArrays(primitiveType, offset, count);
}

function resize() {
	canvas.width = Math.round(Math.min(1920, window.innerWidth) / 4);
	canvas.height = Math.round(Math.min(1080, window.innerHeight) / 4);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

window.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(canvas);
	resize();
	window.addEventListener('resize', resize);
	draw();
})
