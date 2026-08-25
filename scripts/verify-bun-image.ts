import { strict as assert } from 'node:assert';

const source = await Bun.file('static/favicon.png').arrayBuffer();

const output = await new Bun.Image(source, { maxPixels: 24_000_000 })
	.resize(256, 256, { fit: 'inside' })
	.webp({ quality: 95 })
	.buffer();
const metadata = await new Bun.Image(output).metadata();

assert.equal(metadata.format, 'webp');
assert.ok(metadata.width > 0);
assert.ok(metadata.height > 0);

console.log('Bun.Image WebP verification passed.');
