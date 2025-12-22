// src/routes/doener/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files, users } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

/**
 * Calculate most common attributes from reviews
 */
function calculateMostCommon(reviews: any[]) {
	if (reviews.length === 0) {
		return {
			mostCommonBreadSesame: false,
			mostCommonBreadFluffy: false,
			mostCommonBreadCrispy: false,
			mostCommonMeatType: null,
			mostCommonMeatProtein: null,
			mostCommonMeatSeasoning: null,
			mostCommonSpiceLevel: null,
			mostCommonYoghurtSauce: false,
			mostCommonGarlicSauce: false
		};
	}

	const breadSesameCount = reviews.filter((r) => r.breadHasSesame).length;
	const breadFluffyCount = reviews.filter((r) => r.breadFluffyInside).length;
	const breadCrispyCount = reviews.filter((r) => r.breadCrispyOutside).length;

	const meatTypeCount = reviews.reduce(
		(acc, r) => {
			acc[r.meatType] = (acc[r.meatType] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const meatProteinCount = reviews.reduce(
		(acc, r) => {
			acc[r.meatProtein] = (acc[r.meatProtein] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const meatSeasoningCount = reviews.reduce(
		(acc, r) => {
			acc[r.meatSeasoning] = (acc[r.meatSeasoning] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const spiceLevelCount = reviews.reduce(
		(acc, r) => {
			acc[r.spiceLevel] = (acc[r.spiceLevel] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const yoghurtSauceCount = reviews.filter((r) => r.hasYoghurtSauce).length;
	const garlicSauceCount = reviews.filter((r) => r.hasGarlicSauce).length;

	const getMostCommon = (counts: Record<string, number>) => {
		const entries = Object.entries(counts);
		if (entries.length === 0) return null;
		return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
	};

	return {
		mostCommonBreadSesame: breadSesameCount > reviews.length / 2,
		mostCommonBreadFluffy: breadFluffyCount > reviews.length / 2,
		mostCommonBreadCrispy: breadCrispyCount > reviews.length / 2,
		mostCommonMeatType: getMostCommon(meatTypeCount),
		mostCommonMeatProtein: getMostCommon(meatProteinCount),
		mostCommonMeatSeasoning: getMostCommon(meatSeasoningCount),
		mostCommonSpiceLevel: getMostCommon(spiceLevelCount),
		mostCommonYoghurtSauce: yoghurtSauceCount > reviews.length / 2,
		mostCommonGarlicSauce: garlicSauceCount > reviews.length / 2
	};
}

export const load: PageServerLoad = async ({ params }) => {
	const restaurantId = params.id;

	// Fetch restaurant
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

	// Process reviews and get image URLs
	const reviews = await Promise.all(
		reviewsData.map(async ({ review, user }) => {
			const imageUrl = await getImageUrl(review.doenerImage);

			return {
				id: review.id,
				breadHasSesame: review.breadHasSesame,
				breadFluffyInside: review.breadFluffyInside,
				breadCrispyOutside: review.breadCrispyOutside,
				meatType: review.meatType,
				meatProtein: review.meatProtein,
				meatSeasoning: review.meatSeasoning,
				hasOnions: review.hasOnions,
				hasYoghurtSauce: review.hasYoghurtSauce,
				hasGarlicSauce: review.hasGarlicSauce,
				overallRating: review.overallRating,
				notes: review.notes,
				createdAt: review.createdAt.toISOString(),
				imageUrl,
				user: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			};
		})
	);

	// Get latest review image for header
	const latestReviewWithImage = reviews.find((r) => r.imageUrl);

	// Calculate most common criteria
	const criteria = calculateMostCommon(reviewsData.map((r) => r.review));

	return {
		restaurant: {
			id: restaurant.id,
			name: restaurant.name,
			city: restaurant.city,
			country: restaurant.country,
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
			reviewCount: restaurant.reviewCount,
			averageRating: restaurant.averageRating || 0
		},
		reviews,
		latestReviewImage: latestReviewWithImage?.imageUrl || null,
		criteria
	};
};
