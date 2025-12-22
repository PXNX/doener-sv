// src/routes/favorites/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files } from '$lib/server/schema';
import { inArray, eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

async function aggregateRestaurantData(restaurantId: string) {
	const reviews = await db.query.doenerReviews.findMany({
		where: eq(doenerReviews.restaurantId, restaurantId),
		orderBy: desc(doenerReviews.createdAt)
	});

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
			mostCommonGarlicSauce: false,
			latestReviewImage: null,
			latestReviewNotes: null
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

	const yoghurtSauceCount = reviews.filter((r) => r.hasYoghurtSauce).length;
	const garlicSauceCount = reviews.filter((r) => r.hasGarlicSauce).length;

	const getMostCommon = (counts: Record<string, number>) => {
		const entries = Object.entries(counts);
		if (entries.length === 0) return null;
		return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
	};

	const latestReviewWithImage = reviews.find((r) => r.doenerImage);
	const latestReview = reviews[0];

	let latestImageUrl = null;
	if (latestReviewWithImage?.doenerImage) {
		latestImageUrl = await getImageUrl(latestReviewWithImage.doenerImage);
	}

	return {
		mostCommonBreadSesame: breadSesameCount > reviews.length / 2,
		mostCommonBreadFluffy: breadFluffyCount > reviews.length / 2,
		mostCommonBreadCrispy: breadCrispyCount > reviews.length / 2,
		mostCommonMeatType: getMostCommon(meatTypeCount),
		mostCommonMeatProtein: getMostCommon(meatProteinCount),
		mostCommonMeatSeasoning: getMostCommon(meatSeasoningCount),
		mostCommonYoghurtSauce: yoghurtSauceCount > reviews.length / 2,
		mostCommonGarlicSauce: garlicSauceCount > reviews.length / 2,
		latestReviewImage: latestImageUrl,
		latestReviewNotes: latestReview?.notes || null
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const idsParam = url.searchParams.get('ids');

	if (!idsParam) {
		return json({ restaurants: [] });
	}

	const restaurantIds = idsParam.split(',').filter((id) => id.length > 0);

	if (restaurantIds.length === 0) {
		return json({ restaurants: [] });
	}

	// Fetch restaurants from database
	const dbRestaurants = await db
		.select()
		.from(doenerRestaurants)
		.where(inArray(doenerRestaurants.id, restaurantIds));

	// Aggregate data for each restaurant
	const restaurantsWithData = await Promise.all(
		dbRestaurants.map(async (restaurant) => {
			const aggregated = await aggregateRestaurantData(restaurant.id);

			return {
				id: restaurant.id,
				name: restaurant.name,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				reviewCount: restaurant.reviewCount,
				averageRating: restaurant.averageRating || 0,
				...aggregated
			};
		})
	);

	return json({ restaurants: restaurantsWithData });
};
