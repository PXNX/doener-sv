// src/routes/admin/doener/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, users, files } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';
import { getImageUrl } from '$lib/server/backblaze';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/');
	}

	// Fetch all döner listings with user info
	const allRestaurants = await db
		.select({
			restaurant: doenerRestaurants,
			user: users
		})
		.from(doenerRestaurants)
		.innerJoin(users, eq(doenerRestaurants.addedBy, users.id))
		.orderBy(desc(doenerRestaurants.createdAt))
		.limit(100);

	const restaurants = await Promise.all(
		allRestaurants.map(async ({ restaurant, user }) => {
			const imageUrl = await getImageUrl(restaurant.doenerImage);

			return {
				id: restaurant.id,
				name: restaurant.name,
				city: restaurant.city,
				country: restaurant.country,
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
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
				reviewCount: restaurant.reviewCount,
				averageRating: restaurant.averageRating,
				createdAt: restaurant.createdAt.toISOString(),
				updatedAt: restaurant.updatedAt.toISOString(),
				imageUrl,
				addedBy: {
					id: user.id,
					name: user.name,
					email: user.email
				}
			};
		})
	);

	return {
		restaurants
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		const formData = await request.formData();
		const restaurantId = formData.get('restaurantId')?.toString();

		if (!restaurantId) {
			return fail(400, { error: 'Restaurant ID required' });
		}

		// Get restaurant to delete associated image
		const restaurant = await db.query.doenerRestaurants.findFirst({
			where: eq(doenerRestaurants.id, restaurantId)
		});

		if (!restaurant) {
			return fail(404, { error: 'Restaurant not found' });
		}

		// Delete associated image if exists
		if (restaurant.doenerImage) {
			await db.delete(files).where(eq(files.id, restaurant.doenerImage));
		}

		// Delete the restaurant (reviews will be cascade deleted)
		await db.delete(doenerRestaurants).where(eq(doenerRestaurants.id, restaurantId));

		return { success: true };
	}
};
