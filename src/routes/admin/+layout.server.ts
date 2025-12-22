import { error, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, `/auth/login`);
	}

	if (!locals.user.isAdmin) {
		throw error(403, 'Admin access required');
	}
};
