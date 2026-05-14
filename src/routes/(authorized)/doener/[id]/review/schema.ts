import * as v from 'valibot';

const alphanumericSentencePattern = /^[a-zA-Z0-9\s.,!?;:()\-'"äöüÄÖÜß€$£]+$/;

const rating1to4 = v.pipe(
	v.number(),
	v.integer(),
	v.minValue(1, 'Rating must be at least 1'),
	v.maxValue(4, 'Rating must be at most 4')
);

export const createReviewSchema = v.object({
	// --- Photo ---
	reviewImage: v.optional(
		v.pipe(
			v.file(),
			v.mimeType(
				['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
				'Image must be JPEG, PNG, WebP, or HEIC'
			),
			v.maxSize(10 * 1024 * 1024, 'Image must be less than 10MB')
		)
	),

	// --- Meat ---
	meatChicken: v.optional(v.boolean(), false),
	meatBeef: v.optional(v.boolean(), false),
	meatLamb: v.optional(v.boolean(), false),
	meatStyle: v.optional(v.picklist(['minced', 'layered']), 'layered'),
	meatJuiciness: v.optional(rating1to4, 2),
	meatCrispiness: v.optional(rating1to4, 2),
	meatDryFeel: v.optional(rating1to4, 1),
	meatFatty: v.optional(rating1to4, 2),
	meatRating: v.optional(rating1to4, 2),

	// --- Bread ---
	breadShape: v.optional(v.picklist(['round', 'triangle', 'long']), 'triangle'),
	breadThickness: v.optional(rating1to4, 2),
	breadCrispiness: v.optional(rating1to4, 2),
	breadFluffy: v.optional(rating1to4, 2),
	breadSesameSeeds: v.optional(v.boolean(), false),
	breadRating: v.optional(rating1to4, 2),

	// --- Veggies ---
	hasTomatoes: v.optional(v.boolean(), false),
	onionType: v.optional(v.nullable(v.picklist(['spicy', 'toned_down', 'sweet'])), null),
	redCabbageType: v.optional(v.nullable(v.picklist(['sour', 'natural'])), null),
	hasCabbage: v.optional(v.boolean(), false),
	saladType: v.optional(
		v.nullable(
			v.pipe(v.string(), v.maxLength(50, 'Salad type must be at most 50 characters'))
		),
		null
	),
	hasRucola: v.optional(v.boolean(), false),
	hasCorn: v.optional(v.boolean(), false),
	hasParsley: v.optional(v.boolean(), false),
	veggiesRating: v.optional(rating1to4, 2),

	// --- Sauces ---
	hasHerbalSauce: v.optional(v.boolean(), false),
	hasYoghurtSauce: v.optional(v.boolean(), false),
	hasGarlicSauce: v.optional(v.boolean(), false),
	hasCocktailSauce: v.optional(v.boolean(), false),
	hasSpicySauce: v.optional(v.boolean(), false),
	sauceRating: v.optional(rating1to4, 2),

	// --- Overall ---
	overallFlavorRating: v.optional(rating1to4, 2),
	doenerSize: v.optional(v.picklist(['small', 'medium', 'large']), 'medium'),
	price: v.optional(
		v.nullable(
			v.pipe(
				v.number(),
				v.minValue(0, 'Price cannot be negative'),
				v.maxValue(100, 'Price seems too high')
			)
		),
		null
	),
	cleanlinessRating: v.optional(rating1to4, 2),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(200, 'Description must be at most 200 characters'),
			v.regex(
				alphanumericSentencePattern,
				'Only alphanumeric, sentence characters, and spaces allowed'
			)
		),
		''
	)
});

export type CreateReviewSchema = typeof createReviewSchema;
