import { strict as assert } from 'node:assert';

const source = await Bun.file('static/favicon.png').arrayBuffer();

const output = await new Bun.Image(source, { maxPixels: 24_000_000 })
	.resize(1024, 1024, { fit: 'fill' })
	.webp({ quality: 95 })
	.buffer();
const metadata = await new Bun.Image(output).metadata();

assert.equal(metadata.format, 'webp');
assert.equal(metadata.width, 1024);
assert.equal(metadata.height, 1024);

console.log('Bun.Image fixed 1024x1024 WebP verification passed.');
