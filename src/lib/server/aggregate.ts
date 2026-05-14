import { db } from './db';
import { doenerReviews } from './schema';
import { eq, desc } from 'drizzle-orm';
import { getImageUrl } from './backblaze';

function countTrue(bools: boolean[]): number {
    return bools.filter(Boolean).length;
}

function getMostCommon(counts: Record<string, number>): string | null {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function topEntries(
    counts: Record<string, number>,
    total: number
): { label: string; pct: number }[] {
    return Object.entries(counts)
        .filter(([, c]) => c > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([k, c]) => ({ label: k, pct: Math.round((c / total) * 100) }));
}

const EMPTY_AGGREGATE = {
    averageRating: null as number | null,
    avgPrice: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    topProteins: [] as { label: string; pct: number }[],
    topStyles: [] as { label: string; pct: number }[],
    topSauces: [] as { label: string; pct: number }[],
    topVeggies: [] as { label: string; pct: number }[],
    mostCommonBreadSesame: false,
    mostCommonBreadFluffy: false,
    mostCommonBreadCrispy: false,
    mostCommonMeatType: null as string | null,
    mostCommonMeatProtein: null as string | null,
    mostCommonMeatSeasoning: null as string | null,
    mostCommonYoghurtSauce: false,
    mostCommonGarlicSauce: false,
    mostCommonHerbalSauce: false,
    mostCommonCocktailSauce: false,
    mostCommonSpicySauce: false,
    latestReviewImage: null as string | null,
    latestReviewNotes: null as string | null
};

export type AggregateData = typeof EMPTY_AGGREGATE;

export async function aggregateRestaurantData(restaurantId: number): Promise<AggregateData> {
    const reviews = await db.query.doenerReviews.findMany({
        where: eq(doenerReviews.restaurantId, restaurantId),
        orderBy: desc(doenerReviews.createdAt)
    });

    if (reviews.length === 0) return { ...EMPTY_AGGREGATE };

    const n = reviews.length;

    // Proteins
    const proteinCounts: Record<string, number> = {};
    for (const r of reviews) {
        if (r.meatChicken) proteinCounts['Chicken'] = (proteinCounts['Chicken'] || 0) + 1;
        if (r.meatBeef) proteinCounts['Beef'] = (proteinCounts['Beef'] || 0) + 1;
        if (r.meatLamb) proteinCounts['Lamb'] = (proteinCounts['Lamb'] || 0) + 1;
    }

    // Meat style
    const styleCounts: Record<string, number> = {};
    for (const r of reviews) {
        if (r.meatStyle) styleCounts[r.meatStyle] = (styleCounts[r.meatStyle] || 0) + 1;
    }

    // Sauces
    const herbalCount = countTrue(reviews.map((r) => r.hasHerbalSauce));
    const yoghurtCount = countTrue(reviews.map((r) => r.hasYoghurtSauce));
    const garlicCount = countTrue(reviews.map((r) => r.hasGarlicSauce));
    const cocktailCount = countTrue(reviews.map((r) => r.hasCocktailSauce));
    const spicyCount = countTrue(reviews.map((r) => r.hasSpicySauce));
    const sauceCounts: Record<string, number> = {
        Herbal: herbalCount,
        Yoghurt: yoghurtCount,
        Garlic: garlicCount,
        Cocktail: cocktailCount,
        Spicy: spicyCount
    };

    // Veggies
    const veggieCounts: Record<string, number> = {
        Tomatoes: countTrue(reviews.map((r) => r.hasTomatoes)),
        Cabbage: countTrue(reviews.map((r) => r.hasCabbage)),
        Rucola: countTrue(reviews.map((r) => r.hasRucola)),
        Corn: countTrue(reviews.map((r) => r.hasCorn)),
        Parsley: countTrue(reviews.map((r) => r.hasParsley))
    };

    // Bread
    const breadSesameCount = countTrue(reviews.map((r) => r.breadSesameSeeds));
    const breadFluffyCount = reviews.filter((r) => (r.breadFluffy ?? 0) >= 3).length;
    const breadCrispyCount = reviews.filter((r) => (r.breadCrispiness ?? 0) >= 3).length;

    // Seasoning — not tracked per-review in granular form anymore, return null
    const meatSeasoningCount: Record<string, number> = {};

    // Price
    const prices = reviews.map((r) => r.price).filter((p): p is number => p !== null);

    // Overall rating
    const avgRating =
        reviews.reduce(
            (sum, r) => sum + (r.meatRating + r.breadRating + r.veggiesRating + r.sauceRating) / 4,
            0
        ) / n;

    // Latest review image
    const latestWithImage = reviews.find((r) => r.reviewImage);
    let latestImageUrl: string | null = null;
    if (latestWithImage?.reviewImage) {
        latestImageUrl = await getImageUrl(latestWithImage.reviewImage);
    }

    return {
        averageRating: avgRating > 0 ? avgRating : null,
        avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        topProteins: topEntries(proteinCounts, n),
        topStyles: topEntries(styleCounts, n),
        topSauces: topEntries(sauceCounts, n),
        topVeggies: topEntries(veggieCounts, n),
        mostCommonBreadSesame: breadSesameCount > n / 2,
        mostCommonBreadFluffy: breadFluffyCount > n / 2,
        mostCommonBreadCrispy: breadCrispyCount > n / 2,
        mostCommonMeatType: getMostCommon(styleCounts),
        mostCommonMeatProtein: getMostCommon(proteinCounts),
        mostCommonMeatSeasoning: getMostCommon(meatSeasoningCount),
        mostCommonYoghurtSauce: yoghurtCount > n / 2,
        mostCommonGarlicSauce: garlicCount > n / 2,
        mostCommonHerbalSauce: herbalCount > n / 2,
        mostCommonCocktailSauce: cocktailCount > n / 2,
        mostCommonSpicySauce: spicyCount > n / 2,
        latestReviewImage: latestImageUrl,
        latestReviewNotes: reviews[0]?.description || null
    };
}
