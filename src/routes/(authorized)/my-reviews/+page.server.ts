// src/routes/my-reviews/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { doenerReviews, doenerRestaurants, files } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get signed URL for a file
 */
async function getImageUrl(fileId: string | null): Promise<string | null> {
	if (!fileId) return null;

	const file = await db.query.files.findFirst({
		where: eq(files.id, fileId)
	});

	if (!file) return null;

	try {
		return await getSignedDownloadUrl(file.key);
	} catch {
		return `/api/files/${file.key}`;
	}
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	// Fetch user's reviews with restaurant info
	const userReviews = await db
		.select({
			review: doenerReviews,
			restaurant: doenerRestaurants
		})
		.from(doenerReviews)
		.innerJoin(doenerRestaurants, eq(doenerReviews.restaurantId, doenerRestaurants.id))
		.where(eq(doenerReviews.userId, locals.user.id))
		.orderBy(desc(doenerReviews.createdAt));

	const reviews = await Promise.all(
		userReviews.map(async ({ review, restaurant }) => {
			const imageUrl = await getImageUrl(review.doenerImage);

			return {
				id: review.id,
				restaurantId: review.restaurantId,
				breadHasSesame: review.breadHasSesame,
				breadFluffyInside: review.breadFluffyInside,
				breadCrispyOutside: review.breadCrispyOutside,
				meatType: review.meatType,
				meatProtein: review.meatProtein,
				meatSeasoning: review.meatSeasoning,
				hasOnions: review.hasOnions,
				spiceLevel: review.spiceLevel,
				hasYoghurtSauce: review.hasYoghurtSauce,
				hasGarlicSauce: review.hasGarlicSauce,
				overallRating: review.overallRating,
				notes: review.notes,
				createdAt: review.createdAt.toISOString(),
				imageUrl,
				restaurant: {
					id: restaurant.id,
					name: restaurant.name,
					city: restaurant.city,
					country: restaurant.country
				}
			};
		})
	);

	return {
		reviews
	};
};
