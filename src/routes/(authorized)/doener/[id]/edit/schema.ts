// src/routes/doener/[id]/edit/schema.ts
// Schema for creating a new döner listing
import * as v from 'valibot';

// Regex patterns
const alphanumericSentencePattern = /^[a-zA-Z0-9\s.,!?;:()\-'"äöüÄÖÜß]+$/;

export const createDoenerSchema = v.object({
	// Restaurant info
	restaurantName: v.pipe(
		v.string('Restaurant name is required'),
		v.minLength(2, 'Restaurant name must be at least 2 characters'),
		v.maxLength(50, 'Restaurant name must be at most 50 characters'),
		v.regex(alphanumericSentencePattern, 'Only alphanumeric and sentence characters allowed')
	),
	latitude: v.pipe(
		v.number('Latitude is required'),
		v.minValue(-90, 'Invalid latitude'),
		v.maxValue(90, 'Invalid latitude')
	),
	longitude: v.pipe(
		v.number('Longitude is required'),
		v.minValue(-180, 'Invalid longitude'),
		v.maxValue(180, 'Invalid longitude')
	),

	// Döner image
	doenerImage: v.optional(
		v.pipe(
			v.file('Image must be a file'),
			v.mimeType(
				['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
				'Image must be JPEG, PNG, WebP, or HEIC'
			),
			v.maxSize(10 * 1024 * 1024, 'Image must be less than 10MB')
		)
	),

	// Bread criteria
	breadShape: v.pipe(
		v.string('Bread shape is required'),
		v.picklist(['triangular', 'circular', 'long'], 'Please select bread shape')
	),
	breadHasSesame: v.boolean(),
	breadFluffyInside: v.boolean(),
	breadCrispyOutside: v.boolean(),

	// Meat criteria
	meatType: v.pipe(
		v.string('Meat type is required'),
		v.picklist(['minced', 'layered'], 'Please select a valid meat type')
	),
	meatProtein: v.pipe(
		v.string('Meat protein is required'),
		v.picklist(['chicken', 'beef', 'lamb', 'mixed'], 'Please select a valid protein type')
	),
	meatSeasoning: v.pipe(
		v.string('Meat seasoning is required'),
		v.picklist(['pure', 'seasoned', 'phosphate'], 'Please select seasoning level')
	),

	// Toppings - nullable means "none"
	onionLevel: v.nullable(
		v.pipe(v.string(), v.picklist(['mild', 'spicy'], 'Please select valid onion level'))
	),

	// Kraut - nullable means "none"
	krautLevel: v.nullable(
		v.pipe(v.string(), v.picklist(['mild', 'sour'], 'Please select valid kraut level'))
	),

	// Sauces
	hasYoghurtSauce: v.boolean(),
	hasGarlicSauce: v.boolean()
});

// Schema for adding a review to an existing döner
export const createReviewSchema = v.object({
	// Rating (1-5)
	rating: v.pipe(
		v.number('Rating is required'),
		v.integer('Rating must be a whole number'),
		v.minValue(1, 'Rating must be at least 1'),
		v.maxValue(5, 'Rating must be at most 5')
	),

	// Description (max 200 characters, alphanumeric + sentence chars + spaces)
	description: v.pipe(
		v.string('Description is required'),
		v.minLength(1, 'Description is required'),
		v.maxLength(200, 'Description must be at most 200 characters'),
		v.regex(
			alphanumericSentencePattern,
			'Only alphanumeric, sentence characters, and spaces allowed'
		)
	)
});

export type CreateDoenerSchema = typeof createDoenerSchema;
export type CreateReviewSchema = typeof createReviewSchema;
