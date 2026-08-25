import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login`);
	}

	if (!locals.user.isAdmin) {
		throw error(403, 'Admin access required');
	}
};
