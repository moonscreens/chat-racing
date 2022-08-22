const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

window.biome = query_vars.biome;
console.log(query_vars)
if (window.biome === 'longDriveDesert') {
	window.isLongDrive = true;
}

export default query_vars;