import { validateSessionToken } from '$lib/server/auth';
import { resolveLocale } from '$lib/i18n/messages';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.locale = resolveLocale(event.request.headers.get('accept-language'));

	const token = event.cookies.get('session');

	if (token) {
		const result = await validateSessionToken(token);
		if (result) {
			event.locals.user = result.user;
			event.locals.session = result.session;
		}
	}

	if (!event.locals.user) {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
