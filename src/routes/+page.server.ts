// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants } from '$lib/server/schema';
import { and, or, sql, desc, gte } from 'drizzle-orm';
import type { DoenerRestaurantResult } from '$lib/types';
import { getImageUrl } from '$lib/server/backblaze';
import { aggregateRestaurantData } from '$lib/server/aggregate';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth's radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
		Math.cos((lat2 * Math.PI) / 180) *
		Math.sin(dLon / 2) *
		Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Search restaurants with filters
 */
async function searchRestaurants(
	location?: string,
	userLat?: number,
	userLon?: number,
	maxDistanceKm: number = 50,
	filters?: {
		minRating?: number;
		breadSesame?: boolean;
		breadFluffy?: boolean;
		breadCrispy?: boolean;
		meatMinced?: boolean;
		meatLayered?: boolean;
		meatChicken?: boolean;
		meatBeef?: boolean;
		meatLamb?: boolean;
		yoghurtSauce?: boolean;
		garlicSauce?: boolean;
		herbalSauce?: boolean;
		cocktailSauce?: boolean;
		spicySauce?: boolean;
	},
	sortBy: 'rating' | 'reviews' | 'distance' = 'rating'
) {
	try {
		const conditions = [];

		// Location search by name (city/restaurant name)
		if (location && location.length >= 2) {
			const searchLower = location.toLowerCase();
			conditions.push(
				or(
					sql`LOWER(${doenerRestaurants.name}) LIKE ${`%${searchLower}%`}`,
					sql`LOWER(${doenerRestaurants.city}) LIKE ${`%${searchLower}%`}`
				)
			);
		}

		// Rating filter
		if (filters?.minRating && filters.minRating > 0) {
			conditions.push(gte(doenerRestaurants.averageOverallRating, filters.minRating));
		}

		// Base query - get all restaurants matching location/rating
		let query = db
			.select({
				id: doenerRestaurants.id,
				name: doenerRestaurants.name,
				doenerImage: doenerRestaurants.doenerImage,
				city: doenerRestaurants.city,
				country: doenerRestaurants.country,
				latitude: doenerRestaurants.latitude,
				longitude: doenerRestaurants.longitude,
				reviewCount: doenerRestaurants.reviewCount,
				createdAt: doenerRestaurants.createdAt
			})
			.from(doenerRestaurants)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		// Apply sorting (except distance which is done after fetching)
		if (sortBy === 'rating') {
			// TODO: calculate actual average rating from reviews
			// query = query.orderBy(desc(doenerRestaurants.averageRating));
		} else if (sortBy === 'reviews') {
			query = query.orderBy(desc(doenerRestaurants.reviewCount));
		}

		let restaurants = await query.limit(200); // Fetch more for GPS filtering

		// Filter by GPS distance if coordinates provided
		if (userLat !== undefined && userLon !== undefined) {
			restaurants = restaurants
				.map((r) => ({
					...r,
					distance: calculateDistance(userLat, userLon, r.latitude, r.longitude)
				}))
				.filter((r) => r.distance <= maxDistanceKm)
				.sort((a, b) => {
					if (sortBy === 'distance') {
						return a.distance - b.distance;
					}
					return 0; // Keep existing order for other sorts
				})
				.slice(0, 50); // Limit to 50 results
		} else {
			restaurants = restaurants.slice(0, 50);
		}

		// If we have review-based filters, we need to check each restaurant's reviews
		const hasReviewFilters =
			filters &&
			(filters.breadSesame ||
				filters.breadFluffy ||
				filters.breadCrispy ||
				filters.meatMinced ||
				filters.meatLayered ||
				filters.meatChicken ||
				filters.meatBeef ||
				filters.meatLamb ||
				filters.yoghurtSauce ||
				filters.garlicSauce ||
				filters.herbalSauce ||
				filters.cocktailSauce ||
				filters.spicySauce);

		const results: DoenerRestaurantResult[] = [];

		for (const restaurant of restaurants) {
			// Get aggregated data
			const aggregated = await aggregateRestaurantData(restaurant.id);

			// Apply review-based filters
			if (hasReviewFilters && filters) {
				let matches = true;

				// Bread filters (OR logic within bread)
				if (filters.breadSesame || filters.breadFluffy || filters.breadCrispy) {
					const breadMatch =
						(filters.breadSesame && aggregated.mostCommonBreadSesame) ||
						(filters.breadFluffy && aggregated.mostCommonBreadFluffy) ||
						(filters.breadCrispy && aggregated.mostCommonBreadCrispy);
					if (!breadMatch) matches = false;
				}

				// Meat type filters (OR logic)
				if (filters.meatMinced || filters.meatLayered) {
					const meatTypeMatch =
						(filters.meatMinced && aggregated.mostCommonMeatType === 'minced') ||
						(filters.meatLayered && aggregated.mostCommonMeatType === 'layered');
					if (!meatTypeMatch) matches = false;
				}

				// Protein filters (OR logic)
				if (filters.meatChicken || filters.meatBeef || filters.meatLamb) {
					const proteinMatch =
						(filters.meatChicken && aggregated.mostCommonMeatProtein === 'Chicken') ||
						(filters.meatBeef && aggregated.mostCommonMeatProtein === 'Beef') ||
						(filters.meatLamb && aggregated.mostCommonMeatProtein === 'Lamb');
					if (!proteinMatch) matches = false;
				}

				// Sauce filters (must have if selected)
				if (filters.yoghurtSauce && !aggregated.mostCommonYoghurtSauce) matches = false;
				if (filters.garlicSauce && !aggregated.mostCommonGarlicSauce) matches = false;
				if (filters.herbalSauce && !aggregated.mostCommonHerbalSauce) matches = false;
				if (filters.cocktailSauce && !aggregated.mostCommonCocktailSauce) matches = false;
				if (filters.spicySauce && !aggregated.mostCommonSpicySauce) matches = false;

				if (!matches) continue;
			}

			const doenerImage = await getImageUrl(restaurant.doenerImage);

			results.push({
				id: restaurant.id,
				name: restaurant.name,
				doenerImage: doenerImage,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				reviewCount: restaurant.reviewCount,
				distance: 'distance' in restaurant ? (restaurant as any).distance : undefined,
				...aggregated
			});
		}

		return results;
	} catch (error) {
		console.error('Search error:', error);
		return [];
	}
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const location = url.searchParams.get('location');
	const latitude = url.searchParams.get('latitude');
	const longitude = url.searchParams.get('longitude');
	const sortBy = (url.searchParams.get('sortBy') || 'rating') as 'rating' | 'reviews' | 'distance';
	const minRating = parseInt(url.searchParams.get('minRating') || '0');

	// Parse GPS coordinates
	const userLat = latitude ? parseFloat(latitude) : undefined;
	const userLon = longitude ? parseFloat(longitude) : undefined;

	// Bread filters
	const breadSesame = url.searchParams.get('breadSesame') === 'true';
	const breadFluffy = url.searchParams.get('breadFluffy') === 'true';
	const breadCrispy = url.searchParams.get('breadCrispy') === 'true';

	// Meat filters
	const meatMinced = url.searchParams.get('meatMinced') === 'true';
	const meatLayered = url.searchParams.get('meatLayered') === 'true';
	const meatChicken = url.searchParams.get('meatChicken') === 'true';
	const meatBeef = url.searchParams.get('meatBeef') === 'true';
	const meatLamb = url.searchParams.get('meatLamb') === 'true';

	// Sauce filters
	const yoghurtSauce = url.searchParams.get('yoghurtSauce') === 'true';
	const garlicSauce = url.searchParams.get('garlicSauce') === 'true';
	const herbalSauce = url.searchParams.get('herbalSauce') === 'true';
	const cocktailSauce = url.searchParams.get('cocktailSauce') === 'true';
	const spicySauce = url.searchParams.get('spicySauce') === 'true';

	// Require either location text or GPS coordinates
	if ((!location || location.length < 2) && (userLat === undefined || userLon === undefined)) {
		return {
			restaurants: [],
			user: locals.user,
			session: locals.session
		};
	}

	const restaurants = await searchRestaurants(
		location,
		userLat,
		userLon,
		50, // 50km max distance
		{
			minRating: minRating > 0 ? minRating : undefined,
			breadSesame,
			breadFluffy,
			breadCrispy,
			meatMinced,
			meatLayered,
			meatChicken,
			meatBeef,
			meatLamb,
			yoghurtSauce,
			garlicSauce,
			herbalSauce,
			cocktailSauce,
			spicySauce
		},
		sortBy
	);

	return {
		restaurants,
		user: locals.user,
		session: locals.session
	};
};

