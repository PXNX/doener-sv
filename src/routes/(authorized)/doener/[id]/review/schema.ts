// src/routes/doener/[id]/schema.ts
import * as v from 'valibot';

// Regex patterns
const alphanumericSentencePattern = /^[a-zA-Z0-9\s.,!?;:()\-'"äöüÄÖÜß]+$/;

// Schema for adding a review to an existing döner
export const createReviewSchema = v.object({
	// Category ratings (1-4: sub average, average, good, excellent)
	meatRating: v.optional(
		v.pipe(
			v.number('Meat rating is required'),
			v.integer('Rating must be a whole number'),
			v.minValue(1, 'Rating must be at least 1'),
			v.maxValue(4, 'Rating must be at most 4')
		),
		1
	),
	breadRating: v.optional(
		v.pipe(
			v.number('Bread rating is required'),
			v.integer('Rating must be a whole number'),
			v.minValue(1, 'Rating must be at least 1'),
			v.maxValue(4, 'Rating must be at most 4')
		),
		1
	),
	veggiesRating: v.optional(
		v.pipe(
			v.number('Veggies rating is required'),
			v.integer('Rating must be a whole number'),
			v.minValue(1, 'Rating must be at least 1'),
			v.maxValue(4, 'Rating must be at most 4')
		),
		1
	),
	sauceRating: v.optional(
		v.pipe(
			v.number('Sauce rating is required'),
			v.integer('Rating must be a whole number'),
			v.minValue(1, 'Rating must be at least 1'),
			v.maxValue(4, 'Rating must be at most 4')
		),
		1
	),
	// Description (max 200 characters, alphanumeric + sentence chars + spaces)
	description: v.optional(
		v.pipe(
			v.string('Description is required'),
			v.minLength(1, 'Description is required'),
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
