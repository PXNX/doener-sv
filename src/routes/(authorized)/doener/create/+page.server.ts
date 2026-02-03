// src/routes/doener/create/+page.server.ts
import { db } from '$lib/server/db';
import { doenerRestaurants, files } from '$lib/server/schema';
import { redirect, error } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { Actions, PageServerLoad } from './$types';
import { uploadFileFromForm } from '$lib/server/backblaze';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createDoenerSchema } from './schema';

async function getCityFromCoordinates(
	lat: number,
	lon: number
): Promise<{ city: string; country: string }> {
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
			{
				headers: {
					'User-Agent': 'DoenerReviewApp/1.0'
				}
			}
		);

		if (!response.ok) {
			throw new Error('Geocoding request failed');
		}

		const data = await response.json();

		const city =
			data.address?.city ||
			data.address?.town ||
			data.address?.village ||
			data.address?.municipality ||
			data.address?.county ||
			'Unknown';

		const country = data.address?.country_code?.toUpperCase() || 'DE';

		return { city, country };
	} catch (err) {
		console.error('Geocoding error:', err);
		return { city: 'Unknown', country: 'DE' };
	}
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const account = locals.user!;

	const form = await superValidate(valibot(createDoenerSchema));

	// Check for prefilled data from query parameters (from share target)
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const name = url.searchParams.get('name');

	// Prefill form data if available
	if (lat && lon) {
		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);

		// Validate coordinates
		if (
			!isNaN(latitude) &&
			!isNaN(longitude) &&
			latitude >= -90 &&
			latitude <= 90 &&
			longitude >= -180 &&
			longitude <= 180
		) {
			form.data.latitude = latitude;
			form.data.longitude = longitude;
		}
	}

	if (name) {
		form.data.restaurantName = name;
	}

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const account = locals.user!;

		const form = await superValidate(request, valibot(createDoenerSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const {
			restaurantName,
			latitude,
			longitude,
			doenerImage,
			breadShape,
			breadHasSesame,
			breadFluffyInside,
			breadCrispyOutside,
			meatType,
			meatProtein,
			meatSeasoning,
			onionLevel,
			krautLevel,
			hasYoghurtSauce,
			hasGarlicSauce
		} = form.data;

		const { city, country } = await getCityFromCoordinates(latitude, longitude);

		// Check if restaurant already exists at this location
		const existingRestaurant = await db.query.doenerRestaurants.findFirst({
			where: and(
				sql`${doenerRestaurants.name} ILIKE ${restaurantName}`,
				sql`ABS(${doenerRestaurants.latitude} - ${latitude}) < 0.001`,
				sql`ABS(${doenerRestaurants.longitude} - ${longitude}) < 0.001`
			)
		});

		if (existingRestaurant) {
			return message(
				form,
				'A restaurant with this name already exists at this location. You can add a review to it instead.',
				{ status: 400 }
			);
		}

		let imageFileId: string | null = null;
		if (doenerImage) {
			const uploadResult = await uploadFileFromForm(doenerImage);

			if (!uploadResult.success) {
				return message(form, 'Failed to upload image', { status: 500 });
			}

			const fileId = randomUUID();
			await db.insert(files).values({
				id: fileId,
				key: uploadResult.key,
				fileName: doenerImage.name,
				contentType: 'image/webp',
				sizeBytes: doenerImage.size,
				uploadedBy: account.id
			});
			imageFileId = fileId;
		}

		// Create new restaurant
		console.log('Inserting restaurant with data:', {
			name: restaurantName,
			city,
			country,
			latitude,
			longitude,
			addedBy: account.id
		});

		const result = await db
			.insert(doenerRestaurants)
			.values({
				name: restaurantName,
				city,
				country,
				latitude,
				longitude,
				doenerImage: imageFileId,
				breadShape,
				breadHasSesame,
				breadFluffyInside,
				breadCrispyOutside,
				meatType,
				meatProtein,
				meatSeasoning,
				onionLevel: onionLevel || null,
				krautLevel: krautLevel || null,
				hasYoghurtSauce,
				hasGarlicSauce,
				addedBy: account.id,
				reviewCount: 0
			})
			.returning();

		console.log('Insert result:', result);

		if (!result || result.length === 0 || !result[0]) {
			console.error('Insert returned no data');
			return message(form, 'Failed to create döner listing. Please try again.', { status: 500 });
		}

		const newRestaurant = result[0];

		if (!newRestaurant.id) {
			console.error('Restaurant created but has no ID:', newRestaurant);
			return message(form, 'Failed to create döner listing. Please try again.', { status: 500 });
		}

		redirect(303, `/doener/${newRestaurant.id}`);
	}
};
