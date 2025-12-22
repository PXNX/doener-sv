// src/lib/server/backblaze.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { randomUUID } from "crypto";
import {
	BACKBLAZE_KEY_ID,
	BACKBLAZE_APPLICATION_KEY,
	BACKBLAZE_BUCKET_NAME,
	BACKBLAZE_REGION,
	BACKBLAZE_ENDPOINT
} from "$env/static/private";

const s3Client = new S3Client({
	endpoint: BACKBLAZE_ENDPOINT,
	region: BACKBLAZE_REGION,
	credentials: {
		accessKeyId: BACKBLAZE_KEY_ID,
		secretAccessKey: BACKBLAZE_APPLICATION_KEY
	},
	forcePathStyle: true
});

export interface UploadResult {
	success: boolean;
	key: string;
	error?: string;
}

// Fixed image dimensions - all images converted to 96x96 WebP
const IMAGE_SIZE = 96;
const WEBP_QUALITY = 85;

/**
 * Convert image to 96x96 WebP format
 * @param buffer - Original image buffer
 * @returns Processed WebP image buffer
 */
async function processImageToWebP(buffer: Buffer): Promise<Buffer> {
	return await sharp(buffer)
		.resize(IMAGE_SIZE, IMAGE_SIZE, {
			fit: "cover",
			position: "center",
			withoutEnlargement: false
		})
		.webp({ quality: WEBP_QUALITY })
		.toBuffer();
}

/**
 * Upload a file buffer to Backblaze B2 (converted to 96x96 WebP)
 * @param buffer - File buffer to upload
 * @param fileName - Original filename (for reference)
 * @returns Upload result with storage key
 */
export async function uploadFile(buffer: Buffer, fileName: string): Promise<UploadResult> {
	try {
		// Always process to 96x96 WebP
		const processedBuffer = await processImageToWebP(buffer);

		// Generate unique key with .webp extension
		const uniqueKey = `${randomUUID()}.webp`;

		const command = new PutObjectCommand({
			Bucket: BACKBLAZE_BUCKET_NAME,
			Key: uniqueKey,
			Body: processedBuffer,
			ContentType: "image/webp",
			CacheControl: "public, max-age=31536000, immutable",
			Metadata: {
				originalName: fileName,
				uploadedAt: new Date().toISOString(),
				resized: `${IMAGE_SIZE}x${IMAGE_SIZE}`
			}
		});

		await s3Client.send(command);

		return {
			success: true,
			key: uniqueKey
		};
	} catch (error) {
		console.error("Upload failed:", error);
		return {
			success: false,
			key: "",
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

/**
 * Upload a file directly from FormData (converted to 96x96 WebP)
 * @param file - File from form input
 * @returns Upload result with storage key
 */
export async function uploadFileFromForm(file: File): Promise<UploadResult> {
	if (!file || file.size === 0) {
		return {
			success: false,
			key: "",
			error: "No file provided or file is empty"
		};
	}

	// Validate file size (5MB limit for original)
	const maxSize = 5 * 1024 * 1024;
	if (file.size > maxSize) {
		return {
			success: false,
			key: "",
			error: "File size exceeds 5MB limit"
		};
	}

	// Validate that it's an image
	if (!file.type.startsWith("image/")) {
		return {
			success: false,
			key: "",
			error: "File must be an image"
		};
	}

	// Convert to buffer
	const buffer = Buffer.from(await file.arrayBuffer());

	return uploadFile(buffer, file.name);
}

export async function getPresignedUploadUrl(key: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ContentType: "image/webp",
		CacheControl: "public, max-age=31536000, immutable"
	});

	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Get signed download URL with extended expiration for caching
 * @param key - File key in B2
 * @param expiresIn - Expiration time in seconds (default: 7 days for better caching)
 * @returns Signed URL
 */
export async function getSignedDownloadUrl(
	key: string,
	expiresIn: number = 604800 // 7 days
): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ResponseCacheControl: `public, max-age=${expiresIn}, immutable`
	});

	return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get signed download URL with short expiration (for sensitive content)
 * @param key - File key in B2
 * @returns Signed URL with 1 hour expiration
 */
export async function getSignedDownloadUrlShort(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BACKBLAZE_BUCKET_NAME,
		Key: key,
		ResponseCacheControl: "public, max-age=3600"
	});

	return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
