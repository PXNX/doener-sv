// src/lib/server/backblaze.ts
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';
import { db } from './db';
import { eq } from 'drizzle-orm/sql';
import { files } from './schema';

const s3Client = new Bun.S3Client({
	accessKeyId: env.BACKBLAZE_KEY_ID,
	secretAccessKey: env.BACKBLAZE_APPLICATION_KEY,
	bucket: env.BACKBLAZE_BUCKET_NAME,
	region: env.BACKBLAZE_REGION,
	endpoint: env.BACKBLAZE_ENDPOINT,
	// Backblaze B2's S3-compatible endpoint uses path-style bucket addressing.
	virtualHostedStyle: false
});

export interface UploadResult {
	success: boolean;
	key: string;
	error?: string;
}

// Images are normalized to this fixed square WebP dimension.
const IMAGE_SIZE = 1024;
const WEBP_QUALITY = 95;
const MAX_IMAGE_PIXELS = 24_000_000;

/**
 * Convert validated image bytes to an optimized WebP buffer with Bun.Image.
 *
 * The fixed `fill` mode guarantees exactly IMAGE_SIZE × IMAGE_SIZE output.
 */
async function processImageToWebP(buffer: Buffer): Promise<Buffer> {
	return await new Bun.Image(buffer, {
		maxPixels: MAX_IMAGE_PIXELS,
		autoOrient: true
	})
		.resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'fill' })
		.webp({ quality: WEBP_QUALITY })
		.buffer();
}

/**
 * Upload a file buffer to Backblaze B2 (optimized as WebP)
 * @param buffer - File buffer to upload
 * @returns Upload result with storage key
 */
export async function uploadFile(buffer: Buffer): Promise<UploadResult> {
	try {
		// Always process to fixed 1024x1024 WebP
		const processedBuffer = await processImageToWebP(buffer);

		// Generate unique key with .webp extension
		const uniqueKey = `${randomUUID()}.webp`;

		await s3Client.write(uniqueKey, processedBuffer, {
			type: 'image/webp',
			retry: 3
		});

		return {
			success: true,
			key: uniqueKey
		};
	} catch (error) {
		console.error('Upload failed:', error);
		return {
			success: false,
			key: '',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Upload a file directly from FormData (optimized as WebP)
 * @param file - File from form input
 * @returns Upload result with storage key
 */
export async function uploadFileFromForm(file: File): Promise<UploadResult> {
	if (!file || file.size === 0) {
		return {
			success: false,
			key: '',
			error: 'No file provided or file is empty'
		};
	}

	// Validate file size (5MB limit for original)
	const maxSize = 5 * 1024 * 1024;
	if (file.size > maxSize) {
		return {
			success: false,
			key: '',
			error: 'File size exceeds 5MB limit'
		};
	}

	// Validate that it's an image
	if (!file.type.startsWith('image/')) {
		return {
			success: false,
			key: '',
			error: 'File must be an image'
		};
	}

	// Convert to buffer
	const buffer = Buffer.from(await file.arrayBuffer());

	return uploadFile(buffer);
}

export function getPresignedUploadUrl(key: string): string {
	return s3Client.presign(key, {
		method: 'PUT',
		type: 'image/webp',
		expiresIn: 3600
	});
}

/**
 * Get a temporary signed download URL.
 * @param key - File key in B2
 * @param expiresIn - Expiration time in seconds (default: 7 days)
 * @returns Signed URL
 */
export function getSignedDownloadUrl(
	key: string,
	expiresIn: number = 604800 // 7 days
): string {
	return s3Client.presign(key, {
		method: 'GET',
		expiresIn
	});
}

/**
 * Get signed URL for a file
 */
export async function getImageUrl(fileId: string | null): Promise<string | null> {
	if (!fileId) return null;

	const file = await db.query.files.findFirst({
		where: eq(files.id, fileId)
	});

	if (!file) return null;

	return await getSignedDownloadUrl(file.key);
}
