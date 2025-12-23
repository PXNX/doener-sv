// src/lib/types.ts

export interface DoenerRestaurantResult {
	id: string;
	name: string;
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	reviewCount: number;
	averageRating: number;

	// Döner characteristics (from restaurant record itself)
	breadShape: string;
	breadHasSesame: boolean;
	breadFluffyInside: boolean;
	breadCrispyOutside: boolean;
	meatType: string;
	meatProtein: string;
	meatSeasoning: string;
	onionLevel: string | null;
	krautLevel: string | null;
	hasYoghurtSauce: boolean;
	hasGarlicSauce: boolean;
	doenerImage: string | null;
}

export interface DoenerReviewData {
	id: string;
	restaurantId: string;
	userId: string;
	rating: number;
	description: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export type BreadShape = 'triangular' | 'circular' | 'long';
export type MeatType = 'minced' | 'layered';
export type MeatProtein = 'chicken' | 'beef' | 'lamb';
export type MeatSeasoning = 'pure' | 'seasoned' | 'phosphate';
export type OnionLevel = 'mild' | 'spicy'; // No 'none' - null means no onions
export type KrautLevel = 'mild' | 'sour'; // No 'none' - null means no kraut
