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

		// Döner characteristics (set when creating the döner listing)
		// Image
		doenerImage: text('doener_image').references(() => files.id, { onDelete: 'set null' }),

		// Bread criteria
		breadShape: varchar('bread_shape', { length: 20 }).notNull(), // 'triangular', 'circular', 'long'
		breadHasSesame: boolean('bread_has_sesame').notNull().default(false),
		breadFluffyInside: boolean('bread_fluffy_inside').notNull().default(false),
		breadCrispyOutside: boolean('bread_crispy_outside').notNull().default(false),

		// Meat criteria
		meatType: varchar('meat_type', { length: 20 }).notNull(), // 'minced', 'layered'
		meatProtein: varchar('meat_protein', { length: 20 }).notNull(), // 'chicken', 'beef', 'lamb', 'mixed'
		meatSeasoning: varchar('meat_seasoning', { length: 20 }).notNull(), // 'pure', 'seasoned', 'phosphate'

		// Toppings
		onionLevel: varchar('onion_level', { length: 20 }), // 'mild', 'spicy' (nullable - can be null if no onions)
		krautLevel: varchar('kraut_level', { length: 20 }), // 'mild', 'sour' (nullable - can be null if no kraut)

		// Sauces
		hasYoghurtSauce: boolean('has_yoghurt_sauce').notNull().default(false),
		hasGarlicSauce: boolean('has_garlic_sauce').notNull().default(false),

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

		// Category ratings (1-4: sub average, average, good, excellent)
		meatRating: integer('meat_rating').notNull(),
		breadRating: integer('bread_rating').notNull(),
		veggiesRating: integer('veggies_rating').notNull(),
		sauceRating: integer('sauce_rating').notNull(),

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
