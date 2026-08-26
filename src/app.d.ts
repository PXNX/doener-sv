// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Locale } from '$lib/i18n/messages';

declare global {
	namespace App {
		interface Locals {
			locale: Locale;
			user: {
				id: string;
				email: string;
				name: string;
				picture: string | null;
				isAdmin: boolean;
			} | null;
			session: {
				id: string;
				expiresAt: Date;
			} | null;
		}
	}
}

declare module 'virtual:stylex:runtime';

export {};
