export default {
	groundWidth: 600 * 2, //ThreeJS units, how wide the ground is
	groundLength: 350 * 3, //ThreeJS units, how far the ground extends
	groundSlices: 100 * 3, //The depth resolution of the ground
	groundHeight: 5,

	groundResolutionX: 480 * 2,
	groundResolutionY: 1,
	roadPresetDuration: 30000,
	roadPresetEasing: 5000,
	roadPxWidth: 38,

	speedMultiplier: 50,

	emoteSize: 3,
	emoteSpawnVariance: 16,
	emoteDeathLength: 1000, // How long the emotes will fly up before dying in milliseconds
	emoteDeathArc: 10, //a multiple of the emotes size, how high the emote will fly
	carSize: 8,

	cameraHeight: 5,

	roadPaintWidth: 1, //how thick the slices of paint are

	pallet: {
		road: '#373A43',
		road2: '#424651',
		roadPaint: '#FFFFFF',
		roadPaint2: '#373A43',
	}
}