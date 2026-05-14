// src/routes/favorites/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews } from '$lib/server/schema';
import { inArray, eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

/**
 * Calculate most common attributes from reviews for a restaurant
 */
async function aggregateRestaurantData(restaurantId: number) {
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
			mostCommonYoghurtSauce: false,
			mostCommonGarlicSauce: false,
			latestReviewImage: null
		};
	}

	const breadSesameCount = reviews.filter((r) => r.breadSesameSeeds).length;
	const breadFluffyCount = reviews.filter((r) => (r.breadFluffy ?? 0) >= 3).length;
	const breadCrispyCount = reviews.filter((r) => (r.breadCrispiness ?? 0) >= 3).length;

	const meatTypeCount = reviews.reduce(
		(acc, r) => {
			if (r.meatStyle) acc[r.meatStyle] = (acc[r.meatStyle] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const meatProteinCount: Record<string, number> = {};
	for (const r of reviews) {
		if (r.meatChicken) meatProteinCount['chicken'] = (meatProteinCount['chicken'] || 0) + 1;
		if (r.meatBeef) meatProteinCount['beef'] = (meatProteinCount['beef'] || 0) + 1;
		if (r.meatLamb) meatProteinCount['lamb'] = (meatProteinCount['lamb'] || 0) + 1;
	}

	const meatSeasoningCount: Record<string, number> = {};

	const yoghurtSauceCount = reviews.filter((r) => r.hasYoghurtSauce).length;
	const garlicSauceCount = reviews.filter((r) => r.hasGarlicSauce).length;

	const getMostCommon = (counts: Record<string, number>) => {
		const entries = Object.entries(counts);
		if (entries.length === 0) return null;
		return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
	};

	const latestReviewWithImage = reviews.find((r) => r.reviewImage);

	let latestImageUrl = null;
	if (latestReviewWithImage?.reviewImage) {
		latestImageUrl = await getImageUrl(latestReviewWithImage.reviewImage);
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
		latestReviewImage: latestImageUrl
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const idsParam = url.searchParams.get('ids');

	if (!idsParam) {
		return json({ restaurants: [] });
	}

	const restaurantIds = idsParam
		.split(',')
		.map((id) => parseInt(id))
		.filter((id) => !isNaN(id));

	if (restaurantIds.length === 0) {
		return json({ restaurants: [] });
	}

	// Fetch restaurants from database
	const dbRestaurants = await db
		.select()
		.from(doenerRestaurants)
		.where(inArray(doenerRestaurants.id, restaurantIds));

	// Get aggregated data and format results
	const restaurantsWithData = await Promise.all(
		dbRestaurants.map(async (restaurant) => {
			const aggregated = await aggregateRestaurantData(restaurant.id);

			// Calculate overall rating from category averages
			const categoryRatings = [
				restaurant.averageMeatRating,
				restaurant.averageBreadRating,
				restaurant.averageVeggiesRating,
				restaurant.averageSauceRating
			].filter((rating): rating is number => rating !== null);

			const averageOverallRating =
				categoryRatings.length > 0
					? categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length
					: 0;

			return {
				id: restaurant.id,
				name: restaurant.name,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				reviewCount: restaurant.reviewCount,
				averageRating: averageOverallRating,
				// Aggregated döner characteristics from reviews
				breadShape: restaurant.breadShape,
				breadHasSesame: aggregated.mostCommonBreadSesame,
				breadFluffyInside: aggregated.mostCommonBreadFluffy,
				breadCrispyOutside: aggregated.mostCommonBreadCrispy,
				meatType: aggregated.mostCommonMeatType,
				meatProtein: aggregated.mostCommonMeatProtein,
				meatSeasoning: aggregated.mostCommonMeatSeasoning,
				onionLevel: restaurant.onionLevel,
				krautLevel: restaurant.krautLevel,
				hasYoghurtSauce: aggregated.mostCommonYoghurtSauce,
				hasGarlicSauce: aggregated.mostCommonGarlicSauce,
				latestReviewImage: aggregated.latestReviewImage
			};
		})
	);

	return json({ restaurants: restaurantsWithData });
};
