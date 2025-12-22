<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import type { PageData, ActionData } from './$types';
	import type { DoenerRestaurantResult } from '$lib/types';
	import { page } from '$app/state';
	import DoenerCard from '$lib/components/DoenerCard.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// localStorage keys
	const STORAGE_KEYS = {
		searchTerm: 'doener_search_term',
		searchResults: 'doener_search_results',
		filters: 'doener_search_filters',
		favorites: 'doener_favorites'
	};

	// Helper functions for localStorage
	function getFromStorage<T>(key: string, defaultValue: T): T {
		if (!browser) return defaultValue;
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch {
			return defaultValue;
		}
	}

	function setToStorage(key: string, value: any): void {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Failed to save to localStorage:', error);
		}
	}

	// Initialize from URL params, then fall back to localStorage
	const urlSearchTerm = page.url.searchParams.get('location');
	const hasUrlParams = urlSearchTerm !== null;

	// Search state
	let searchTerm = $state(urlSearchTerm || getFromStorage(STORAGE_KEYS.searchTerm, ''));
	let searchResults: DoenerRestaurantResult[] = $state(
		data.restaurants?.length > 0 ? data.restaurants : getFromStorage(STORAGE_KEYS.searchResults, [])
	);
	let loading = $state(false);

	// Favorites count
	let favoritesCount = $state(0);

	// Filters - initialize from URL params or localStorage
	const savedFilters = getFromStorage(STORAGE_KEYS.filters, {});

	// Sort option
	let sortBy = $state<'rating' | 'reviews'>(
		hasUrlParams
			? (page.url.searchParams.get('sortBy') as any) || 'rating'
			: savedFilters.sortBy || 'rating'
	);

	// Bread filters
	let filterBreadSesame = $state(
		hasUrlParams
			? page.url.searchParams.get('breadSesame') === 'true'
			: savedFilters.breadSesame || false
	);
	let filterBreadFluffy = $state(
		hasUrlParams
			? page.url.searchParams.get('breadFluffy') === 'true'
			: savedFilters.breadFluffy || false
	);
	let filterBreadCrispy = $state(
		hasUrlParams
			? page.url.searchParams.get('breadCrispy') === 'true'
			: savedFilters.breadCrispy || false
	);

	// Meat filters
	let filterMeatMinced = $state(
		hasUrlParams
			? page.url.searchParams.get('meatMinced') === 'true'
			: savedFilters.meatMinced || false
	);
	let filterMeatLayered = $state(
		hasUrlParams
			? page.url.searchParams.get('meatLayered') === 'true'
			: savedFilters.meatLayered || false
	);
	let filterMeatChicken = $state(
		hasUrlParams
			? page.url.searchParams.get('meatChicken') === 'true'
			: savedFilters.meatChicken || false
	);
	let filterMeatBeef = $state(
		hasUrlParams ? page.url.searchParams.get('meatBeef') === 'true' : savedFilters.meatBeef || false
	);
	let filterMeatMixed = $state(
		hasUrlParams
			? page.url.searchParams.get('meatMixed') === 'true'
			: savedFilters.meatMixed || false
	);

	// Seasoning filters
	let filterSeasoningPure = $state(
		hasUrlParams
			? page.url.searchParams.get('seasoningPure') === 'true'
			: savedFilters.seasoningPure || false
	);
	let filterSeasoningSeasoned = $state(
		hasUrlParams
			? page.url.searchParams.get('seasoningSeasoned') === 'true'
			: savedFilters.seasoningSeasoned || false
	);

	// Toppings filters
	let filterHasOnions = $state(
		hasUrlParams
			? page.url.searchParams.get('hasOnions') === 'true'
			: savedFilters.hasOnions || false
	);
	let filterSpicy = $state(
		hasUrlParams ? page.url.searchParams.get('spicy') === 'true' : savedFilters.spicy || false
	);
	let filterMild = $state(
		hasUrlParams ? page.url.searchParams.get('mild') === 'true' : savedFilters.mild || false
	);

	// Sauce filters
	let filterYoghurtSauce = $state(
		hasUrlParams
			? page.url.searchParams.get('yoghurtSauce') === 'true'
			: savedFilters.yoghurtSauce || false
	);
	let filterGarlicSauce = $state(
		hasUrlParams
			? page.url.searchParams.get('garlicSauce') === 'true'
			: savedFilters.garlicSauce || false
	);

	// Rating filter
	let minRating = $state<number>(
		hasUrlParams
			? parseInt(page.url.searchParams.get('minRating') || '0')
			: savedFilters.minRating || 0
	);

	// Update favorites count
	function updateFavoritesCount() {
		const favorites = getFromStorage<string[]>(STORAGE_KEYS.favorites, []);
		favoritesCount = favorites.length;
	}

	// Persist search term to localStorage
	$effect(() => {
		setToStorage(STORAGE_KEYS.searchTerm, searchTerm);
	});

	// Persist search results to localStorage
	$effect(() => {
		if (searchResults.length > 0) {
			setToStorage(STORAGE_KEYS.searchResults, searchResults);
		}
	});

	// Persist filters to localStorage
	$effect(() => {
		setToStorage(STORAGE_KEYS.filters, {
			sortBy,
			breadSesame: filterBreadSesame,
			breadFluffy: filterBreadFluffy,
			breadCrispy: filterBreadCrispy,
			meatMinced: filterMeatMinced,
			meatLayered: filterMeatLayered,
			meatChicken: filterMeatChicken,
			meatBeef: filterMeatBeef,
			meatMixed: filterMeatMixed,
			seasoningPure: filterSeasoningPure,
			seasoningSeasoned: filterSeasoningSeasoned,
			hasOnions: filterHasOnions,
			spicy: filterSpicy,
			mild: filterMild,
			yoghurtSauce: filterYoghurtSauce,
			garlicSauce: filterGarlicSauce,
			minRating
		});
	});

	// Update search results when form response comes back
	$effect(() => {
		if (form?.restaurants) {
			searchResults = form.restaurants;
		}
	});

	// Update search results when page data changes
	$effect(() => {
		if (data?.restaurants && data.restaurants.length > 0) {
			searchResults = data.restaurants;
		}
	});

	// Check favorites count on mount
	$effect(() => {
		if (browser) {
			updateFavoritesCount();
			const interval = setInterval(updateFavoritesCount, 1000);
			return () => clearInterval(interval);
		}
	});

	function handleFormSubmit() {
		loading = true;
		return async ({ update }) => {
			await update({ reset: false });
			loading = false;
		};
	}

	const showEmptyState = $derived(!loading && searchResults.length === 0 && searchTerm.length >= 2);

	const activeFilterCount = $derived(
		[
			filterBreadSesame,
			filterBreadFluffy,
			filterBreadCrispy,
			filterMeatMinced,
			filterMeatLayered,
			filterMeatChicken,
			filterMeatBeef,
			filterMeatMixed,
			filterSeasoningPure,
			filterSeasoningSeasoned,
			filterHasOnions,
			filterSpicy,
			filterMild,
			filterYoghurtSauce,
			filterGarlicSauce,
			minRating > 0
		].filter(Boolean).length
	);
