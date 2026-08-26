import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStoredImage } from '$lib/server/backblaze';

export const GET: RequestHandler = async ({ params }) => {
	const image = await getStoredImage(params.fileId);

	if (!image) {
		throw error(404, 'Image not found');
	}

	return new Response(image.stream, {
		headers: {
			'content-type': image.contentType,
			'cache-control': 'public, max-age=31536000, immutable',
			'x-content-type-options': 'nosniff'
		}
	});
};
