// src/routes/doener/create/schema.ts
import * as v from 'valibot';

export const createDoenerReviewSchema = v.object({
	// Restaurant info
	restaurantName: v.pipe(
		v.string('Restaurant name is required'),
		v.minLength(2, 'Restaurant name must be at least 2 characters'),
		v.maxLength(200, 'Restaurant name must be at most 200 characters')
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
		v.picklist(['chicken', 'beef', 'mixed'], 'Please select a valid protein type')
	),
	meatSeasoning: v.pipe(
		v.string('Meat seasoning is required'),
		v.picklist(['pure', 'seasoned', 'phosphate'], 'Please select seasoning level')
	),

	// Toppings & spice
	hasOnions: v.boolean(),
	spiceLevel: v.pipe(
		v.string('Spice level is required'),
		v.picklist(['mild', 'spicy'], 'Please select spice level')
	),

	// Sauces
	hasYoghurtSauce: v.boolean(),
	hasGarlicSauce: v.boolean(),

	// Overall rating
	overallRating: v.pipe(
		v.number('Rating is required'),
		v.integer('Rating must be a whole number'),
		v.minValue(1, 'Rating must be at least 1'),
		v.maxValue(5, 'Rating must be at most 5')
	),

	// Notes
	notes: v.optional(
		v.pipe(v.string(), v.maxLength(1000, 'Notes must be at most 1000 characters')),
		''
	)
});

export type CreateDoenerReviewSchema = typeof createDoenerReviewSchema;
