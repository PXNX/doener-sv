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

	// Aggregated data from reviews
	mostCommonBreadSesame: boolean;
	mostCommonBreadFluffy: boolean;
	mostCommonBreadCrispy: boolean;
	mostCommonMeatType: string | null;
	mostCommonMeatProtein: string | null;
	mostCommonMeatSeasoning: string | null;
	mostCommonSpiceLevel: string | null;
	mostCommonYoghurtSauce: boolean;
	mostCommonGarlicSauce: boolean;

	// Latest review data
	latestReviewImage: string | null;
	latestReviewNotes: string | null;
}

export interface DoenerReviewData {
	id: string;
	restaurantId: string;
	userId: string;

	// Image
	doenerImage: string | null;

	// Bread criteria
	breadHasSesame: boolean;
	breadFluffyInside: boolean;
	breadCrispyOutside: boolean;

	// Meat criteria
	meatType: 'minced' | 'layered';
	meatProtein: 'chicken' | 'beef' | 'mixed';
	meatSeasoning: 'pure' | 'seasoned' | 'phosphate';

	// Toppings & spice
	hasOnions: boolean;
	spiceLevel: 'mild' | 'spicy';

	// Sauces
	hasYoghurtSauce: boolean;
	hasGarlicSauce: boolean;

	// Overall rating & notes
	overallRating: number;
	notes: string | null;

	// Metadata
	createdAt: string;
	updatedAt: string;
}

export interface DoenerRestaurantDetail extends DoenerRestaurantResult {
	description?: string;
	address?: string;
	reviews: DoenerReviewData[];
}
