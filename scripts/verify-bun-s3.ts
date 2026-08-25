import { strict as assert } from 'node:assert';

const client = new Bun.S3Client({
	accessKeyId: 'test-access-key',
	secretAccessKey: 'test-secret-key',
	bucket: 'doener-test-bucket',
	region: 'us-east-005',
	endpoint: 'https://s3.us-east-005.backblazeb2.com',
	virtualHostedStyle: false
});

const uploadUrl = new URL(
	client.presign('uploads/verification.webp', {
		method: 'PUT',
		type: 'image/webp',
		expiresIn: 3600
	})
);
const downloadUrl = new URL(
	client.presign('uploads/verification.webp', {
		method: 'GET',
		expiresIn: 3600
	})
);

assert.equal(uploadUrl.host, 's3.us-east-005.backblazeb2.com');
assert.equal(downloadUrl.host, 's3.us-east-005.backblazeb2.com');
assert.equal(uploadUrl.pathname, '/doener-test-bucket/uploads/verification.webp');
assert.equal(downloadUrl.pathname, '/doener-test-bucket/uploads/verification.webp');
assert.equal(uploadUrl.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
assert.equal(downloadUrl.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
assert.equal(uploadUrl.searchParams.get('X-Amz-Expires'), '3600');
assert.equal(downloadUrl.searchParams.get('X-Amz-Expires'), '3600');

console.log('Bun S3 Backblaze presign verification passed.');
