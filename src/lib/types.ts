export interface DoenerRestaurantResult {
	id: number;
	name: string;
	doenerImage: string | null;
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	reviewCount: number;
	averageRating: number | null;
	distance?: number;
	// Review-derived aggregates
	avgPrice: number | null;
	minPrice: number | null;
	maxPrice: number | null;
	// Most-common tags (from reviews)
	topProteins: { label: string; pct: number }[];
	topStyles: { label: string; pct: number }[];
	topSauces: { label: string; pct: number }[];
	topVeggies: { label: string; pct: number }[];
	// Boolean summaries (>50% of reviews)
	mostCommonBreadSesame: boolean;
	mostCommonBreadFluffy: boolean;
	mostCommonBreadCrispy: boolean;
	mostCommonMeatType: string | null;
	mostCommonMeatProtein: string | null;
	mostCommonMeatSeasoning: string | null;
	mostCommonYoghurtSauce: boolean;
	mostCommonGarlicSauce: boolean;
	mostCommonHerbalSauce: boolean;
	mostCommonCocktailSauce: boolean;
	mostCommonSpicySauce: boolean;
	latestReviewImage: string | null;
	latestReviewNotes: string | null;
}
