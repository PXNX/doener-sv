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
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
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

export const files = pgTable('files', {
	id: uuid('id').primaryKey(),
	key: text('key').notNull(),
	fileName: text('file_name').notNull(),
	contentType: text('content_type').notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	uploadedBy: text('uploaded_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const doenerRestaurants = pgTable(
	'doener_restaurants',
	{
		id: uuid('id').primaryKey(),
		name: varchar('name', { length: 200 }).notNull(),
		city: varchar('city', { length: 100 }).notNull(),
		country: varchar('country', { length: 2 }).notNull().default('DE'),
		
		// Location
		latitude: doublePrecision('latitude').notNull(),
		longitude: doublePrecision('longitude').notNull(),
		
		// Stats
		reviewCount: integer('review_count').notNull().default(0),
		averageRating: doublePrecision('average_rating'),
		
		// Metadata
		addedBy: text('added_by')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		nameIdx: index('doener_name_idx').on(table.name),
		cityIdx: index('doener_city_idx').on(table.city),
		locationIdx: index('doener_location_idx').on(table.latitude, table.longitude),
		ratingIdx: index('doener_rating_idx').on(table.averageRating)
	})
);

export const doenerReviews = pgTable(
	'doener_reviews',
	{
		id: uuid('id').primaryKey(),
		restaurantId: uuid('restaurant_id')
			.notNull()
			.references(() => doenerRestaurants.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		
		// Image of the döner
		doenerImage: uuid('doener_image').references(() => files.id, { onDelete: 'set null' }),
		
		// Bread criteria
		breadHasSesame: boolean('bread_has_sesame').notNull().default(false),
		breadFluffyInside: boolean('bread_fluffy_inside').notNull().default(false),
		breadCrispyOutside: boolean('bread_crispy_outside').notNull().default(false),
		
		// Meat criteria
		meatType: varchar('meat_type', { length: 20 }).notNull(), // 'minced' or 'layered'
		meatProtein: varchar('meat_protein', { length: 20 }).notNull(), // 'chicken', 'beef', 'mixed'
		meatSeasoning: varchar('meat_seasoning', { length: 20 }).notNull(), // 'pure', 'seasoned', 'phosphate'
		
		// Toppings & spice
		hasOnions: boolean('has_onions').notNull().default(false),
		spiceLevel: varchar('spice_level', { length: 20 }).notNull(), // 'mild' or 'spicy'
		
		// Sauces
		hasYoghurtSauce: boolean('has_yoghurt_sauce').notNull().default(false),
		hasGarlicSauce: boolean('has_garlic_sauce').notNull().default(false),
		
		// Overall rating & notes
		overallRating: integer('overall_rating').notNull(), // 1-5 stars
		notes: text('notes'),
		
		// Metadata
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		restaurantIdx: index('review_restaurant_idx').on(table.restaurantId),
		userIdx: index('review_user_idx').on(table.userId),
		ratingIdx: index('review_rating_idx').on(table.overallRating),
		createdAtIdx: index('review_created_at_idx').on(table.createdAt)
	})
);

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
	}),
	image: one(files, {
		fields: [doenerReviews.doenerImage],
		references: [files.id]
	})
}));



export type DoenerRestaurant = typeof doenerRestaurants.$inferSelect;
export type NewDoenerRestaurant = typeof doenerRestaurants.$inferInsert;
export type DoenerReview = typeof doenerReviews.$inferSelect;
export type NewDoenerReview = typeof doenerReviews.$inferInsert;