export const actions: Actions = {
	search: async ({ request }) => {
		const formData = await request.formData();
		const location = formData.get('location')?.toString() || '';
		const latitude = formData.get('latitude')?.toString();
		const longitude = formData.get('longitude')?.toString();
		const sortBy = (formData.get('sortBy')?.toString() || 'rating') as
			| 'rating'
			| 'reviews'
			| 'distance';
		const minRating = parseInt(formData.get('minRating')?.toString() || '0');

		// Parse GPS coordinates
		const userLat = latitude ? parseFloat(latitude) : undefined;
		const userLon = longitude ? parseFloat(longitude) : undefined;

		// Bread filters
		const breadSesame = formData.get('breadSesame') === 'on';
		const breadFluffy = formData.get('breadFluffy') === 'on';
		const breadCrispy = formData.get('breadCrispy') === 'on';

		// Meat filters
		const meatMinced = formData.get('meatMinced') === 'on';
		const meatLayered = formData.get('meatLayered') === 'on';
		const meatChicken = formData.get('meatChicken') === 'on';
		const meatBeef = formData.get('meatBeef') === 'on';
		const meatLamb = formData.get('meatLamb') === 'on';

		// Sauce filters
		const yoghurtSauce = formData.get('yoghurtSauce') === 'on';
		const garlicSauce = formData.get('garlicSauce') === 'on';
		const herbalSauce = formData.get('herbalSauce') === 'on';
		const cocktailSauce = formData.get('cocktailSauce') === 'on';
		const spicySauce = formData.get('spicySauce') === 'on';

		// Require either location text or GPS coordinates
		if ((!location || location.length < 2) && (userLat === undefined || userLon === undefined)) {
			return {
				restaurants: [],
				error: 'Please enter a location or use your current location'
			};
		}

		const restaurants = await searchRestaurants(
			location,
			userLat,
			userLon,
			50, // 50km max distance
			{
				minRating: minRating > 0 ? minRating : undefined,
				breadSesame,
				breadFluffy,
				breadCrispy,
				meatMinced,
				meatLayered,
				meatChicken,
				meatBeef,
				meatLamb,
				yoghurtSauce,
				garlicSauce,
				herbalSauce,
				cocktailSauce,
				spicySauce
			},
			sortBy
		);

		return {
			restaurants,
			success: true
		};
	}
};
