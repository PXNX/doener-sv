import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { getImageUrl, uploadFileFromForm } from '$lib/server/backblaze';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createReviewSchema } from './schema';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ params, locals }) => {
	const account = locals.user!;
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

	const existingReview = await db.query.doenerReviews.findFirst({
		where: and(eq(doenerReviews.restaurantId, restaurantId), eq(doenerReviews.userId, account.id))
	});

	if (existingReview) {
		throw redirect(303, `/doener/${restaurantId}`);
	}

	const imageUrl = await getImageUrl(restaurant.doenerImage);
	const form = await superValidate(valibot(createReviewSchema));

	return {
		restaurant: {
			id: restaurant.id,
			name: restaurant.name,
			city: restaurant.city,
			country: restaurant.country,
			doenerImage: imageUrl
		},
		form
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const account = locals.user!;
		const restaurantId = parseInt(params.id);

		if (isNaN(restaurantId)) {
			return fail(400, { error: 'Invalid restaurant ID' });
		}

		const restaurant = await db.query.doenerRestaurants.findFirst({
			where: eq(doenerRestaurants.id, restaurantId)
		});

		if (!restaurant) {
			return fail(404, { error: 'Restaurant not found' });
		}

		const existingReview = await db.query.doenerReviews.findFirst({
			where: and(
				eq(doenerReviews.restaurantId, restaurantId),
				eq(doenerReviews.userId, account.id)
			)
		});

		if (existingReview) {
			return fail(400, { error: 'You have already reviewed this restaurant' });
		}

		const form = await superValidate(request, valibot(createReviewSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const d = form.data;

		// Handle image upload
		let imageFileId: string | null = null;
		if (d.reviewImage) {
			const uploadResult = await uploadFileFromForm(d.reviewImage);
			if (!uploadResult.success) {
				return message(form, 'Failed to upload image', { status: 500 });
			}
			const fileId = randomUUID();
			await db.insert(files).values({
				id: fileId,
				key: uploadResult.key,
				fileName: d.reviewImage.name,
				contentType: 'image/webp',
				sizeBytes: d.reviewImage.size,
				uploadedBy: account.id
			});
			imageFileId = fileId;
		}

		await db.insert(doenerReviews).values({
			restaurantId,
			userId: account.id,
			reviewImage: imageFileId,
			// Meat
			meatChicken: d.meatChicken,
			meatBeef: d.meatBeef,
			meatLamb: d.meatLamb,
			meatStyle: d.meatStyle,
			meatJuiciness: d.meatJuiciness,
			meatCrispiness: d.meatCrispiness,
			meatDryFeel: d.meatDryFeel,
			meatFatty: d.meatFatty,
			meatRating: d.meatRating,
			// Bread
			breadShape: d.breadShape,
			breadThickness: d.breadThickness,
			breadCrispiness: d.breadCrispiness,
			breadFluffy: d.breadFluffy,
			breadSesameSeeds: d.breadSesameSeeds,
			breadRating: d.breadRating,
			// Veggies
			hasTomatoes: d.hasTomatoes,
			onionType: d.onionType,
			redCabbageType: d.redCabbageType,
			hasCabbage: d.hasCabbage,
			saladType: d.saladType,
			hasRucola: d.hasRucola,
			hasCorn: d.hasCorn,
			hasParsley: d.hasParsley,
			veggiesRating: d.veggiesRating,
			// Sauces
			hasHerbalSauce: d.hasHerbalSauce,
			hasYoghurtSauce: d.hasYoghurtSauce,
			hasGarlicSauce: d.hasGarlicSauce,
			hasCocktailSauce: d.hasCocktailSauce,
			hasSpicySauce: d.hasSpicySauce,
			sauceRating: d.sauceRating,
			// Overall
			overallFlavorRating: d.overallFlavorRating,
			doenerSize: d.doenerSize,
			price: d.price,
			cleanlinessRating: d.cleanlinessRating,
			description: d.description || ''
		});

		// Update restaurant aggregate stats
		const allReviews = await db.query.doenerReviews.findMany({
			where: eq(doenerReviews.restaurantId, restaurantId)
		});

		const avgMeat = allReviews.reduce((s, r) => s + r.meatRating, 0) / allReviews.length;
		const avgBread = allReviews.reduce((s, r) => s + r.breadRating, 0) / allReviews.length;
		const avgVeggies = allReviews.reduce((s, r) => s + r.veggiesRating, 0) / allReviews.length;
		const avgSauce = allReviews.reduce((s, r) => s + r.sauceRating, 0) / allReviews.length;
		const avgOverall = (avgMeat + avgBread + avgVeggies + avgSauce) / 4;

		await db
			.update(doenerRestaurants)
			.set({
				reviewCount: allReviews.length,
				averageMeatRating: avgMeat,
				averageBreadRating: avgBread,
				averageVeggiesRating: avgVeggies,
				averageSauceRating: avgSauce,
				averageOverallRating: avgOverall,
				updatedAt: new Date()
			})
			.where(eq(doenerRestaurants.id, restaurantId));

		redirect(303, `/doener/${restaurantId}`);
	}
};
