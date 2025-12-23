// src/routes/my-reviews/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { doenerReviews, doenerRestaurants } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

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
			// Get image from restaurant (not review)
			const imageUrl = await getImageUrl(restaurant.doenerImage);

			return {
				id: review.id,
				restaurantId: review.restaurantId,
				rating: review.rating,
				description: review.description,
				createdAt: review.createdAt.toISOString(),
				restaurant: {
					id: restaurant.id,
					name: restaurant.name,
					city: restaurant.city,
					country: restaurant.country,
					// Include döner characteristics from restaurant
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
					imageUrl
				}
			};
		})
	);

	return {
		reviews
	};
};
