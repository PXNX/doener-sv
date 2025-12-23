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

			return {
				id: review.id,
				rating: review.rating,
				description: review.description,
				createdAt: review.createdAt.toISOString(),
				imageUrl,
				restaurant: {
					id: restaurant.id,
					name: restaurant.name,
					city: restaurant.city,
					country: restaurant.country,
					// Include döner characteristics
					breadShape: restaurant.breadShape,
					breadHasSesame: restaurant.breadHasSesame,
					breadFluffyInside: restaurant.breadFluffyInside,
					breadCrispyOutside: restaurant.breadCrispyOutside,
					meatType: restaurant.meatType,
					meatProtein: restaurant.meatProtein,
					meatSeasoning: restaurant.meatSeasoning,
					onionLevel: restaurant.onionLevel,
					krautLevel: restaurant.krautLevel,
					hasYoghurtSauce: restaurant.hasYoghurtSauce,
					hasGarlicSauce: restaurant.hasGarlicSauce
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
		const review = await db.query.doenerReviews.findFirst({
			where: eq(doenerReviews.id, reviewId)
		});

		if (!review) {
			return fail(404, { error: 'Review not found' });
		}

		// Delete the review
		await db.delete(doenerReviews).where(eq(doenerReviews.id, reviewId));

		// Update restaurant stats
		const remainingReviews = await db.query.doenerReviews.findMany({
			where: eq(doenerReviews.restaurantId, review.restaurantId)
		});

		const avgRating =
			remainingReviews.length > 0
				? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
				: 0;

		await db
			.update(doenerRestaurants)
			.set({
				reviewCount: remainingReviews.length,
				averageRating: avgRating > 0 ? avgRating : null,
				updatedAt: new Date()
			})
			.where(eq(doenerRestaurants.id, review.restaurantId));

		return { success: true };
	}
};
