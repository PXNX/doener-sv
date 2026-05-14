import { db } from '$lib/server/db';
import { doenerRestaurants, files } from '$lib/server/schema';
import { redirect } from '@sveltejs/kit';
import { and, sql } from 'drizzle-orm';
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

function cleanRestaurantName(name: string): string {
	return name.split(',')[0].trim();
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const account = locals.user!;

	const form = await superValidate(valibot(createDoenerSchema));

	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const name = url.searchParams.get('name');

	if (lat && lon) {
		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);

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
		form.data.restaurantName = cleanRestaurantName(name);
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

		const { restaurantName, latitude, longitude, doenerImage } = form.data;

		const { city, country } = await getCityFromCoordinates(latitude, longitude);

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

		const result = await db
			.insert(doenerRestaurants)
			.values({
				name: restaurantName,
				city,
				country,
				latitude,
				longitude,
				doenerImage: imageFileId,
				addedBy: account.id,
				reviewCount: 0
			})
			.returning();

		if (!result || result.length === 0 || !result[0]?.id) {
			return message(form, 'Failed to create döner listing. Please try again.', { status: 500 });
		}

		redirect(303, `/doener/${result[0].id}/review`);
	}
};
