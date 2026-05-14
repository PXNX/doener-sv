import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, users } from '$lib/server/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

function avgOf(nums: (number | null)[]): number | null {
	const valid = nums.filter((n): n is number => n !== null);
	return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

function countTrue(bools: boolean[]): number {
	return bools.filter(Boolean).length;
}

function topEntries(counts: Record<string, number>, total: number) {
	return Object.entries(counts)
		.filter(([, c]) => c > 0)
		.sort((a, b) => b[1] - a[1])
		.map(([k, c]) => ({ label: k, count: c, pct: Math.round((c / total) * 100) }));
}

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

	const reviewsData = await db
		.select({ review: doenerReviews, user: users })
		.from(doenerReviews)
		.innerJoin(users, eq(doenerReviews.userId, users.id))
		.where(eq(doenerReviews.restaurantId, restaurantId))
		.orderBy(desc(doenerReviews.createdAt));

	const reviews = reviewsData.map(({ review, user }) => ({
		id: review.id,
		meatRating: review.meatRating,
		breadRating: review.breadRating,
		veggiesRating: review.veggiesRating,
		sauceRating: review.sauceRating,
		overallFlavorRating: review.overallFlavorRating,
		cleanlinessRating: review.cleanlinessRating,
		overallRating:
			(review.meatRating + review.breadRating + review.veggiesRating + review.sauceRating) / 4,
		meatChicken: review.meatChicken,
		meatBeef: review.meatBeef,
		meatLamb: review.meatLamb,
		meatStyle: review.meatStyle,
		meatJuiciness: review.meatJuiciness,
		meatCrispiness: review.meatCrispiness,
		meatDryFeel: review.meatDryFeel,
		meatFatty: review.meatFatty,
		breadShape: review.breadShape,
		breadThickness: review.breadThickness,
		breadCrispiness: review.breadCrispiness,
		breadFluffy: review.breadFluffy,
		breadSesameSeeds: review.breadSesameSeeds,
		hasTomatoes: review.hasTomatoes,
		onionType: review.onionType,
		redCabbageType: review.redCabbageType,
		hasCabbage: review.hasCabbage,
		saladType: review.saladType,
		hasRucola: review.hasRucola,
		hasCorn: review.hasCorn,
		hasParsley: review.hasParsley,
		hasHerbalSauce: review.hasHerbalSauce,
		hasYoghurtSauce: review.hasYoghurtSauce,
		hasGarlicSauce: review.hasGarlicSauce,
		hasCocktailSauce: review.hasCocktailSauce,
		hasSpicySauce: review.hasSpicySauce,
		doenerSize: review.doenerSize,
		price: review.price,
		description: review.description,
		createdAt: review.createdAt.toISOString(),
		user: { id: user.id, name: user.name }
	}));

	// --- Aggregate stats ---
	const n = reviews.length;
	let aggregate = null;

	if (n > 0) {
		// Protein frequency
		const proteinCounts: Record<string, number> = { Chicken: 0, Beef: 0, Lamb: 0 };
		for (const r of reviews) {
			if (r.meatChicken) proteinCounts['Chicken']++;
			if (r.meatBeef) proteinCounts['Beef']++;
			if (r.meatLamb) proteinCounts['Lamb']++;
		}

		// Meat style
		const styleCounts: Record<string, number> = {};
		for (const r of reviews) {
			if (r.meatStyle) styleCounts[r.meatStyle] = (styleCounts[r.meatStyle] || 0) + 1;
		}

		// Bread shape
		const shapeCounts: Record<string, number> = {};
		for (const r of reviews) {
			if (r.breadShape) shapeCounts[r.breadShape] = (shapeCounts[r.breadShape] || 0) + 1;
		}

		// Sauces
		const sauceCounts: Record<string, number> = {
			Herbal: countTrue(reviews.map((r) => r.hasHerbalSauce)),
			Yoghurt: countTrue(reviews.map((r) => r.hasYoghurtSauce)),
			Garlic: countTrue(reviews.map((r) => r.hasGarlicSauce)),
			Cocktail: countTrue(reviews.map((r) => r.hasCocktailSauce)),
			Spicy: countTrue(reviews.map((r) => r.hasSpicySauce))
		};

		// Veggies
		const veggieCounts: Record<string, number> = {
			Tomatoes: countTrue(reviews.map((r) => r.hasTomatoes)),
			Cabbage: countTrue(reviews.map((r) => r.hasCabbage)),
			Rucola: countTrue(reviews.map((r) => r.hasRucola)),
			Corn: countTrue(reviews.map((r) => r.hasCorn)),
			Parsley: countTrue(reviews.map((r) => r.hasParsley))
		};

		// Size
		const sizeCounts: Record<string, number> = {};
		for (const r of reviews) {
			if (r.doenerSize) sizeCounts[r.doenerSize] = (sizeCounts[r.doenerSize] || 0) + 1;
		}

		// Prices
		const prices = reviews.map((r) => r.price).filter((p): p is number => p !== null);

		aggregate = {
			avgMeat: avgOf(reviews.map((r) => r.meatRating)),
			avgBread: avgOf(reviews.map((r) => r.breadRating)),
			avgVeggies: avgOf(reviews.map((r) => r.veggiesRating)),
			avgSauce: avgOf(reviews.map((r) => r.sauceRating)),
			avgFlavor: avgOf(reviews.map((r) => r.overallFlavorRating)),
			avgCleanliness: avgOf(reviews.map((r) => r.cleanlinessRating)),
			avgOverall: avgOf(reviews.map((r) => r.overallRating)),
			// Meat granular
			avgJuiciness: avgOf(reviews.map((r) => r.meatJuiciness)),
			avgMeatCrispiness: avgOf(reviews.map((r) => r.meatCrispiness)),
			avgDryFeel: avgOf(reviews.map((r) => r.meatDryFeel)),
			avgFatty: avgOf(reviews.map((r) => r.meatFatty)),
			// Bread granular
			avgThickness: avgOf(reviews.map((r) => r.breadThickness)),
			avgBreadCrispiness: avgOf(reviews.map((r) => r.breadCrispiness)),
			avgFluffy: avgOf(reviews.map((r) => r.breadFluffy)),
			sesamePct: Math.round((countTrue(reviews.map((r) => r.breadSesameSeeds)) / n) * 100),
			// Frequency tables
			proteins: topEntries(proteinCounts, n),
			styles: topEntries(styleCounts, n),
			shapes: topEntries(shapeCounts, n),
			sauces: topEntries(sauceCounts, n),
			veggies: topEntries(veggieCounts, n),
			sizes: topEntries(sizeCounts, n),
			// Price
			avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
			minPrice: prices.length > 0 ? Math.min(...prices) : null,
			maxPrice: prices.length > 0 ? Math.max(...prices) : null
		};
	}

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
			averageOverallRating: restaurant.averageOverallRating || 0,
			doenerImage: imageUrl
		},
		aggregate,
		reviews,
		userHasReviewed,
		user: locals.user,
		session: locals.session
	};
};
