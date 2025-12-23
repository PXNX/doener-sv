// src/routes/doener/create/schema.ts
// Schema for creating a new döner listing
import * as v from 'valibot';

// Regex patterns
const alphanumericSentencePattern = /^[a-zA-Z0-9\s.,!?;:()\-'"äöüÄÖÜß]+$/;

export const createDoenerSchema = v.object({
	// Restaurant info
	restaurantName: v.pipe(
		v.string(),
		v.minLength(2, 'Restaurant name must be at least 2 characters'),
		v.maxLength(50, 'Restaurant name must be at most 50 characters'),
		v.regex(alphanumericSentencePattern, 'Only alphanumeric and sentence characters allowed')
	),
	latitude: v.pipe(
		v.number(),
		v.minValue(-90, 'Invalid latitude'),
		v.maxValue(90, 'Invalid latitude')
	),
	longitude: v.pipe(
		v.number(),
		v.minValue(-180, 'Invalid longitude'),
		v.maxValue(180, 'Invalid longitude')
	),

	// Döner image
	doenerImage: v.optional(
		v.pipe(
			v.file(),
			v.mimeType(
				['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
				'Image must be JPEG, PNG, WebP, or HEIC'
			),
			v.maxSize(10 * 1024 * 1024, 'Image must be less than 10MB')
		)
	),

	// Bread criteria
	breadShape: v.picklist(['triangular', 'circular', 'long']),
	breadHasSesame: v.boolean(),
	breadFluffyInside: v.boolean(),
	breadCrispyOutside: v.boolean(),

	// Meat criteria
	meatType: v.picklist(['minced', 'layered']),
	meatProtein: v.picklist(['chicken', 'beef', 'lamb', 'mixed']),
	meatSeasoning: v.picklist(['pure', 'seasoned', 'phosphate']),

	// Toppings - nullable means "none"
	onionLevel: v.nullable(v.picklist(['mild', 'spicy'])),

	// Kraut - nullable means "none"
	krautLevel: v.nullable(v.picklist(['mild', 'sour'])),

	// Sauces
	hasYoghurtSauce: v.boolean(),
	hasGarlicSauce: v.boolean()
});

export type CreateDoenerSchema = typeof createDoenerSchema;
