// src/routes/add-doener/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Extract place information from Google Maps URL
 * Supports various Google Maps URL formats:
 * - maps.app.goo.gl short links
 * - google.com/maps/place links
 * - google.com/maps/@lat,lng links
 */
async function extractPlaceInfo(url: string): Promise<{
	name: string | null;
	latitude: number | null;
	longitude: number | null;
} | null> {
	try {
		// Handle shortened goo.gl links by following the redirect
		if (url.includes('maps.app.goo.gl')) {
			const response = await fetch(url, {
				redirect: 'follow',
				headers: {
					'User-Agent': 'DoenerReviewApp/1.0'
				}
			});
			url = response.url;
		}

		const parsedUrl = new URL(url);
		let name: string | null = null;
		let latitude: number | null = null;
		let longitude: number | null = null;

		// Extract name from /place/ URL
		if (url.includes('/place/')) {
			const placeMatch = url.match(/\/place\/([^/]+)/);
			if (placeMatch) {
				name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
			}
		}

		// Extract coordinates from various formats
		// Format 1: /@lat,lng,zoom
		const coordMatch1 = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
		if (coordMatch1) {
			latitude = parseFloat(coordMatch1[1]);
			longitude = parseFloat(coordMatch1[2]);
		}

		// Format 2: ?q=lat,lng
		const coordMatch2 = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
		if (coordMatch2) {
			latitude = parseFloat(coordMatch2[1]);
			longitude = parseFloat(coordMatch2[2]);
		}

		// Format 3: /data=...!3d(lat)!4d(lng)
		const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
		if (dataMatch) {
			latitude = parseFloat(dataMatch[1]);
			longitude = parseFloat(dataMatch[2]);
		}

		// Validate coordinates
		if (latitude !== null && longitude !== null) {
			if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
				return null;
			}
		}

		return { name, latitude, longitude };
	} catch (error) {
		console.error('Error extracting place info:', error);
		return null;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	// Extract shared data from query parameters
	const title = url.searchParams.get('title');
	const text = url.searchParams.get('text');
	const sharedUrl = url.searchParams.get('url');

	// Check if this is a Google Maps link
	const mapsUrl = sharedUrl || text || '';
	const isGoogleMapsLink =
		mapsUrl.includes('google.com/maps') || mapsUrl.includes('maps.app.goo.gl');

	if (!isGoogleMapsLink) {
		// Not a maps link, redirect to create page without prefill
		throw redirect(303, '/doener/create');
	}

	// Extract place information from the Google Maps URL
	const placeInfo = await extractPlaceInfo(mapsUrl);

	if (!placeInfo || placeInfo.latitude === null || placeInfo.longitude === null) {
		// Failed to extract coordinates, redirect to create page
		throw redirect(303, '/doener/create');
	}

	// Build query parameters for the create page
	const params = new URLSearchParams();
	params.set('lat', placeInfo.latitude.toString());
	params.set('lon', placeInfo.longitude.toString());

	if (placeInfo.name) {
		params.set('name', placeInfo.name);
	}

	// Redirect to create page with prefilled data
	throw redirect(303, `/doener/create?${params.toString()}`);
};
