import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants } from '$lib/server/schema';
import { inArray } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';
import { aggregateRestaurantData } from '$lib/server/aggregate';

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

	const dbRestaurants = await db
		.select()
		.from(doenerRestaurants)
		.where(inArray(doenerRestaurants.id, restaurantIds));

	const restaurantsWithData = await Promise.all(
		dbRestaurants.map(async (restaurant) => {
			const aggregated = await aggregateRestaurantData(restaurant.id);
			const doenerImage = await getImageUrl(restaurant.doenerImage);

			return {
				id: restaurant.id,
				name: restaurant.name,
				doenerImage,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				reviewCount: restaurant.reviewCount,
				...aggregated
			};
		})
	);

	return json({ restaurants: restaurantsWithData });
};
