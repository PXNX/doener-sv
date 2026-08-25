import { strict as assert } from 'node:assert';

const source = await Bun.file('static/favicon.png').arrayBuffer();

const output = await new Bun.Image(source, { maxPixels: 24_000_000 })
	.resize(256, 256, { fit: 'fill' })
	.webp({ quality: 95 })
	.buffer();
const metadata = await new Bun.Image(output).metadata();

assert.equal(metadata.format, 'webp');
assert.equal(metadata.width, 256);
assert.equal(metadata.height, 256);

console.log('Bun.Image fixed 256x256 WebP verification passed.');
