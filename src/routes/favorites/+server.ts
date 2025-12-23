// src/routes/favorites/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants } from '$lib/server/schema';
import { inArray } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

export const GET: RequestHandler = async ({ url }) => {
	const idsParam = url.searchParams.get('ids');

	if (!idsParam) {
		return json({ restaurants: [] });
	}

	const restaurantIds = idsParam.split(',').filter((id) => id.length > 0);

	if (restaurantIds.length === 0) {
		return json({ restaurants: [] });
	}

	// Fetch restaurants from database (all döner characteristics are stored here)
	const dbRestaurants = await db
		.select()
		.from(doenerRestaurants)
		.where(inArray(doenerRestaurants.id, restaurantIds));

	// Get image URLs and format results
	const restaurantsWithData = await Promise.all(
		dbRestaurants.map(async (restaurant) => {
			const imageUrl = await getImageUrl(restaurant.doenerImage);

			return {
				id: restaurant.id,
				name: restaurant.name,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				reviewCount: restaurant.reviewCount,
				averageRating: restaurant.averageRating || 0,
				// Döner characteristics (stored in restaurant record)
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
			};
		})
	);

	return json({ restaurants: restaurantsWithData });
};
