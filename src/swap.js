const execSync = require('child_process').execSync;
const fs = require('node:fs');
const path = require('node:path');
var albums = require('../albums.json');
var albumsById = {};
var imageSrcDir = '/mnt/tank/misc/gphoto-sync/imagesx';
var destFileJpg = '/home/thom/projects/imageServe/images/image.jpg';
var destFileJson = '/home/thom/projects/imageServe/images/image.json';
var destAlbumJson = '/home/thom/projects/imageServe/images/album.json';
var foundFile = '/home/thom/projects/imageServe/images/image.txt';

for(const album of albums) {
	albumsById[album.id] = album;
}
console.log(`loaded ${albums.length} albums`);

async function swap() {
  var cmd = `
find ${imageSrcDir} | grep jpe | sort -R | head -1 | while read file; do
echo $file > ${foundFile}
done
`;

// echo $file
// cp $file /home/thom/projects/imageServe/images/image.jpg

//console.log(cmd);
	const output = execSync(cmd, { encoding: 'utf-8' });
  var now = new Date().toLocaleString('en-US', {
		timeZone: 'America/Los_Angeles'
  });
  console.log(now);
  let fname = fs.readFileSync(foundFile);
	fname = fname.toString().trim();

  console.log(`found image: ${fname}`);
	fs.copyFileSync(fname, destFileJpg);
	const pp = path.parse(fname);
	const jsonFileName = pp.name + '.json';
	const jsonFileSrc = path.join(pp.dir, jsonFileName);
	if(fs.existsSync(jsonFileSrc)) {
		console.log(`Copy ${jsonFileSrc} -> ${destFileJson}`);
		fs.copyFileSync(jsonFileSrc, destFileJson);
	} else {
		console.log(`json file not found: ${jsonFileSrc}`);
		if(fs.existsSync(destFileJson)) {
			fs.unlinkSync(destFileJson)
		}
	}

	let wroteAlbum = false;
	const dirs = pp.dir.split('/');
	if(dirs.length > 7) {
		const curAlbum = dirs[6];
		if(curAlbum in albumsById) {
			fs.writeFileSync(destAlbumJson, JSON.stringify(albumsById[curAlbum]));
			console.log(`Wrote album json: ${destAlbumJson}`);
			wroteAlbum = true;
		}
	}
	if(!wroteAlbum) {
		if(fs.existsSync(destAlbumJson)) {
			fs.unlinkSync(destAlbumJson)
		}
	}

	return null;
}

void swap()
setInterval(swap, 120000);

