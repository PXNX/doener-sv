// src/lib/types.ts

// src/lib/types.ts
// Add distance field to DoenerRestaurantResult type

export interface DoenerRestaurantResult {
	id: number;
	name: string;
	doenerImage: string | null;
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	reviewCount: number;
	averageRating: number;
	distance?: number;
	mostCommonBreadSesame: boolean;
	mostCommonBreadFluffy: boolean;
	mostCommonBreadCrispy: boolean;
	mostCommonMeatType: string | null;
	mostCommonMeatProtein: string | null;
	mostCommonMeatSeasoning: string | null;
	mostCommonSpiceLevel: string | null;
	mostCommonYoghurtSauce: boolean;
	mostCommonGarlicSauce: boolean;
	latestReviewImage: string | null;
	latestReviewNotes: string | null;
}

export interface DoenerReviewData {
	id: number;
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
