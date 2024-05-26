const execSync = require('child_process').execSync;
import * as fs from 'fs';
import * as path from 'path';
var albums = require('../../albums.json');
import * as crypto from 'crypto';

export interface IimgFile {
	fileName: string,
	isVertical: boolean
	album: string;
	fileDate: string;
	metaData: {
		height: string;
		photo: any;
		width: string;
		creationTime: string;
	}
}

export interface IimageData {
	allImages: string[];
	imageData: Record<string, IimgFile>,
	verticalImages: string[]
}

export class SwapClass {
	protected isInitialized: boolean = false;
  protected albumsById: Record<string, any> = {};
  protected imageSrcDir = '/mnt/tank/misc/gphoto-sync/imagesx';
  protected destFileJpg = '/home/thom/projects/imageServe/images/image.jpg';
  protected destFileJson = '/home/thom/projects/imageServe/images/image.json';
  protected destAlbumJson = '/home/thom/projects/imageServe/images/album.json';
  protected foundFile = '/home/thom/projects/imageServe/images/image.txt';

	protected filesFile = '/tmp/imagesFiles.txt';
	protected imageDataFile = '/tmp/imagesData.json';

	// protected maxWidth = 1100;
	// protected maxHeight = 700;

	protected maxWidth = 1100;
	protected maxHeight = 850;

	protected images: IimageData = {
		imageData: {},
		allImages: [],
		verticalImages: []
	};

	public async initialize() {
		if(this.isInitialized) {
			return;
		}

		if(!fs.existsSync(this.imageDataFile)) {
			await this.createImageData();
		}

		this.images = require(this.imageDataFile);
		const imgQty = this.images.allImages.length;
		const vertQty = this.images.verticalImages.length;

		console.log(`ImageQty: ${imgQty}`);
		console.log(`VerticalQty: ${vertQty}`);

		console.log(`initialized`);
		this.isInitialized = true;
	}

	public async getImage(dstFile: string) {
		const image = await this.getRandomImage();
		let rawFilePath: string;
		let image2: IimgFile | null = null;

		if(image.isVertical) {
			image2 = await this.getRandomImage(true);
			rawFilePath = await this.mergeImages(image, image2);
		} else {
			rawFilePath = await this.resizeFile(image);
		}

		const finalFilePath = await this.finalResize(rawFilePath);

		fs.copyFileSync(finalFilePath, dstFile);
		const now = new Date();
		console.log(`${now}: Slide created`);

		return;
	}

	private async getRandomImage(isVertical: boolean = false) {
		await this.initialize();

		let image: IimgFile | null = null;
		while(image === null) {
			const maxImageQty = isVertical ? this.images.verticalImages.length -1 : this.images.allImages.length -1
			const rndNum = Math.floor(Math.random() * maxImageQty);
			const now = new Date();
			console.log(`${now}: Got image ${rndNum}`);
			const hash = isVertical ? this.images.verticalImages[rndNum] : this.images.allImages[rndNum];
			if(hash in this.images.imageData)  {
				image = this.images.imageData[hash];
			}
		}

		return image;
	}

	private async mergeImages(image1: IimgFile, image2: IimgFile) {
		const maxWidth = Math.floor(this.maxWidth / 2);
		const maxHeight = this.maxHeight;
		const point = 15;
		const resized1 = await this.resizeFile(image1, maxHeight, maxWidth, point, '/tmp/image1.png');
		const resized2 = await this.resizeFile(image2, maxHeight, maxWidth, point, '/tmp/image2.png');

		const cmd = `convert ${resized1} ${resized2} +append /tmp/image.png`;
		// console.log(cmd);
		execSync(cmd, { encoding: 'utf-8' });

		return '/tmp/image.png';
	}

