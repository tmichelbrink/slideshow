import { SwapClass } from "./SwapClass";

async function main() {
	const swap = new SwapClass();
	await swap.initialize();
	for(let i=0;i<=4;i++){
		const image = await swap.getImage();
		console.log(image);
	}
}

void main();