import { describe, expect, it } from 'vitest';
import { resolveLocale, translate } from '../src/lib/i18n/messages';

describe('locale resolution', () => {
	it('selects German for a German Accept-Language header', () => {
		expect(resolveLocale('de-DE,de;q=0.9,en;q=0.8')).toBe('de');
	});

	it('selects German when it appears in the device language list', () => {
		expect(resolveLocale(['fr-FR', 'de-AT', 'en-US'])).toBe('de');
	});

	it('falls back to English for unsupported device languages', () => {
		expect(resolveLocale(['fr-FR', 'it-IT'])).toBe('en');
	});
});

describe('translations', () => {
	it('interpolates localized values', () => {
		expect(translate('de', 'search.rankedBy', { ranking: 'Gesamtbewertung' })).toBe(
			'Sortiert nach Gesamtbewertung'
		);
	});

	it('returns English copy when English is selected', () => {
		expect(translate('en', 'search.find')).toBe('Find döner');
	});
});
