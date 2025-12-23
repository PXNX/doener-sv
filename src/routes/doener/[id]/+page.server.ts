// src/routes/doener/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, users } from '$lib/server/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ params, locals }) => {
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

	// Fetch all reviews for this restaurant
	const reviewsData = await db
		.select({
			review: doenerReviews,
			user: users
		})
		.from(doenerReviews)
		.innerJoin(users, eq(doenerReviews.userId, users.id))
		.where(eq(doenerReviews.restaurantId, restaurantId))
		.orderBy(desc(doenerReviews.createdAt));

	const reviews = reviewsData.map(({ review, user }) => ({
		id: review.id,
		restaurantId: review.restaurantId,
		userId: review.userId,
		meatRating: review.meatRating,
		breadRating: review.breadRating,
		veggiesRating: review.veggiesRating,
		sauceRating: review.sauceRating,
		overallRating:
			(review.meatRating + review.breadRating + review.veggiesRating + review.sauceRating) / 4,
		description: review.description,
		createdAt: review.createdAt.toISOString(),
		user: {
			id: user.id,
			name: user.name,
			email: user.email
		}
	}));

	// Check if current user has already reviewed this restaurant
	let userHasReviewed = false;
	if (locals.user) {
		const existingReview = await db.query.doenerReviews.findFirst({
			where: and(
				eq(doenerReviews.restaurantId, restaurantId),
				eq(doenerReviews.userId, locals.user.id)
			)
		});
		userHasReviewed = !!existingReview;
	}

	// Get image URL
	const imageUrl = await getImageUrl(restaurant.doenerImage);

	return {
		restaurant: {
			id: restaurant.id,
			name: restaurant.name,
			city: restaurant.city,
			country: restaurant.country,
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
			reviewCount: restaurant.reviewCount,
			averageMeatRating: restaurant.averageMeatRating || 0,
			averageBreadRating: restaurant.averageBreadRating || 0,
			averageVeggiesRating: restaurant.averageVeggiesRating || 0,
			averageSauceRating: restaurant.averageSauceRating || 0,
			averageOverallRating: restaurant.averageOverallRating || 0,
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
			hasGarlicSauce: restaurant.hasGarlicSauce,
			doenerImage: imageUrl
		},
		reviews,
		userHasReviewed,
		user: locals.user,
		session: locals.session
	};
};
