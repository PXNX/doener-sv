// src/routes/doener/[id]/review/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews } from '$lib/server/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createReviewSchema } from './schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	const restaurantId = parseInt(params.id);

	if (isNaN(restaurantId)) {
		throw error(400, 'Invalid restaurant ID');
	}

	const restaurant = await db.query.doenerRestaurants.findFirst({
		where: eq(doenerRestaurants.id, restaurantId)
	});

	if (!restaurant) {
		throw error(404, 'Restaurant not found');
	}

	// Check if user has already reviewed
	const existingReview = await db.query.doenerReviews.findFirst({
		where: and(
			eq(doenerReviews.restaurantId, restaurantId),
			eq(doenerReviews.userId, locals.user.id)
		)
	});

	if (existingReview) {
		throw redirect(303, `/doener/${restaurantId}`);
	}

	// Get image URL
	const imageUrl = await getImageUrl(restaurant.doenerImage);

	const form = await superValidate(valibot(createReviewSchema));

	return {
		restaurant: {
			id: restaurant.id,
			name: restaurant.name,
			city: restaurant.city,
			country: restaurant.country,
			doenerImage: imageUrl
		},
		form
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'You must be logged in to add a review' });
		}

		const restaurantId = parseInt(params.id);

		if (isNaN(restaurantId)) {
			return fail(400, { error: 'Invalid restaurant ID' });
		}

		// Check if restaurant exists
		const restaurant = await db.query.doenerRestaurants.findFirst({
			where: eq(doenerRestaurants.id, restaurantId)
		});

		if (!restaurant) {
			return fail(404, { error: 'Restaurant not found' });
		}

		// Check if user has already reviewed
		const existingReview = await db.query.doenerReviews.findFirst({
			where: and(
				eq(doenerReviews.restaurantId, restaurantId),
				eq(doenerReviews.userId, locals.user.id)
			)
		});

		if (existingReview) {
			return fail(400, { error: 'You have already reviewed this restaurant' });
		}

		const form = await superValidate(request, valibot(createReviewSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const { meatRating, breadRating, veggiesRating, sauceRating, description } = form.data;

		try {
			// Create review
			await db.insert(doenerReviews).values({
				restaurantId,
				userId: locals.user.id,
				meatRating,
				breadRating,
				veggiesRating,
				sauceRating,
				description
			});

			// Update restaurant stats
			const allReviews = await db.query.doenerReviews.findMany({
				where: eq(doenerReviews.restaurantId, restaurantId)
			});

			const avgMeat = allReviews.reduce((sum, r) => sum + r.meatRating, 0) / allReviews.length;
			const avgBread = allReviews.reduce((sum, r) => sum + r.breadRating, 0) / allReviews.length;
			const avgVeggies =
				allReviews.reduce((sum, r) => sum + r.veggiesRating, 0) / allReviews.length;
			const avgSauce = allReviews.reduce((sum, r) => sum + r.sauceRating, 0) / allReviews.length;
			const avgOverall = (avgMeat + avgBread + avgVeggies + avgSauce) / 4;

			await db
				.update(doenerRestaurants)
				.set({
					reviewCount: allReviews.length,
					averageMeatRating: avgMeat,
					averageBreadRating: avgBread,
					averageVeggiesRating: avgVeggies,
					averageSauceRating: avgSauce,
					averageOverallRating: avgOverall,
					updatedAt: new Date()
				})
				.where(eq(doenerRestaurants.id, restaurantId));

			throw redirect(303, `/doener/${restaurantId}`);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Error adding review:', err);
			return message(form, 'Failed to add review. Please try again.', { status: 500 });
		}
	}
};
