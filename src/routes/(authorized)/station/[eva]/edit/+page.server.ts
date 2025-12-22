import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { stations, pendingEdits } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login?next=${encodeURIComponent(url.pathname)}`);
	}

	const eva = parseInt(params.eva);
	if (isNaN(eva)) {
		throw error(400, 'Invalid station ID');
	}

	const dbStation = await db.select().from(stations).where(eq(stations.eva, eva)).limit(1);
	if (!dbStation[0]) {
		throw error(404, 'Station not found');
	}

	const station = dbStation[0];

	// Check if user has pending edits for this station
	const userPendingEdits = await db
		.select()
		.from(pendingEdits)
		.where(
			and(
				eq(pendingEdits.stationEva, eva),
				eq(pendingEdits.userId, locals.user.id),
				eq(pendingEdits.status, 'pending')
			)
		)
		.limit(1);

	const hasPendingEdit = userPendingEdits.length > 0;
	const pendingEdit = hasPendingEdit ? userPendingEdits[0] : null;

	// If there's a pending edit, use its values; otherwise use station values
	return {
		station: {
			eva: station.eva,
			name: station.name,
			city: station.city,
			country: station.country,
			has_warm_sleep: pendingEdit?.hasWarmSleep ?? station.hasWarmSleep ?? false,
			sleep_notes: pendingEdit?.sleepNotes ?? station.sleepNotes ?? '',
			has_outlets: pendingEdit?.hasOutlets ?? station.hasOutlets ?? false,
			outlet_notes: pendingEdit?.outletNotes ?? station.outletNotes ?? '',
			has_toilets: pendingEdit?.hasToilets ?? station.hasToilets ?? false,
			toilet_notes: pendingEdit?.toiletNotes ?? station.toiletNotes ?? '',
			toilets_open_at_night: pendingEdit?.toiletsOpenAtNight ?? station.toiletsOpenAtNight ?? false,
			is_open_24h: pendingEdit?.isOpen24h ?? station.isOpen24h ?? false,
			opening_hours: pendingEdit?.openingHours ?? station.openingHours ?? '',
			latitude: station.latitude,
			longitude: station.longitude,
			additional_info: pendingEdit?.additionalInfo ?? station.additionalInfo ?? ''
		},
		originalStation: {
			has_warm_sleep: station.hasWarmSleep ?? false,
			sleep_notes: station.sleepNotes ?? '',
			has_outlets: station.hasOutlets ?? false,
			outlet_notes: station.outletNotes ?? '',
			has_toilets: station.hasToilets ?? false,
			toilet_notes: station.toiletNotes ?? '',
			toilets_open_at_night: station.toiletsOpenAtNight ?? false,
			is_open_24h: station.isOpen24h ?? false,
			opening_hours: station.openingHours ?? '',
			additional_info: station.additionalInfo ?? ''
		},
		hasPendingEdit,
		pendingEditId: pendingEdit?.id ?? null,
		isAdmin: locals.user.isAdmin
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'You must be logged in to edit stations' });
		}

		const eva = parseInt(params.eva);
		const formData = await request.formData();

		const editData = {
			hasWarmSleep: formData.get('has_warm_sleep') === 'on',
			sleepNotes: formData.get('sleep_notes')?.toString() || null,
			hasOutlets: formData.get('has_outlets') === 'on',
			outletNotes: formData.get('outlet_notes')?.toString() || null,
			hasToilets: formData.get('has_toilets') === 'on',
			toiletNotes: formData.get('toilet_notes')?.toString() || null,
			toiletsOpenAtNight: formData.get('toilets_open_at_night') === 'on',
			isOpen24h: formData.get('is_open_24h') === 'on',
			openingHours: formData.get('opening_hours')?.toString() || null,
			additionalInfo: formData.get('additional_info')?.toString() || null
		};

		try {
			// If user is admin, apply changes directly
			if (locals.user.isAdmin) {
				await db.update(stations).set(editData).where(eq(stations.eva, eva));
				throw redirect(303, `/station/${eva}`);
			}

			// Check if user already has a pending edit for this station
			const existingPendingEdit = await db
				.select()
				.from(pendingEdits)
				.where(
					and(
						eq(pendingEdits.stationEva, eva),
						eq(pendingEdits.userId, locals.user.id),
						eq(pendingEdits.status, 'pending')
					)
				)
				.limit(1);

			if (existingPendingEdit.length > 0) {
				// Update existing pending edit
				await db
					.update(pendingEdits)
					.set(editData)
					.where(eq(pendingEdits.id, existingPendingEdit[0].id));
			} else {
				// Create new pending edit
				await db.insert(pendingEdits).values({
					stationEva: eva,
					userId: locals.user.id,
					...editData
				});
			}

			throw redirect(303, `/station/${eva}?submitted=true`);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Failed to submit edit:', err);
			return fail(500, { error: 'Failed to submit edit. Please try again.' });
		}
	}
};
