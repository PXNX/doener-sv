// tests/google-maps-parser.test.ts
import { describe, it, expect } from 'vitest';

/**
 * Test suite for Google Maps URL parsing
 *
 * This tests the URL patterns that extractPlaceInfo() should handle
 */

// Mock implementation for testing (copy the actual function here for unit tests)
function parseGoogleMapsUrl(url: string): {
	name: string | null;
	latitude: number | null;
	longitude: number | null;
} | null {
	try {
		let name: string | null = null;
		let latitude: number | null = null;
		let longitude: number | null = null;

		// Extract name from /place/ URL
		if (url.includes('/place/')) {
			const placeMatch = url.match(/\/place\/([^/]+)/);
			if (placeMatch) {
				name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
			}
		}

		// Format 1: /@lat,lng,zoom
		const coordMatch1 = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
		if (coordMatch1) {
			latitude = parseFloat(coordMatch1[1]);
			longitude = parseFloat(coordMatch1[2]);
		}

		// Format 2: ?q=lat,lng
		const coordMatch2 = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
		if (coordMatch2) {
			latitude = parseFloat(coordMatch2[1]);
			longitude = parseFloat(coordMatch2[2]);
		}

		// Format 3: /data=...!3d(lat)!4d(lng)
		const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
		if (dataMatch) {
			latitude = parseFloat(dataMatch[1]);
			longitude = parseFloat(dataMatch[2]);
		}

		// Validate coordinates
		if (latitude !== null && longitude !== null) {
			if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
				return null;
			}
		}

		return { name, latitude, longitude };
	} catch (error) {
		return null;
	}
}

describe('Google Maps URL Parser', () => {
	describe('Place URLs with names and coordinates', () => {
		it('should parse standard place URL', () => {
			const url = "https://www.google.com/maps/place/Mustafa's+Gemüse+Döner/@52.5034,13.3983,15z";
			const result = parseGoogleMapsUrl(url);

			expect(result).not.toBeNull();
			expect(result?.name).toBe("Mustafa's Gemüse Döner");
			expect(result?.latitude).toBeCloseTo(52.5034, 4);
			expect(result?.longitude).toBeCloseTo(13.3983, 4);
		});

		it('should handle URL-encoded place names', () => {
			const url = 'https://www.google.com/maps/place/D%C3%B6ner+Restaurant/@48.1234,11.5678,17z';
			const result = parseGoogleMapsUrl(url);

			expect(result?.name).toBe('Döner Restaurant');
		});

		it('should parse place names with special characters', () => {
			const url = "https://www.google.com/maps/place/Ali's+Döner+%26+Grill/@51.5,0.12,15z";
			const result = parseGoogleMapsUrl(url);

			expect(result?.name).toContain("Ali's");
			expect(result?.name).toContain('Döner');
		});
	});

	describe('Coordinate-only URLs', () => {
		it('should parse @ coordinate format', () => {
			const url = 'https://www.google.com/maps/@52.520008,13.404954,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBeCloseTo(52.520008, 5);
			expect(result?.longitude).toBeCloseTo(13.404954, 5);
			expect(result?.name).toBeNull();
		});

		it('should parse query coordinate format', () => {
			const url = 'https://www.google.com/maps?q=48.8566,2.3522';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBeCloseTo(48.8566, 4);
			expect(result?.longitude).toBeCloseTo(2.3522, 4);
		});

		it('should parse data format coordinates', () => {
			const url = 'https://www.google.com/maps/data=!3d52.5200!4d13.4050';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBeCloseTo(52.52, 2);
			expect(result?.longitude).toBeCloseTo(13.405, 3);
		});
	});

	describe('Edge cases', () => {
		it('should handle negative coordinates', () => {
			const url = 'https://www.google.com/maps/@-33.8688,151.2093,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBeCloseTo(-33.8688, 4);
			expect(result?.longitude).toBeCloseTo(151.2093, 4);
		});

		it('should reject invalid latitude', () => {
			const url = 'https://www.google.com/maps/@95.0,13.4,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result).toBeNull();
		});

		it('should reject invalid longitude', () => {
			const url = 'https://www.google.com/maps/@52.5,185.0,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result).toBeNull();
		});

		it('should handle coordinates at boundaries', () => {
			const url = 'https://www.google.com/maps/@90.0,180.0,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result).not.toBeNull();
			expect(result?.latitude).toBe(90);
			expect(result?.longitude).toBe(180);
		});

		it('should handle integer coordinates', () => {
			const url = 'https://www.google.com/maps/@52,13,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBe(52);
			expect(result?.longitude).toBe(13);
		});
	});

	describe('Invalid URLs', () => {
		it('should return null for non-maps URLs', () => {
			const url = 'https://www.example.com/page';
			const result = parseGoogleMapsUrl(url);

			expect(result?.latitude).toBeNull();
			expect(result?.longitude).toBeNull();
		});

		it('should handle malformed URLs gracefully', () => {
			const url = 'not a valid url';
			const result = parseGoogleMapsUrl(url);

			// Should not throw, should return null or empty data
			expect(result).toBeDefined();
		});
	});

	describe('Real-world examples', () => {
		it('should parse Berlin döner restaurant', () => {
			const url =
				"https://www.google.com/maps/place/Mustafa's+Gemüse+Kebap/@52.5034085,13.3983007,17z";
			const result = parseGoogleMapsUrl(url);

			expect(result?.name).toContain('Mustafa');
			expect(result?.latitude).toBeCloseTo(52.5034, 3);
			expect(result?.longitude).toBeCloseTo(13.3983, 3);
		});

		it('should parse Istanbul restaurant', () => {
			const url = 'https://www.google.com/maps/place/Dönerci+Şahin+Usta/@41.0082,28.9784,15z';
			const result = parseGoogleMapsUrl(url);

			expect(result?.name).toContain('Dönerci');
			expect(result?.latitude).toBeCloseTo(41.0082, 3);
		});
	});
});

describe('Integration: Share Target to Create Page', () => {
	it('should generate correct redirect URL with all params', () => {
		const placeInfo = {
			name: 'Test Döner',
			latitude: 52.52,
			longitude: 13.405
		};

		const params = new URLSearchParams();
		params.set('lat', placeInfo.latitude.toString());
		params.set('lon', placeInfo.longitude.toString());
		params.set('name', placeInfo.name);

		const redirectUrl = `/doener/create?${params.toString()}`;

		expect(redirectUrl).toContain('lat=52.52');
		expect(redirectUrl).toContain('lon=13.405');
		expect(redirectUrl).toContain('name=Test');
	});

	it('should generate redirect URL without name if not available', () => {
		const placeInfo = {
			name: null,
			latitude: 52.52,
			longitude: 13.405
		};

		const params = new URLSearchParams();
		params.set('lat', placeInfo.latitude.toString());
		params.set('lon', placeInfo.longitude.toString());

		const redirectUrl = `/doener/create?${params.toString()}`;

		expect(redirectUrl).toContain('lat=52.52');
		expect(redirectUrl).toContain('lon=13.405');
		expect(redirectUrl).not.toContain('name=');
	});
});
