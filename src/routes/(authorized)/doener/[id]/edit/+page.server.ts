// src/routes/doener/[id]/edit/+page.server.ts
// This is for editing a döner LISTING (not a review)
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { doenerRestaurants, files } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { superValidate, message } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { createDoenerSchema } from './schema';
import { getImageUrl, uploadFileFromForm } from '$lib/server/backblaze';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const restaurantId = Number(params.id);
	if (!Number.isInteger(restaurantId)) {
		throw error(404, 'Restaurant not found');
	}

	const restaurant = await db.query.doenerRestaurants.findFirst({
		where: eq(doenerRestaurants.id, restaurantId),
		with: {
			image: true
		}
	});

	if (!restaurant) {
		throw error(404, 'Restaurant not found');
	}

	// Only the creator or admin can edit
	if (restaurant.addedBy !== locals.user.id && !locals.user.isAdmin) {
		throw error(403, 'You do not have permission to edit this döner listing');
	}

	const form = await superValidate(
		{
			restaurantName: restaurant.name,
			latitude: restaurant.latitude,
			longitude: restaurant.longitude,
			breadShape: restaurant.breadShape ?? undefined,
			breadHasSesame: restaurant.breadHasSesame ?? false,
			breadFluffyInside: restaurant.breadFluffyInside ?? false,
			breadCrispyOutside: restaurant.breadCrispyOutside ?? false,
			meatType: restaurant.meatType ?? undefined,
			meatProtein: restaurant.meatProtein ?? undefined,
			meatSeasoning: restaurant.meatSeasoning ?? undefined,
			onionLevel: restaurant.onionLevel || null,
			krautLevel: restaurant.krautLevel || null,
			hasYoghurtSauce: restaurant.hasYoghurtSauce ?? false,
			hasGarlicSauce: restaurant.hasGarlicSauce ?? false
		},
		valibot(createDoenerSchema)
	);

	return {
		form,
		restaurant: {
			id: restaurant.id,
			name: restaurant.name,
			city: restaurant.city,
			country: restaurant.country,
			currentImageUrl: getImageUrl(restaurant.image?.id ?? null)
		},
		isAdmin: locals.user.isAdmin
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const restaurantId = Number(params.id);
		if (!Number.isInteger(restaurantId)) {
			return fail(400, { error: 'Invalid restaurant ID' });
		}

		const restaurant = await db.query.doenerRestaurants.findFirst({
			where: eq(doenerRestaurants.id, restaurantId)
		});

		if (!restaurant) {
			return fail(404, { error: 'Restaurant not found' });
		}

		if (restaurant.addedBy !== locals.user.id && !locals.user.isAdmin) {
			return fail(403, { error: 'You do not have permission to edit this döner listing' });
		}

		const form = await superValidate(request, valibot(createDoenerSchema));

		if (!form.valid) {
			return message(form, 'Please fix the validation errors', { status: 400 });
		}

		const {
			restaurantName,
			doenerImage,
			breadShape,
			breadHasSesame,
			breadFluffyInside,
			breadCrispyOutside,
			meatType,
			meatProtein,
			meatSeasoning,
			onionLevel,
			krautLevel,
			hasYoghurtSauce,
			hasGarlicSauce
		} = form.data;

		try {
			let imageFileId = restaurant.doenerImage;
			if (doenerImage) {
				const uploadResult = await uploadFileFromForm(doenerImage);

				if (!uploadResult.success) {
					return message(form, 'Failed to upload image', { status: 500 });
				}

				const fileId = randomUUID();
				await db.insert(files).values({
					id: fileId,
					key: uploadResult.key,
					fileName: doenerImage.name,
					contentType: 'image/webp',
					sizeBytes: doenerImage.size,
					uploadedBy: locals.user.id
				});

				if (restaurant.doenerImage) {
					await db.delete(files).where(eq(files.id, restaurant.doenerImage));
				}

				imageFileId = fileId;
			}

			await db
				.update(doenerRestaurants)
				.set({
					name: restaurantName,
					doenerImage: imageFileId,
					breadShape,
					breadHasSesame,
					breadFluffyInside,
					breadCrispyOutside,
					meatType,
					meatProtein,
					meatSeasoning,
					onionLevel: onionLevel || null,
					krautLevel: krautLevel || null,
					hasYoghurtSauce,
					hasGarlicSauce,
					updatedAt: new Date()
				})
				.where(eq(doenerRestaurants.id, restaurantId));

			throw redirect(303, `/doener/${restaurantId}`);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Error updating döner listing:', err);
			return message(form, 'Failed to update döner listing. Please try again.', { status: 500 });
		}
	}
};
