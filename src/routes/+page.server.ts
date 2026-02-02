// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files } from '$lib/server/schema';
import { eq, and, or, sql, desc, gte } from 'drizzle-orm';
import type { DoenerRestaurantResult } from '$lib/types';
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
			mostCommonSpiceLevel: null,
			mostCommonYoghurtSauce: false,
			mostCommonGarlicSauce: false,
			latestReviewImage: null,
			latestReviewNotes: null
		};
	}

	// Count occurrences
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

	// Find most common
	const getMostCommon = (counts: Record<string, number>) => {
		const entries = Object.entries(counts);
		if (entries.length === 0) return null;
		return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
	};

	// Get latest review with image
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

/**
 * Search restaurants with filters
 */
async function searchRestaurants(
	location?: string,
	filters?: {
		minRating?: number;
		breadSesame?: boolean;
		breadFluffy?: boolean;
		breadCrispy?: boolean;
		meatMinced?: boolean;
		meatLayered?: boolean;
		meatChicken?: boolean;
		meatBeef?: boolean;
		meatMixed?: boolean;
		seasoningPure?: boolean;
		seasoningSeasoned?: boolean;
		hasOnions?: boolean;
		spicy?: boolean;
		mild?: boolean;
		yoghurtSauce?: boolean;
		garlicSauce?: boolean;
	},
	sortBy: 'rating' | 'reviews' = 'rating'
) {
	try {
		const conditions = [];

		// Location search
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
			conditions.push(gte(doenerRestaurants.averageRating, filters.minRating));
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
				//		averageRating: doenerRestaurants.averageRating,
				createdAt: doenerRestaurants.createdAt
			})
			.from(doenerRestaurants)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		// Apply sorting
		if (sortBy === 'rating') {
			// TODO: calculat actual average rating from reviews
			//	query = query.orderBy(desc(doenerRestaurants.averageRating));
		} else {
			query = query.orderBy(desc(doenerRestaurants.reviewCount));
		}

		const restaurants = await query.limit(50);

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
				filters.meatMixed ||
				filters.seasoningPure ||
				filters.seasoningSeasoned ||
				filters.hasOnions ||
				filters.spicy ||
				filters.mild ||
				filters.yoghurtSauce ||
				filters.garlicSauce);

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
				if (filters.meatChicken || filters.meatBeef || filters.meatMixed) {
					const proteinMatch =
						(filters.meatChicken && aggregated.mostCommonMeatProtein === 'chicken') ||
						(filters.meatBeef && aggregated.mostCommonMeatProtein === 'beef') ||
						(filters.meatMixed && aggregated.mostCommonMeatProtein === 'mixed');
					if (!proteinMatch) matches = false;
				}

				// Seasoning filters (OR logic)
				if (filters.seasoningPure || filters.seasoningSeasoned) {
					const seasoningMatch =
						(filters.seasoningPure && aggregated.mostCommonMeatSeasoning === 'pure') ||
						(filters.seasoningSeasoned && aggregated.mostCommonMeatSeasoning === 'seasoned');
					if (!seasoningMatch) matches = false;
				}

				// Sauce filters (must have if selected)
				if (filters.yoghurtSauce && !aggregated.mostCommonYoghurtSauce) matches = false;
				if (filters.garlicSauce && !aggregated.mostCommonGarlicSauce) matches = false;

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
				averageRating: 0, // restaurant.averageRating || 0,
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
	const sortBy = (url.searchParams.get('sortBy') || 'rating') as 'rating' | 'reviews';
	const minRating = parseInt(url.searchParams.get('minRating') || '0');

	// Bread filters
	const breadSesame = url.searchParams.get('breadSesame') === 'true';
	const breadFluffy = url.searchParams.get('breadFluffy') === 'true';
	const breadCrispy = url.searchParams.get('breadCrispy') === 'true';

	// Meat filters
	const meatMinced = url.searchParams.get('meatMinced') === 'true';
	const meatLayered = url.searchParams.get('meatLayered') === 'true';
	const meatChicken = url.searchParams.get('meatChicken') === 'true';
	const meatBeef = url.searchParams.get('meatBeef') === 'true';
	const meatMixed = url.searchParams.get('meatMixed') === 'true';

	// Seasoning filters
	const seasoningPure = url.searchParams.get('seasoningPure') === 'true';
	const seasoningSeasoned = url.searchParams.get('seasoningSeasoned') === 'true';

	// Topping filters
	const hasOnions = url.searchParams.get('hasOnions') === 'true';
	const spicy = url.searchParams.get('spicy') === 'true';
	const mild = url.searchParams.get('mild') === 'true';

	// Sauce filters
	const yoghurtSauce = url.searchParams.get('yoghurtSauce') === 'true';
	const garlicSauce = url.searchParams.get('garlicSauce') === 'true';

	if (!location || location.length < 2) {
		return {
			restaurants: [],
			user: locals.user,
			session: locals.session
		};
	}

	const restaurants = await searchRestaurants(
		location,
		{
			minRating: minRating > 0 ? minRating : undefined,
			breadSesame,
			breadFluffy,
			breadCrispy,
			meatMinced,
			meatLayered,
			meatChicken,
			meatBeef,
			meatMixed,
			seasoningPure,
			seasoningSeasoned,
			hasOnions,
			spicy,
			mild,
			yoghurtSauce,
			garlicSauce
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
		const sortBy = (formData.get('sortBy')?.toString() || 'rating') as 'rating' | 'reviews';
		const minRating = parseInt(formData.get('minRating')?.toString() || '0');

		// Bread filters
		const breadSesame = formData.get('breadSesame') === 'on';
		const breadFluffy = formData.get('breadFluffy') === 'on';
		const breadCrispy = formData.get('breadCrispy') === 'on';

		// Meat filters
		const meatMinced = formData.get('meatMinced') === 'on';
		const meatLayered = formData.get('meatLayered') === 'on';
		const meatChicken = formData.get('meatChicken') === 'on';
		const meatBeef = formData.get('meatBeef') === 'on';
		const meatMixed = formData.get('meatMixed') === 'on';

		// Seasoning filters
		const seasoningPure = formData.get('seasoningPure') === 'on';
		const seasoningSeasoned = formData.get('seasoningSeasoned') === 'on';

		// Topping filters
		const hasOnions = formData.get('hasOnions') === 'on';
		const spicy = formData.get('spicy') === 'on';
		const mild = formData.get('mild') === 'on';

		// Sauce filters
		const yoghurtSauce = formData.get('yoghurtSauce') === 'on';
		const garlicSauce = formData.get('garlicSauce') === 'on';

		if (!location || location.length < 2) {
			return {
				restaurants: [],
				error: 'Please enter at least 2 characters'
			};
		}

		const restaurants = await searchRestaurants(
			location,
			{
				minRating: minRating > 0 ? minRating : undefined,
				breadSesame,
				breadFluffy,
				breadCrispy,
				meatMinced,
				meatLayered,
				meatChicken,
				meatBeef,
				meatMixed,
				seasoningPure,
				seasoningSeasoned,
				hasOnions,
				spicy,
				mild,
				yoghurtSauce,
				garlicSauce
			},
			sortBy
		);

		return {
			restaurants,
			success: true
		};
	}
};
