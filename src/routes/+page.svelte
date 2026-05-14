<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiStuffedFlatbread from '~icons/fluent-emoji/stuffed-flatbread';
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

	// GPS location state
	let userLatitude = $state<number | null>(null);
	let userLongitude = $state<number | null>(null);
	let gettingLocation = $state(false);
	let locationError = $state<string | null>(null);

	// Favorites count
	let favoritesCount = $state(0);

	// Filters - initialize from URL params or localStorage
	const savedFilters = getFromStorage(STORAGE_KEYS.filters, {});

	const f = (key: string) =>
		hasUrlParams
			? page.url.searchParams.get(key) === 'true'
			: savedFilters[key] || false;

	// Bread
	let filterBreadSesame = $state(f('breadSesame'));
	let filterBreadFluffy = $state(f('breadFluffy'));
	let filterBreadCrispy = $state(f('breadCrispy'));
	// Meat
	let filterMeatMinced = $state(f('meatMinced'));
	let filterMeatLayered = $state(f('meatLayered'));
	let filterMeatChicken = $state(f('meatChicken'));
	let filterMeatBeef = $state(f('meatBeef'));
	let filterMeatLamb = $state(f('meatLamb'));
	// Sauces
	let filterYoghurtSauce = $state(f('yoghurtSauce'));
	let filterGarlicSauce = $state(f('garlicSauce'));
	let filterHerbalSauce = $state(f('herbalSauce'));
	let filterCocktailSauce = $state(f('cocktailSauce'));
	let filterSpicySauce = $state(f('spicySauce'));

	let showFilters = $state(false);

	// Get user's current location
	async function getUserLocation() {
		if (!browser) return;

		gettingLocation = true;
		locationError = null;

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				});
			});

			userLatitude = position.coords.latitude;
			userLongitude = position.coords.longitude;

			// Optionally, reverse geocode to get city name
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLatitude}&lon=${userLongitude}`
				);
				const data = await response.json();

				// Update search term with city/town name
				if (data.address) {
					searchTerm = data.address.city || data.address.town || data.address.village || '';
				}
			} catch (geocodeError) {
				console.error('Reverse geocoding failed:', geocodeError);
				// Continue with coordinates even if reverse geocoding fails
			}
		} catch (error: any) {
			console.error('Location error:', error);
			if (error.code === 1) {
				locationError = 'Location access denied. Please enable location permissions.';
			} else if (error.code === 2) {
				locationError = 'Location unavailable. Please try again.';
			} else if (error.code === 3) {
				locationError = 'Location request timed out. Please try again.';
			} else {
				locationError = 'Unable to get your location.';
			}
		} finally {
			gettingLocation = false;
		}
	}

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
			breadSesame: filterBreadSesame,
			breadFluffy: filterBreadFluffy,
			breadCrispy: filterBreadCrispy,
			meatMinced: filterMeatMinced,
			meatLayered: filterMeatLayered,
			meatChicken: filterMeatChicken,
			meatBeef: filterMeatBeef,
			meatLamb: filterMeatLamb,
			yoghurtSauce: filterYoghurtSauce,
			garlicSauce: filterGarlicSauce,
			herbalSauce: filterHerbalSauce,
			cocktailSauce: filterCocktailSauce,
			spicySauce: filterSpicySauce
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

	const showEmptyState = $derived(
		!loading &&
			searchResults.length === 0 &&
			(searchTerm.length >= 2 || (userLatitude !== null && userLongitude !== null))
	);

	const activeFilterCount = $derived(
		[
			filterBreadSesame,
			filterBreadFluffy,
			filterBreadCrispy,
			filterMeatMinced,
			filterMeatLayered,
			filterMeatChicken,
			filterMeatBeef,
			filterMeatLamb,
			filterYoghurtSauce,
			filterGarlicSauce,
			filterHerbalSauce,
			filterCocktailSauce,
			filterSpicySauce
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
			<div class="space-y-2">
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

				<!-- GPS Location Button and Status -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={getUserLocation}
						disabled={gettingLocation || loading}
						class="btn btn-sm border-0 bg-orange-600/30 text-orange-100 hover:bg-orange-600/50"
					>
						{#if gettingLocation}
							<span class="loading loading-spinner loading-sm"></span>
							Getting location...
						{:else}
							📍 Use my location
						{/if}
					</button>

					{#if userLatitude !== null && userLongitude !== null}
						<span class="text-sm text-green-400"> ✓ Using GPS coordinates </span>
					{/if}

					{#if locationError}
						<span class="text-sm text-red-400">{locationError}</span>
					{/if}
				</div>

				<!-- Hidden inputs for GPS coordinates -->
				{#if userLatitude !== null && userLongitude !== null}
					<input type="hidden" name="latitude" value={userLatitude} />
					<input type="hidden" name="longitude" value={userLongitude} />
				{/if}
			</div>

			<!-- Filters (collapsible) -->
			<button
				type="button"
				onclick={() => (showFilters = !showFilters)}
				class="flex w-full items-center justify-between rounded-lg bg-slate-700/30 px-3 py-2 text-left transition-colors hover:bg-slate-700/50"
			>
				<span class="text-sm font-semibold text-orange-200">
					🔍 Filters
					{#if activeFilterCount > 0}
						<span class="badge badge-xs ml-1 border-0 bg-orange-600 text-white">{activeFilterCount}</span>
					{/if}
				</span>
				<span class="text-xs text-gray-400">{showFilters ? '▲' : '▼'}</span>
			</button>

			{#if showFilters}
			<div class="space-y-3 rounded-lg border border-white/5 bg-slate-800/30 p-3">
				<!-- Bread -->
				<div>
					<p class="mb-1.5 text-xs font-semibold text-orange-300">🍞 Bread</p>
					<div class="flex flex-wrap gap-1.5">
						{#each [{ name: 'breadSesame', label: '🌰 Sesame', bind: () => filterBreadSesame, set: (v: boolean) => (filterBreadSesame = v) }, { name: 'breadFluffy', label: '☁️ Fluffy', bind: () => filterBreadFluffy, set: (v: boolean) => (filterBreadFluffy = v) }, { name: 'breadCrispy', label: '🔥 Crispy', bind: () => filterBreadCrispy, set: (v: boolean) => (filterBreadCrispy = v) }] as opt}
							<label
								class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors
									{opt.bind() ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40' : 'bg-slate-700/40 text-gray-300 border border-transparent hover:bg-slate-700/60'}"
							>
								<input
									type="checkbox"
									name={opt.name}
									checked={opt.bind()}
									onchange={(e) => opt.set(e.currentTarget.checked)}
									class="hidden"
								/>
								{opt.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Meat -->
				<div>
					<p class="mb-1.5 text-xs font-semibold text-orange-300">🥩 Meat</p>
					<div class="flex flex-wrap gap-1.5">
						{#each [{ name: 'meatMinced', label: '🔪 Minced', bind: () => filterMeatMinced, set: (v: boolean) => (filterMeatMinced = v) }, { name: 'meatLayered', label: '📐 Layered', bind: () => filterMeatLayered, set: (v: boolean) => (filterMeatLayered = v) }, { name: 'meatChicken', label: '🐔 Chicken', bind: () => filterMeatChicken, set: (v: boolean) => (filterMeatChicken = v) }, { name: 'meatBeef', label: '🐄 Beef', bind: () => filterMeatBeef, set: (v: boolean) => (filterMeatBeef = v) }, { name: 'meatLamb', label: '🐑 Lamb', bind: () => filterMeatLamb, set: (v: boolean) => (filterMeatLamb = v) }] as opt}
							<label
								class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors
									{opt.bind() ? 'bg-red-500/25 text-red-200 border border-red-400/40' : 'bg-slate-700/40 text-gray-300 border border-transparent hover:bg-slate-700/60'}"
							>
								<input
									type="checkbox"
									name={opt.name}
									checked={opt.bind()}
									onchange={(e) => opt.set(e.currentTarget.checked)}
									class="hidden"
								/>
								{opt.label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Sauces -->
				<div>
					<p class="mb-1.5 text-xs font-semibold text-orange-300">🫗 Sauces</p>
					<div class="flex flex-wrap gap-1.5">
						{#each [{ name: 'yoghurtSauce', label: '🥛 Yoghurt', bind: () => filterYoghurtSauce, set: (v: boolean) => (filterYoghurtSauce = v) }, { name: 'garlicSauce', label: '🧄 Garlic', bind: () => filterGarlicSauce, set: (v: boolean) => (filterGarlicSauce = v) }, { name: 'herbalSauce', label: '🌿 Herbal', bind: () => filterHerbalSauce, set: (v: boolean) => (filterHerbalSauce = v) }, { name: 'cocktailSauce', label: '🍹 Cocktail', bind: () => filterCocktailSauce, set: (v: boolean) => (filterCocktailSauce = v) }, { name: 'spicySauce', label: '🌶️ Spicy', bind: () => filterSpicySauce, set: (v: boolean) => (filterSpicySauce = v) }] as opt}
							<label
								class="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors
									{opt.bind() ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40' : 'bg-slate-700/40 text-gray-300 border border-transparent hover:bg-slate-700/60'}"
							>
								<input
									type="checkbox"
									name={opt.name}
									checked={opt.bind()}
									onchange={(e) => opt.set(e.currentTarget.checked)}
									class="hidden"
								/>
								{opt.label}
							</label>
						{/each}
					</div>
				</div>
			</div>
			{/if}

			<!-- Submit button -->
			<button
				type="submit"
				class="btn btn-lg w-full border-0 bg-gradient-to-r from-orange-600 to-red-600 text-lg text-white hover:from-orange-500 hover:to-red-500"
				disabled={loading || (searchTerm.length < 2 && userLatitude === null)}
			>
				{#if loading}
					<span class="loading loading-spinner loading-md"></span>
				{:else}
					<FluentEmojiStuffedFlatbread class="size-6" />
				{/if}
				<span>Find Döners</span>
				<FluentArrowRight24Regular class="size-6" />
			</button>
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
