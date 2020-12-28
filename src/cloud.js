function shader(src, type, gl, pid) {
	let sid = gl.createShader(type);
	gl.shaderSource(sid, src);
	gl.compileShader(sid);
	if (!gl.getShaderParameter(sid, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling shader!', gl.getShaderInfoLog(sid));

		let temp = gl.getShaderInfoLog(sid).substr(gl.getShaderInfoLog(sid).indexOf('0:'));
		temp = parseInt(temp.substr(2, temp.indexOf(' ') - 3));
		console.log(src.split('\n')[temp - 1]);
	}
	gl.attachShader(pid, sid);
	return sid;
}

const globalCanvas = document.createElement('canvas');
const gl = globalCanvas.getContext('webgl2', { antialias: false }) || globalCanvas.getContext('experimental-webgl2', { antialias: false });

const pid = gl.createProgram();
const vertexShaderID = shader(`#version 300 es
		in vec2 coords;

		void main(void) {
			gl_Position = vec4(coords.xy, 0.0, 1.0);
		}
	`, gl.VERTEX_SHADER, gl, pid);
const fragmentShaderID = shader(`#version 300 es
	#define W0 0x3504f335u
	#define W1 0x8fc1ecd5u
	#define M 741103597u
	
	precision highp float;
	uniform float width;
	uniform float height;
	uniform float u_time;

	uint fast_hash(in uint x, in uint y) {
		x *= W0;
		y *= W1;
		x ^= y;
		x *= M;
		return x;
	}

	float hash_to_float(in uint h) {
		return float(h >> 8u) * (1.0 / 16777216.0);
	}

	vec2 rand_vec(uvec2 p) {
		float angle = hash_to_float(fast_hash(p.x, p.y)) * radians(360.);
		return vec2(cos(angle), sin(angle));
	}

	float perlin_noise(in vec2 point, vec2 wrap, float seed) {
		vec2 point_i = floor(point);
		vec2 point_f = fract(point);

		vec2 vec_tl = rand_vec(uvec2(mod(point_i + vec2(0., 0.), wrap) + vec2(seed)));
		vec2 vec_tr = rand_vec(uvec2(mod(point_i + vec2(1., 0.), wrap) + vec2(seed)));
		vec2 vec_bl = rand_vec(uvec2(mod(point_i + vec2(0., 1.), wrap) + vec2(seed)));
		vec2 vec_br = rand_vec(uvec2(mod(point_i + vec2(1., 1.), wrap) + vec2(seed)));

		vec2 u = point_f * point_f * (3.0 - 2.0 * point_f);
		return mix(
			mix(dot(vec_tl, point_f - vec2(0.0, 0.0)), dot(vec_tr, point_f - vec2(1.0, 0.0)), u.x),
			mix(dot(vec_bl, point_f - vec2(0.0, 1.0)), dot(vec_br, point_f - vec2(1.0, 1.0)), u.x),
			u.y
		) * 1.41;
	}

	float cloud_noise(vec2 uv, float freq, float seed, float time) {
		vec2 wrap = vec2(24., 24.);
		vec2 move = vec2(-time, -time) * wrap;
		float v1 = abs(perlin_noise(uv * freq + move * vec2(-1.0, 1.0), wrap, seed));
		float v2 = abs(perlin_noise(uv * freq * 2. + move * 1.5, wrap * 1.5, seed + wrap.x)) * 0.5;
		float v3 = abs(perlin_noise(uv * freq * 4. + move * 2., wrap * 2., seed + wrap.x * 2.5)) * 0.25;

		float x_mul = min(smoothstep(0.0, 0.5, uv.x), smoothstep(1.0, 0.5, uv.x));
		float y_mul = min(smoothstep(0.0, 0.2, uv.y), smoothstep(1.0, 0.2, uv.y));

		return (v1 + v2 + v3) * x_mul * y_mul * 1. - 0.1;
	}

	out vec4 fragColor;
	void main()
	{
		vec2 fragCoord = gl_FragCoord.xy;
		fragCoord = floor(gl_FragCoord.xy / 2.0) * 2.0;
		
		vec3 light_dir = vec3(cos(u_time * 0.1), sin(u_time * 0.1), 0.0);
		vec2 center = vec2(width, height) / 2.;
		light_dir = vec3(normalize(vec2(width / 2., height) - center), 0.);
		
		float morph_time = 200.0;
		float freq = 1.5;
		float cloud_height = cloud_noise(fragCoord / vec2(width, height), freq, 0., mod(u_time / morph_time, 1.0));
		float other = cloud_noise((fragCoord - light_dir.xy) / vec2(width, height), freq, 0., mod(u_time / morph_time, 1.0));
		float brightness = mix(0.8, 1.0, ceil(other - cloud_height));
		
		vec3 sky = vec3(0.1, 0.5, 0.9);
		
		cloud_height = min(ceil(max(cloud_height, 0.0)), 1.0);
		
		vec4 outputVec = vec4(mix(vec3(0., 0., 0.), mix(sky, vec3(1.0), brightness), cloud_height), 1.);
		if (outputVec.x == 0.) {
			outputVec = vec4(0.,0.,0.,0.);
		}
		fragColor = outputVec;
	}`, gl.FRAGMENT_SHADER, gl, pid);

gl.linkProgram(pid);

if (window.location.hostname.match(/localhost/)) {
	gl.validateProgram(pid);
	if (!gl.getProgramParameter(pid, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(pid));
		console.error(gl.getShaderInfoLog(vertexShaderID));
		console.error(gl.getShaderInfoLog(fragmentShaderID));
	}
}
function fillMe(canvas) {
	globalCanvas.width = canvas.width;
	globalCanvas.height = canvas.height;
	const h = gl.drawingBufferHeight;
	const w = gl.drawingBufferWidth;

	let array = new Float32Array([-1, 3, -1, -1, 3, -1]);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

	let al = gl.getAttribLocation(pid, "coords");
	gl.vertexAttribPointer(al, 2 /*components per vertex */, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(al);

	const timeLocation = gl.getUniformLocation(pid, "u_time");
	const widthLocation = gl.getUniformLocation(pid, "width");
	const heightLocation = gl.getUniformLocation(pid, "height");

	gl.viewport(0, 0, w, h);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(pid);

	gl.uniform1f(timeLocation, Math.random() * 1000);
	gl.uniform1f(widthLocation, w);
	gl.uniform1f(heightLocation, h);

	gl.drawArrays(gl.TRIANGLES, 0, 3);

	canvas.getContext('2d').drawImage(globalCanvas, 0, 0);
}

export default function generateCloud(width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	fillMe(canvas);

	return canvas;
}