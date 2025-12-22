// src/routes/doener/[id]/edit/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, doenerReviews, files } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createDoenerReviewSchema } from '../../../../doener/create/schema';
import { getSignedDownloadUrl, uploadFileFromForm } from '$lib/server/backblaze';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const reviewId = params.id;

	// Get the review
	const review = await db.query.doenerReviews.findFirst({
		where: eq(doenerReviews.id, reviewId),
		with: {
			restaurant: true,
			image: true
		}
	});

	if (!review) {
		throw error(404, 'Review not found');
	}

	// Check if user owns this review or is admin
	if (review.userId !== locals.user.id && !locals.user.isAdmin) {
		throw error(403, 'You do not have permission to edit this review');
	}

	// Convert review to form data
	const form = await superValidate(
		{
			restaurantName: review.restaurant.name,
			latitude: review.restaurant.latitude,
			longitude: review.restaurant.longitude,
			breadShape: review.breadShape,
			breadHasSesame: review.breadHasSesame,
			breadFluffyInside: review.breadFluffyInside,
			breadCrispyOutside: review.breadCrispyOutside,
			meatType: review.meatType,
			meatProtein: review.meatProtein,
			meatSeasoning: review.meatSeasoning,
			hasOnions: review.hasOnions,
			krautLevel: review.krautLevel,
			hasYoghurtSauce: review.hasYoghurtSauce,
			hasGarlicSauce: review.hasGarlicSauce,
			overallRating: review.overallRating,
			notes: review.notes || ''
		},
		valibot(createDoenerReviewSchema)
	);

	return {
		form,
		review: {
			id: review.id,
			restaurantId: review.restaurantId,
			restaurantName: review.restaurant.name,
			city: review.restaurant.city,
			country: review.restaurant.country,
			currentImageUrl: review.image ? await getSignedDownloadUrl(review.image.key) : null
		},
		isAdmin: locals.user.isAdmin
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const reviewId = params.id;

		// Get the review
		const review = await db.query.doenerReviews.findFirst({
			where: eq(doenerReviews.id, reviewId)
		});

		if (!review) {
			return fail(404, { error: 'Review not found' });
		}

		// Check permissions
		if (review.userId !== locals.user.id && !locals.user.isAdmin) {
			return fail(403, { error: 'You do not have permission to edit this review' });
		}

		const form = await superValidate(request, valibot(createDoenerReviewSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const {
			doenerImage,
			breadShape,
			breadHasSesame,
			breadFluffyInside,
			breadCrispyOutside,
			meatType,
			meatProtein,
			meatSeasoning,
			hasOnions,
			krautLevel,
			hasYoghurtSauce,
			hasGarlicSauce,
			overallRating,
			notes
		} = form.data;

		try {
			// Handle image upload if new image provided
			let imageFileId = review.doenerImage;
			if (doenerImage) {
				const uploadResult = await uploadFileFromForm(doenerImage);

				if (!uploadResult.success) {
					return message(form, 'Failed to upload image', { status: 500 });
				}

				// Create file record in database
				const fileId = randomUUID();
				await db.insert(files).values({
					id: fileId,
					key: uploadResult.key,
					fileName: doenerImage.name,
					contentType: 'image/webp',
					sizeBytes: doenerImage.size,
					uploadedBy: locals.user.id
				});

				// Delete old image file if exists
				if (review.doenerImage) {
					await db.delete(files).where(eq(files.id, review.doenerImage));
				}

				imageFileId = fileId;
			}

			// Update review
			await db
				.update(doenerReviews)
				.set({
					doenerImage: imageFileId,
					breadShape,
					breadHasSesame,
					breadFluffyInside,
					breadCrispyOutside,
					meatType,
					meatProtein,
					meatSeasoning,
					hasOnions,
					krautLevel,
					hasYoghurtSauce,
					hasGarlicSauce,
					overallRating,
					notes: notes || null,
					updatedAt: new Date()
				})
				.where(eq(doenerReviews.id, reviewId));

			// Recalculate restaurant stats
			const reviews = await db.query.doenerReviews.findMany({
				where: eq(doenerReviews.restaurantId, review.restaurantId)
			});

			const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;

			await db
				.update(doenerRestaurants)
				.set({
					reviewCount: reviews.length,
					averageRating: avgRating,
					updatedAt: new Date()
				})
				.where(eq(doenerRestaurants.id, review.restaurantId));

			// Redirect to restaurant page
			throw redirect(303, `/doener/${review.restaurantId}`);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Error updating review:', err);
			return message(form, 'Failed to update review. Please try again.', { status: 500 });
		}
	}
};
