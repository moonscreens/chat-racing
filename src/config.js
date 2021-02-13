module.exports = {
	groundWidth: 480 * 2, //ThreeJS units, how wide the ground is
	groundLength: 350 * 2, //ThreeJS units, how far the ground extends
	groundSlices: 100 * 2, //The depth resolution of the ground
	groundHeight: 5,

	groundResolutionX: 480 * 2,
	groundResolutionY: 1,
	roadPresetDuration: 30000,
	roadPresetEasing: 5000,
	roadPxWidth: 30,

	speedMultiplier: 50,

	emoteSize: 3,
	emoteSpawnVariance: 12,
	carSize: 8,

	cameraHeight: 5,

	roadPaintWidth: 1, //how thick the slices of paint are

	pallet: {
		road: '#373A43',
		road2: '#424651',
		roadPaint: '#FFFFFF',
		roadPaint2: '#373A43',

		sky_blue: '#5ADBFF',
		desert: {
			ground: '#F6F5AE',
		}
	}
}