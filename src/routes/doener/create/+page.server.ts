// src/routes/doener/create/+page.server.ts
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files } from '$lib/server/schema';
import { redirect, error } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { Actions, PageServerLoad } from './$types';
import { uploadFileFromForm } from '$lib/server/backblaze';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createDoenerReviewSchema } from './schema';

// Function to get city name from coordinates using reverse geocoding
async function getCityFromCoordinates(
	lat: number,
	lon: number
): Promise<{ city: string; country: string }> {
	try {
		// Using Nominatim OpenStreetMap API for reverse geocoding
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
			{
				headers: {
					'User-Agent': 'DoenerReviewApp/1.0' // Required by Nominatim
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
		// Default to Germany if geocoding fails
		return { city: 'Unknown', country: 'DE' };
	}
}

// Function to find or create restaurant
async function findOrCreateRestaurant(
	restaurantName: string,
	latitude: number,
	longitude: number,
	userId: string,
	city: string,
	country: string
): Promise<string> {
	// Check if restaurant exists nearby (within ~100 meters)
	const existingRestaurant = await db.query.doenerRestaurants.findFirst({
		where: and(
			sql`${doenerRestaurants.name} ILIKE ${restaurantName}`,
			sql`ABS(${doenerRestaurants.latitude} - ${latitude}) < 0.001`,
			sql`ABS(${doenerRestaurants.longitude} - ${longitude}) < 0.001`
		)
	});

	if (existingRestaurant) {
		return existingRestaurant.id;
	}

	// Create new restaurant
	const [newRestaurant] = await db
		.insert(doenerRestaurants)
		.values({
			id: randomUUID(),
			name: restaurantName,
			city,
			country,
			latitude,
			longitude,
			addedBy: userId,
			reviewCount: 0
		})
		.returning();

	return newRestaurant.id;
}

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.user!;

	const form = await superValidate(valibot(createDoenerReviewSchema));

	// Set default values
	form.data.breadHasSesame = false;
	form.data.breadFluffyInside = false;
	form.data.breadCrispyOutside = false;
	form.data.hasOnions = 'none';
	form.data.hasYoghurtSauce = false;
	form.data.hasGarlicSauce = false;
	form.data.overallRating = 3;

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const account = locals.user!;

		const form = await superValidate(request, valibot(createDoenerReviewSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const {
			restaurantName,
			latitude,
			longitude,
			doenerImage,
			breadHasSesame,
			breadFluffyInside,
			breadCrispyOutside,
			meatType,
			meatProtein,
			meatSeasoning,
			hasOnions,
			hasYoghurtSauce,
			hasGarlicSauce,
			overallRating,
			notes
		} = form.data;

		try {
			// Get city from coordinates
			const { city, country } = await getCityFromCoordinates(latitude, longitude);

			// Upload image if provided
			let imageFileId: string | null = null;
			if (doenerImage) {
				const uploadResult = await uploadFileFromForm(doenerImage);

				if (!uploadResult.success) {
					return message(form, 'Failed to upload image', { status: 500 });
				}

				// Create file record in database
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

			// Find or create restaurant
			const restaurantId = await findOrCreateRestaurant(
				restaurantName,
				latitude,
				longitude,
				account.id,
				city,
				country
			);

			// Create review
			const [review] = await db
				.insert(doenerReviews)
				.values({
					id: randomUUID(),
					restaurantId,
					userId: account.id,
					doenerImage: imageFileId,
					breadHasSesame,
					breadFluffyInside,
					breadCrispyOutside,
					meatType,
					meatProtein,
					meatSeasoning,
					hasOnions,

					hasYoghurtSauce,
					hasGarlicSauce,
					overallRating,
					notes: notes || null
				})
				.returning();

			// Update restaurant stats
			const reviews = await db.query.doenerReviews.findMany({
				where: eq(doenerReviews.restaurantId, restaurantId)
			});

			const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

			await db
				.update(doenerRestaurants)
				.set({
					reviewCount: reviews.length,
					averageRating: avgRating,
					updatedAt: new Date()
				})
				.where(eq(doenerRestaurants.id, restaurantId));

			// Redirect to review page or restaurant page
			throw redirect(303, `/doener/${restaurantId}`);
		} catch (err) {
			console.error('Error creating review:', err);
			return message(form, 'Failed to submit review. Please try again.', { status: 500 });
		}
	}
};
