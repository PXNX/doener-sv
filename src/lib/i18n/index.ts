import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import {
	resolveLocale,
	translate,
	type Locale,
	type TranslationKey,
	type TranslationValues
} from './messages';

export const locale = writable<Locale>('en');

export const t = derived(locale, ($locale) => {
	return (key: TranslationKey, values?: TranslationValues) => translate($locale, key, values);
});

export function setLocale(value: Locale): void {
	locale.set(value);
}

export function setDeviceLocale(): void {
	if (!browser) return;
	locale.set(resolveLocale(navigator.languages));
}