	private async resizeFile(image: IimgFile, maxHeight:number = this.maxHeight, maxWidth: number = this.maxWidth, pointSize: number = 30, fname: string = '/tmp/image.png') {

		const cmd = `convert ${image.fileName} -resize ${maxWidth}x${maxHeight}\\\> ${fname}`;
		// console.log(cmd);
		execSync(cmd, { encoding: 'utf-8' });

		const upVal = pointSize + Math.floor(pointSize / 3)
		const cmd2= `convert ${fname} -pointsize ${pointSize} -fill yellow -undercolor Black -gravity SouthWest -annotate +15+${upVal} "${image.album}" ${fname}`;
		// console.log(cmd2);
		execSync(cmd2, { encoding: 'utf-8' });

		const tmp = image.fileDate.split('T')
		const imageTime = `${tmp[0]} ${tmp[1].substring(0, tmp[1].length -1)}`;

		const cmd3 = `convert ${fname} -pointsize ${pointSize} -fill yellow -undercolor Black -gravity SouthWest -annotate +15+0 "${imageTime}" ${fname}`;
		// console.log(cmd3);
		execSync(cmd3, { encoding: 'utf-8' });

		return fname;
	}

	private async finalResize(imagePath: string) {

		const finalPath = '/tmp/imageFinal.png';
		const cmd = `convert ${imagePath} -background none -gravity center -extent ${this.maxWidth}x${this.maxHeight} -resize ${this.maxWidth}x${this.maxHeight} ${finalPath}`;
		console.log(cmd);
		execSync(cmd, { encoding: 'utf-8' });

		return finalPath
	}

	private async createImageData() {
		const allFiles: string[] = [];

		for(const album of albums) {
			this.albumsById[album.id] = album;
		}

		var cmd = `find ${this.imageSrcDir} > /tmp/imagesFiles.txt`;
		execSync(cmd, { encoding: 'utf-8' });

		if(!fs.existsSync(this.filesFile)) {
			console.error(`Unable to load images: ${this.filesFile}`);
			setImmediate(process.exit);
		}

		const fileContents = fs.readFileSync(this.filesFile).toString();
		const lines = fileContents.split('\n');
		for(let line of lines) {
			line = line.trim();
			allFiles.push(line);
		}

		if(allFiles.length == 0) {
			console.error(`FoundNoFiles in ${this.filesFile}`);
			setImmediate(process.exit);
		}
		let i = 0;
		for(const file of allFiles) {
			i++;
			if(i % 1000 === 0) {
				console.log(`FileQty: ${i}`);
			}
			
			const pp = path.parse(file);

			if(pp.ext === '.json') {
				const base = path.basename(file, '.json');
				const jpeFile = path.join(pp.dir, `${base}.jpe`);

				if(allFiles.indexOf(jpeFile) > -1) {

					const jsonFile = fs.readFileSync(file).toString();
					const jsonStats = JSON.parse(jsonFile);

					if(!jsonStats?.mediaMetadata.height || !jsonStats?.mediaMetadata.width) {
						console.error(`NoHeightOrWidth: ${file}`);
						continue;
					}

					const height = parseInt(jsonStats.mediaMetadata.height, 10);
					const width = parseInt(jsonStats.mediaMetadata.width, 10);

					const isVertical = height > width ? true : false;
					const fileDate = jsonStats?.mediaMetadata?.creationTime || '';
					const metadata = jsonStats?.mediaMetadata || {};

					let album = '';
					const tmp = file.split('/');
					if(tmp.length > 6) {
						const albumId = tmp[6];
						if(albumId in this.albumsById) {
							album = this.albumsById[albumId].title;
						}
					}

					const hash = crypto.createHash('md5').update(base).digest("hex")

					this.images.imageData[hash] = {
						fileName: jpeFile,
						isVertical: isVertical,
						album: album,
						fileDate: fileDate,
						metaData: metadata
					};

					this.images.allImages.push(hash);

					if(isVertical) {
						this.images.verticalImages.push(hash);
					}

				}
			}

		}

	fs.writeFileSync(this.imageDataFile, JSON.stringify(this.images))
		console.log(`imageDataFileCreates: ${this.imageDataFile}`);
	}

}