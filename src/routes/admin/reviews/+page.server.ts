// src/routes/admin/reviews/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerReviews, doenerRestaurants, users, files } from '$lib/server/schema';
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

	if (!locals.user.isAdmin) {
		throw error(403, 'Admin access required');
	}

	// Fetch all reviews with restaurant and user info
	const allReviews = await db
		.select({
			review: doenerReviews,
			restaurant: doenerRestaurants,
			user: users
		})
		.from(doenerReviews)
		.innerJoin(doenerRestaurants, eq(doenerReviews.restaurantId, doenerRestaurants.id))
		.innerJoin(users, eq(doenerReviews.userId, users.id))
		.orderBy(desc(doenerReviews.createdAt))
		.limit(100);

	const reviews = await Promise.all(
		allReviews.map(async ({ review, restaurant, user }) => {
			const imageUrl = await getImageUrl(review.doenerImage);

			return {
				id: review.id,
				breadHasSesame: review.breadHasSesame,
				breadFluffyInside: review.breadFluffyInside,
				breadCrispyOutside: review.breadCrispyOutside,
				meatType: review.meatType,
				meatProtein: review.meatProtein,
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
				},
				user: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			};
		})
	);

	return {
		reviews
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const reviewId = formData.get('reviewId')?.toString();

		if (!reviewId) {
			return { success: false, error: 'Review ID required' };
		}

		// Get review to update restaurant stats
		const review = await db.query.doenerReviews.findFirst({
			where: eq(doenerReviews.id, reviewId)
		});

		if (!review) {
			return { success: false, error: 'Review not found' };
		}

		// Delete the review
		await db.delete(doenerReviews).where(eq(doenerReviews.id, reviewId));

		// Update restaurant stats
		const remainingReviews = await db.query.doenerReviews.findMany({
			where: eq(doenerReviews.restaurantId, review.restaurantId)
		});

		const avgRating =
			remainingReviews.length > 0
				? remainingReviews.reduce((sum, r) => sum + r.overallRating, 0) / remainingReviews.length
				: 0;

		await db
			.update(doenerRestaurants)
			.set({
				reviewCount: remainingReviews.length,
				averageRating: avgRating > 0 ? avgRating : null,
				updatedAt: new Date()
			})
			.where(eq(doenerRestaurants.id, review.restaurantId));

		return { success: true };
	}
};
