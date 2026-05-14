// src/routes/admin/reviews/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerReviews, doenerRestaurants, users } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/');
	}

	// Fetch all reviews with restaurant and user info
	const allReviews = await db
		.select({
			review: doenerReviews,
			restaurant: doenerRestaurants,
			user: users
		})
		.from(doenerReviews)
		.innerJoin(doenerRestaurants, eq(doenerReviews.restaurantId, doenerRestaurants.id))
		.innerJoin(users, eq(doenerReviews.userId, users.id))
		.orderBy(desc(doenerReviews.createdAt))
		.limit(100);

	const reviews = await Promise.all(
		allReviews.map(async ({ review, restaurant, user }) => {
			// Get image from restaurant
			const imageUrl = await getImageUrl(restaurant.doenerImage);

			const overallRating =
				(review.meatRating + review.breadRating + review.veggiesRating + review.sauceRating) / 4;

			return {
				id: review.id,
				rating: Math.round(overallRating * 10) / 10,
				meatRating: review.meatRating,
				breadRating: review.breadRating,
				veggiesRating: review.veggiesRating,
				sauceRating: review.sauceRating,
				description: review.description,
				createdAt: review.createdAt.toISOString(),
				imageUrl,
				restaurant: {
					id: restaurant.id,
					name: restaurant.name,
					city: restaurant.city,
					country: restaurant.country
				},
				user: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			};
		})
	);

	return {
		reviews
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();
		const reviewId = formData.get('reviewId')?.toString();

		if (!reviewId) {
			return fail(400, { error: 'Review ID required' });
		}

		// Get review to update restaurant stats
		const reviewIdNum = parseInt(reviewId);
		if (isNaN(reviewIdNum)) {
			return fail(400, { error: 'Invalid review ID' });
		}

		const review = await db.query.doenerReviews.findFirst({
			where: eq(doenerReviews.id, reviewIdNum)
		});

		if (!review) {
			return fail(404, { error: 'Review not found' });
		}

		await db.delete(doenerReviews).where(eq(doenerReviews.id, reviewIdNum));

		// Update restaurant stats
		const remainingReviews = await db.query.doenerReviews.findMany({
			where: eq(doenerReviews.restaurantId, review.restaurantId)
		});

		const avgMeat =
			remainingReviews.length > 0
				? remainingReviews.reduce((s, r) => s + r.meatRating, 0) / remainingReviews.length
				: 0;
		const avgBread =
			remainingReviews.length > 0
				? remainingReviews.reduce((s, r) => s + r.breadRating, 0) / remainingReviews.length
				: 0;
		const avgVeggies =
			remainingReviews.length > 0
				? remainingReviews.reduce((s, r) => s + r.veggiesRating, 0) / remainingReviews.length
				: 0;
		const avgSauce =
			remainingReviews.length > 0
				? remainingReviews.reduce((s, r) => s + r.sauceRating, 0) / remainingReviews.length
				: 0;
		const avgOverall = (avgMeat + avgBread + avgVeggies + avgSauce) / 4;

		await db
			.update(doenerRestaurants)
			.set({
				reviewCount: remainingReviews.length,
				averageMeatRating: avgMeat > 0 ? avgMeat : null,
				averageBreadRating: avgBread > 0 ? avgBread : null,
				averageVeggiesRating: avgVeggies > 0 ? avgVeggies : null,
				averageSauceRating: avgSauce > 0 ? avgSauce : null,
				averageOverallRating: avgOverall > 0 ? avgOverall : null,
				updatedAt: new Date()
			})
			.where(eq(doenerRestaurants.id, review.restaurantId));

		return { success: true };
	}
};