</script>

<!-- Header -->
<header class="mb-10 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-20 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentFood20Filled class="size-12 text-white" />
		</div>
	</div>
	<h1 class="text-4xl font-bold text-white">🥙 Döner Finder</h1>
	<p class="mt-2 text-lg text-orange-200/90">Discover the best döner spots near you</p>
</header>

<!-- Auth & Actions Navigation -->
<div
	class="card mb-6 border border-orange-500/30 bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-md"
>
	<div class="card-body flex flex-row-reverse justify-between gap-x-2 p-3">
		<div class="flex gap-2">
			{#if data.session && data.user}
				{#if data.user.isAdmin}
					<a
						href="/admin/reviews"
						class="btn btn-ghost btn-sm text-purple-300 hover:bg-purple-600/20 hover:text-white"
					>
						🛡️ Admin
					</a>
				{/if}
				<a
					href={resolve('/auth/logout')}
					class="btn btn-ghost btn-sm text-orange-100 hover:bg-orange-600/20 hover:text-white"
				>
					Logout
				</a>
			{:else}
				<a
					href={resolve('/auth/login')}
					class="btn btn-ghost btn-sm text-orange-100 hover:bg-orange-600/20 hover:text-white"
				>
					Login
				</a>
			{/if}
		</div>

		<div class="flex gap-2">
			<a
				href="/doener/create"
				class="btn btn-sm border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				<FluentAdd24Regular class="size-4" />
				Add Review
			</a>

			{#if data.session && data.user}
				<a
					href="/my-reviews"
					class="btn btn-ghost btn-sm text-orange-100 hover:bg-orange-600/20 hover:text-white"
				>
					📝 My Reviews
				</a>
			{/if}

			<a
				href="/favorites"
				class="btn btn-ghost btn-sm text-orange-100 hover:bg-orange-600/20 hover:text-white"
			>
				⭐ Favorites
				{#if favoritesCount > 0}
					<span class="badge badge-sm border-0 bg-orange-600 text-white">{favoritesCount}</span>
				{/if}
			</a>
		</div>
	</div>
</div>

<!-- Search Form -->
<div
	class="card mb-6 border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
>
	<div class="card-body p-4 md:p-6">
		<form
			id="doener-search-form"
			method="POST"
			action="?/search"
			use:enhance={handleFormSubmit}
			class="space-y-4 md:space-y-6"
		>
			<!-- Location Input -->
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
					<FluentLocation24Regular class="size-5 text-orange-400" />
				</div>
				<input
					id="location"
					type="text"
					name="location"
					placeholder="Search by city or location (e.g., Berlin, München, Kreuzberg)..."
					class="input w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 py-4 pr-4 pl-12 text-lg text-white placeholder-orange-300/50 backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
					bind:value={searchTerm}
					disabled={loading}
					autocomplete="off"
				/>
			</div>

			<!-- Sort & Rating -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="sortBy" class="mb-2 block text-sm font-semibold text-orange-200">
						Sort by:
					</label>
					<select
						id="sortBy"
						name="sortBy"
						bind:value={sortBy}
						class="select w-full rounded-lg border-orange-500/30 bg-slate-800/50 text-white"
					>
						<option value="rating">⭐ Highest Rated</option>
						<option value="reviews">💬 Most Reviews</option>
					</select>
				</div>

				<div>
					<label for="minRating" class="mb-2 block text-sm font-semibold text-orange-200">
						Minimum Rating:
					</label>
					<div class="flex items-center gap-2">
						<input
							id="minRating"
							type="range"
							name="minRating"
							min="0"
							max="5"
							step="1"
							bind:value={minRating}
							class="range range-warning range-sm flex-1"
						/>
						<span class="min-w-[3rem] text-center font-bold text-white">
							{minRating > 0 ? `${minRating}⭐` : 'Any'}
						</span>
					</div>
				</div>
			</div>

			<!-- Filters -->
			<details
				class="collapse-arrow collapse rounded-xl border border-orange-500/20 bg-slate-800/30"
			>
				<summary class="collapse-title text-lg font-semibold text-orange-200">
					🔍 Filters
					{#if activeFilterCount > 0}
						<span class="badge badge-sm ml-2 border-0 bg-orange-600 text-white">
							{activeFilterCount}
						</span>
					{/if}
				</summary>
				<div class="collapse-content space-y-4 pt-4">
					<!-- Bread -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🥖 Bread:</h3>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadSesame"
									bind:checked={filterBreadSesame}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Sesame seeds</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadFluffy"
									bind:checked={filterBreadFluffy}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Fluffy inside</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadCrispy"
									bind:checked={filterBreadCrispy}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Crispy outside</span>
							</label>
						</div>
					</div>

					<!-- Meat Type -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🥩 Meat Type:</h3>
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatMinced"
									bind:checked={filterMeatMinced}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Minced</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatLayered"
									bind:checked={filterMeatLayered}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Layered</span>
							</label>
						</div>
					</div>

					<!-- Meat Protein -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🍖 Protein:</h3>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatChicken"
									bind:checked={filterMeatChicken}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Chicken</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatBeef"
									bind:checked={filterMeatBeef}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Beef</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatMixed"
									bind:checked={filterMeatMixed}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Mixed</span>
							</label>
						</div>
					</div>

					<!-- Seasoning -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🧂 Seasoning:</h3>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="seasoningPure"
									bind:checked={filterSeasoningPure}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Pure</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="seasoningSeasoned"
									bind:checked={filterSeasoningSeasoned}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Heavily seasoned</span>
							</label>
						</div>
					</div>

					<!-- Toppings & Spice -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🧅 Toppings & Spice:</h3>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="hasOnions"
									bind:checked={filterHasOnions}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Has onions</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="mild"
									bind:checked={filterMild}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Mild</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="spicy"
									bind:checked={filterSpicy}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Spicy 🌶️</span>
							</label>
						</div>
					</div>

					<!-- Sauces -->
					<div class="space-y-2">
						<h3 class="text-sm font-bold text-orange-300">🥫 Sauces:</h3>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="yoghurtSauce"
									bind:checked={filterYoghurtSauce}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Yoghurt sauce</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="garlicSauce"
									bind:checked={filterGarlicSauce}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Garlic sauce</span>
							</label>
						</div>
					</div>
				</div>
			</details>

			<!-- Submit button -->
			<div class="flex flex-col gap-3 sm:flex-row">
				<button
					type="submit"
					class="btn btn-lg flex-1 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-lg text-white hover:from-orange-500 hover:to-red-500"
					disabled={loading || searchTerm.length < 2}
				>
					{#if loading}
						<span class="loading loading-spinner loading-md"></span>
					{:else}
						<FluentFood20Filled class="size-6" />
					{/if}
					<span>Find Döner Spots</span>
					<FluentArrowRight24Regular class="size-6" />
				</button>
			</div>
		</form>
	</div>
</div>

<!-- Error Message -->
{#if form?.error}
	<div class="alert alert-error mb-4 border-red-500/50 bg-red-900/50">
		<span class="text-red-100">{form.error}</span>
	</div>
{/if}

<!-- Search Results Count -->
{#if !loading && searchResults.length > 0}
	<div class="mb-4 flex items-center justify-between">
		<p class="text-lg font-semibold text-orange-200">
			Found <span class="text-xl text-white">{searchResults.length}</span> döner spot{searchResults.length !==
			1
				? 's'
				: ''}
		</p>
		<div class="flex items-center gap-2 text-orange-300">
			<FluentStar20Filled class="size-5" />
			<span class="text-sm">Sorted by {sortBy === 'rating' ? 'rating' : 'reviews'}</span>
		</div>
	</div>
{/if}

<!-- Restaurant Cards -->
{#if searchResults.length > 0}
	<div class="space-y-4">
		{#each searchResults as restaurant (restaurant.id)}
			<DoenerCard {restaurant} />
		{/each}
	</div>
{/if}

<!-- Empty State -->
{#if showEmptyState}
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<div class="text-8xl">😢</div>
			<h3 class="text-3xl font-bold text-white">No döner spots found</h3>
			<p class="max-w-md text-center text-lg text-orange-200/90">
				Try adjusting your search location or filters. Or be the first to review a döner spot in
				your area!
			</p>
			<a
				href="/doener/create"
				class="btn btn-lg mt-4 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				<FluentAdd24Regular class="size-5" />
				Add First Review
			</a>
		</div>
	</div>
{/if}
