// src/lib/server/schema.ts
import {
	pgTable,
	varchar,
	boolean,
	integer,
	text,
	doublePrecision,
	timestamp,
	serial,
	index
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	picture: text('picture'),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const doenerRestaurants = pgTable(
	'doener_restaurants',
	{
		id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
		name: varchar('name', { length: 50 }).notNull(),
		city: varchar('city', { length: 100 }).notNull(),
		country: varchar('country', { length: 2 }).notNull().default('DE'),
		latitude: doublePrecision('latitude').notNull(),
		longitude: doublePrecision('longitude').notNull(),

		// Image (optional, can be set at creation or via reviews)
		doenerImage: text('doener_image').references(() => files.id, { onDelete: 'set null' }),

		// Legacy characteristic columns — kept nullable; reviews are the source of truth now
		breadShape: varchar('bread_shape', { length: 20 }),
		breadHasSesame: boolean('bread_has_sesame').default(false),
		breadFluffyInside: boolean('bread_fluffy_inside').default(false),
		breadCrispyOutside: boolean('bread_crispy_outside').default(false),
		meatType: varchar('meat_type', { length: 20 }),
		meatProtein: varchar('meat_protein', { length: 20 }),
		meatSeasoning: varchar('meat_seasoning', { length: 20 }),
		onionLevel: varchar('onion_level', { length: 20 }),
		krautLevel: varchar('kraut_level', { length: 20 }),
		hasYoghurtSauce: boolean('has_yoghurt_sauce').default(false),
		hasGarlicSauce: boolean('has_garlic_sauce').default(false),

		addedBy: text('added_by')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		reviewCount: integer('review_count').notNull().default(0),

		// Average ratings for each category
		averageMeatRating: doublePrecision('average_meat_rating'),
		averageBreadRating: doublePrecision('average_bread_rating'),
		averageVeggiesRating: doublePrecision('average_veggies_rating'),
		averageSauceRating: doublePrecision('average_sauce_rating'),
		averageOverallRating: doublePrecision('average_overall_rating'),

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		cityIdx: index('doener_restaurants_city_idx').on(table.city),
		countryIdx: index('doener_restaurants_country_idx').on(table.country),
		overallRatingIdx: index('doener_restaurants_overall_rating_idx').on(table.averageOverallRating),
		nameIdx: index('doener_restaurants_name_idx').on(table.name)
	})
);

export const doenerReviews = pgTable(
	'doener_reviews',
	{
		id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
		restaurantId: integer('restaurant_id')
			.notNull()
			.references(() => doenerRestaurants.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		// Photo
		reviewImage: text('review_image').references(() => files.id, { onDelete: 'set null' }),

		// --- Meat ---
		meatChicken: boolean('meat_chicken').notNull().default(false),
		meatBeef: boolean('meat_beef').notNull().default(false),
		meatLamb: boolean('meat_lamb').notNull().default(false),
		meatStyle: varchar('meat_style', { length: 20 }), // 'minced' | 'layered'
		meatJuiciness: integer('meat_juiciness'), // 1-4
		meatCrispiness: integer('meat_crispiness'), // 1-4
		meatDryFeel: integer('meat_dry_feel'), // 1-4 (dryness/salt after eating)
		meatFatty: integer('meat_fatty'), // 1-4
		meatRating: integer('meat_rating').notNull(), // 1-4 overall quality

		// --- Bread ---
		breadShape: varchar('review_bread_shape', { length: 20 }), // 'round' | 'triangle' | 'long'
		breadThickness: integer('bread_thickness'), // 1-4
		breadCrispiness: integer('bread_crispiness'), // 1-4
		breadFluffy: integer('bread_fluffy'), // 1-4
		breadSesameSeeds: boolean('bread_sesame_seeds').notNull().default(false),
		breadRating: integer('bread_rating').notNull(), // 1-4 overall quality

		// --- Veggies ---
		hasTomatoes: boolean('has_tomatoes').notNull().default(false),
		onionType: varchar('onion_type', { length: 20 }), // 'spicy' | 'toned_down' | 'sweet' | null
		redCabbageType: varchar('red_cabbage_type', { length: 20 }), // 'sour' | 'natural' | null
		hasCabbage: boolean('has_cabbage').notNull().default(false),
		saladType: varchar('salad_type', { length: 50 }), // free text or null
		hasRucola: boolean('has_rucola').notNull().default(false),
		hasCorn: boolean('has_corn').notNull().default(false),
		hasParsley: boolean('has_parsley').notNull().default(false),
		veggiesRating: integer('veggies_rating').notNull(), // 1-4 overall quality

		// --- Sauces ---
		hasHerbalSauce: boolean('has_herbal_sauce').notNull().default(false),
		hasYoghurtSauce: boolean('has_yoghurt_sauce').notNull().default(false),
		hasGarlicSauce: boolean('has_garlic_sauce').notNull().default(false),
		hasCocktailSauce: boolean('has_cocktail_sauce').notNull().default(false),
		hasSpicySauce: boolean('has_spicy_sauce').notNull().default(false),
		sauceRating: integer('sauce_rating').notNull(), // 1-4 overall quality

		// --- Overall ---
		overallFlavorRating: integer('overall_flavor_rating'), // 1-4
		doenerSize: varchar('doener_size', { length: 20 }), // 'small' | 'medium' | 'large'
		price: doublePrecision('price'), // in euros, nullable
		cleanlinessRating: integer('cleanliness_rating'), // 1-4

		// Upvotes
		upvotes: integer('upvotes').notNull().default(0),

		// Short description (max 200 characters)
		description: varchar('description', { length: 200 }).notNull(),

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		restaurantIdx: index('doener_reviews_restaurant_idx').on(table.restaurantId),
		userIdx: index('doener_reviews_user_idx').on(table.userId),
		// Prevent duplicate reviews from same user for same restaurant
		userRestaurantIdx: index('doener_reviews_user_restaurant_idx').on(
			table.userId,
			table.restaurantId
		)
	})
);

export const files = pgTable('files', {
	id: text('id').primaryKey(),
	key: text('key').notNull().unique(),
	fileName: varchar('file_name', { length: 255 }).notNull(),
	contentType: varchar('content_type', { length: 100 }).notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	uploadedBy: text('uploaded_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	restaurants: many(doenerRestaurants),
	reviews: many(doenerReviews)
}));

export const doenerRestaurantsRelations = relations(doenerRestaurants, ({ one, many }) => ({
	addedByUser: one(users, {
		fields: [doenerRestaurants.addedBy],
		references: [users.id]
	}),
	reviews: many(doenerReviews)
}));

export const doenerReviewsRelations = relations(doenerReviews, ({ one }) => ({
	restaurant: one(doenerRestaurants, {
		fields: [doenerReviews.restaurantId],
		references: [doenerRestaurants.id]
	}),
	user: one(users, {
		fields: [doenerReviews.userId],
		references: [users.id]
	})
}));

export type DoenerRestaurant = typeof doenerRestaurants.$inferSelect;
export type NewDoenerRestaurant = typeof doenerRestaurants.$inferInsert;
export type DoenerReview = typeof doenerReviews.$inferSelect;
export type NewDoenerReview = typeof doenerReviews.$inferInsert;
