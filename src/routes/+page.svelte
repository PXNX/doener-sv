<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiStuffedFlatbread from '~icons/fluent-emoji/stuffed-flatbread';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentEmojiBread from '~icons/fluent-emoji/bread';
	import FluentEmojiPoultryLeg from '~icons/fluent-emoji/poultry-leg';
	import FluentEmojiOnion from '~icons/fluent-emoji/onion';
	import FluentEmojiLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import FluentEmojiBottleWithPoppingCork from '~icons/fluent-emoji/bottle-with-popping-cork';
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

	// Bread filters
	let filterBreadTriangular = $state(
		hasUrlParams
			? page.url.searchParams.get('breadTriangular') === 'true'
			: savedFilters.breadTriangular || false
	);
	let filterBreadCircular = $state(
		hasUrlParams
			? page.url.searchParams.get('breadCircular') === 'true'
			: savedFilters.breadCircular || false
	);
	let filterBreadLong = $state(
		hasUrlParams
			? page.url.searchParams.get('breadLong') === 'true'
			: savedFilters.breadLong || false
	);
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
	let filterMeatLamb = $state(
		hasUrlParams ? page.url.searchParams.get('meatLamb') === 'true' : savedFilters.meatBeef || false
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

	// Onion filters
	let filterOnionsNone = $state(
		hasUrlParams
			? page.url.searchParams.get('onionsNone') === 'true'
			: savedFilters.onionsNone || false
	);
	let filterOnionsMild = $state(
		hasUrlParams
			? page.url.searchParams.get('onionsMild') === 'true'
			: savedFilters.onionsMild || false
	);
	let filterOnionsSpicy = $state(
		hasUrlParams
			? page.url.searchParams.get('onionsSpicy') === 'true'
			: savedFilters.onionsSpicy || false
	);

	// Kraut filters
	let filterKrautNone = $state(
		hasUrlParams
			? page.url.searchParams.get('krautNone') === 'true'
			: savedFilters.krautNone || false
	);
	let filterKrautMild = $state(
		hasUrlParams
			? page.url.searchParams.get('krautMild') === 'true'
			: savedFilters.krautMild || false
	);
	let filterKrautSour = $state(
		hasUrlParams
			? page.url.searchParams.get('krautSour') === 'true'
			: savedFilters.krautSour || false
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
			breadTriangular: filterBreadTriangular,
			breadCircular: filterBreadCircular,
			breadLong: filterBreadLong,
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
			onionsNone: filterOnionsNone,
			onionsMild: filterOnionsMild,
			onionsSpicy: filterOnionsSpicy,
			krautNone: filterKrautNone,
			krautMild: filterKrautMild,
			krautSour: filterKrautSour,
			yoghurtSauce: filterYoghurtSauce,
			garlicSauce: filterGarlicSauce
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
			filterBreadTriangular,
			filterBreadCircular,
			filterBreadLong,
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
			filterOnionsNone,
			filterOnionsMild,
			filterOnionsSpicy,
			filterKrautNone,
			filterKrautMild,
			filterKrautSour,
			filterYoghurtSauce,
			filterGarlicSauce
		].filter(Boolean).length
	);
</script>

<!-- Header -->
<header class="mb-10 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentEmojiStuffedFlatbread class="size-12 text-white" />
		</div>
	</div>
	<h1 class="text-4xl font-bold text-white">Döner Rating</h1>
	<p class="mt-2 text-lg text-orange-200/90">
		Recommend the best Döners • <a href="/about" class="underline">About</a>
	</p>
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
				Add Döner
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

			<!-- Filters -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-orange-200">
						🔍 Filters
						{#if activeFilterCount > 0}
							<span class="badge badge-sm ml-2 border-0 bg-orange-600 text-white">
								{activeFilterCount}
							</span>
						{/if}
					</h3>
				</div>

				<!-- Bread -->
				<div class="space-y-2">
					<h4 class="flex items-center gap-2 text-sm font-bold text-orange-300">
						<FluentEmojiBread class="size-4" />
						Bread
					</h4>
					<div class="space-y-2">
						<p class="text-xs text-orange-200/70">Shape:</p>
						<div class="grid grid-cols-3 gap-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadTriangular"
									bind:checked={filterBreadTriangular}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Triangular</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadCircular"
									bind:checked={filterBreadCircular}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Circular</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="breadLong"
									bind:checked={filterBreadLong}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Long</span>
							</label>
						</div>
						<p class="pt-2 text-xs text-orange-200/70">Properties:</p>
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
				</div>

				<!-- Meat Type -->
				<div class="space-y-2">
					<h4 class="flex items-center gap-2 text-sm font-bold text-orange-300">
						<FluentEmojiPoultryLeg class="size-4" />
						Meat
					</h4>

					<div class="space-y-2">
						<p class="text-xs text-orange-200/70">Consistency:</p>

						<div class="grid grid-cols-2 gap-2">
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

						<p class="pt-2 text-xs text-orange-200/70">Animal:</p>
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
								<span class="text-sm text-white">Cow</span>
							</label>

							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="meatLamb"
									bind:checked={filterMeatLamb}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Lamb</span>
							</label>
						</div>

						<p class="pt-2 text-xs text-orange-200/70">Seasoning:</p>
						<div class="grid grid-cols-2 gap-2">
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

					<!-- Onions -->
					<div class="space-y-2">
						<h4 class="flex items-center gap-2 text-sm font-bold text-orange-300">
							<FluentEmojiOnion class="size-4" />
							<span>Onions</span>
						</h4>
						<div class="grid grid-cols-2 gap-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="onionsMild"
									bind:checked={filterOnionsMild}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Mild</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="onionsSpicy"
									bind:checked={filterOnionsSpicy}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Spicy</span>
							</label>
						</div>
					</div>

					<!-- Kraut -->
					<div class="space-y-2">
						<h4 class="flex items-center gap-2 text-sm font-bold text-orange-300">
							<FluentEmojiLeafyGreen class="size-4" />
							<span>Red Cabbage</span>
						</h4>
						<div class="grid grid-cols-2 gap-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="krautMild"
									bind:checked={filterKrautMild}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Mild</span>
							</label>
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="krautSour"
									bind:checked={filterKrautSour}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Sour</span>
							</label>
						</div>
					</div>

					<!-- Sauces -->
					<div class="space-y-2">
						<h4 class="flex items-center gap-2 text-sm font-bold text-orange-300">
							<FluentEmojiBottleWithPoppingCork class="size-4" />
							<span>Sauces</span>
						</h4>
						<div class="grid grid-cols-2 gap-2">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700/30 p-2 transition-colors hover:bg-slate-700/50"
							>
								<input
									type="checkbox"
									name="yoghurtSauce"
									bind:checked={filterYoghurtSauce}
									class="checkbox checkbox-warning checkbox-sm"
								/>
								<span class="text-sm text-white">Yoghurt</span>
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
								<span class="text-sm text-white">Garlic</span>
							</label>
						</div>
					</div>
				</div>

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
							<FluentEmojiStuffedFlatbread class="size-6" />
						{/if}
						<span>Find Döners</span>
						<FluentArrowRight24Regular class="size-6" />
					</button>
				</div>
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
	<div class="mb-4">
		<p class="text-lg font-semibold text-orange-200">
			Found <span class="text-xl text-white">{searchResults.length}</span> döner spot{searchResults.length !==
			1
				? 's'
				: ''}
		</p>
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
		</div>
	</div>
{/if}
