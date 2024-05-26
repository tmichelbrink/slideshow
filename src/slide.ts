import { SwapClass } from "./lib/SwapClass";

async function main() {
	const sleepMs: number = 120000;

	const swap = new SwapClass();
	await swap.initialize();

	while(true) {
		await swap.getImage('/home/thom/projects/imageServe/images/slide.png');
		await sleep(sleepMs);
	}
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

void main();