import { SwapClass } from "./lib/SwapClass";

async function main() {
	const swap = new SwapClass();
	await swap.initialize();
	while(true) {
		const image = await swap.getImage();
		console.log(image);
		await sleep(12000);
	}
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

void main();