const execSync = require('child_process').execSync;

async function main() {
	var albums = require('../albums.json');
	for(var album of albums) {
		console.log(album.id);
		var cmd = `cd /home/thom/projects/gitmoo-goog && ./gitmoo-goog -album ${album.id} -folder imagesx/${album.id} -folder-format images`; 
		console.log(cmd);
		const output = execSync(cmd, { encoding: 'utf-8' });
		console.log(output);
	}
	return null;
}


void main();
