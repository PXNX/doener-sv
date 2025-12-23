import { redirect, type RequestEvent } from '@sveltejs/kit';

export const load = async (event: RequestEvent) => {
	//await parent();
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/auth/login?next=' + event.url.pathname);
	}
};
