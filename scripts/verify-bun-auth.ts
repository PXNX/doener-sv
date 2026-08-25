import { strict as assert } from 'node:assert';

const bytes = crypto.getRandomValues(new Uint8Array(20));
const token = Buffer.from(bytes).toString('base64url');
const sessionId = new Bun.CryptoHasher('sha256').update(token).digest('hex');

assert.match(token, /^[A-Za-z0-9_-]+$/);
assert.equal(token.length, 27);
assert.match(sessionId, /^[a-f0-9]{64}$/);
assert.equal(
	new Bun.CryptoHasher('sha256').update('abc').digest('hex'),
	'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
);

console.log('Bun session cryptography verification passed.');
