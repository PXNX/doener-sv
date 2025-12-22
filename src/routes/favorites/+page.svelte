<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import BackButton from '$lib/components/BackButton.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import DoenerCard from '$lib/components/DoenerCard.svelte';
	import type { DoenerRestaurantResult } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const FAVORITES_KEY = 'doener_favorites';

	let favorites = $state<string[]>([]);
	let isLoading = $state(true);
	let restaurants: DoenerRestaurantResult[] = $state(data.restaurants || []);

	function loadFavorites() {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem(FAVORITES_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load favorites:', error);
		}
		return [];
	}

	function clearAllFavorites() {
		if (confirm('Are you sure you want to remove all favorites?')) {
			favorites = [];
			restaurants = [];
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		}
	}

	async function fetchFavoriteRestaurants(favoriteIds: string[]) {
		if (favoriteIds.length === 0) {
			isLoading = false;
			restaurants = [];
			return;
		}

		try {
			const response = await fetch(`/favorites?ids=${favoriteIds.join(',')}`);
			if (response.ok) {
				const data = await response.json();
				restaurants = data.restaurants || [];
			}
		} catch (error) {
			console.error('Failed to fetch favorite restaurants:', error);
			restaurants = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		const loadedFavorites = loadFavorites();
		favorites = loadedFavorites;
		fetchFavoriteRestaurants(loadedFavorites);
	});
</script>

<svelte:head>
	<title>My Favorites - Döner Finder</title>
	<meta name="description" content="Your favorite döner spots" />
</svelte:head>

<!-- Header -->
<div class="mb-6 flex items-center justify-between">
	<BackButton href="/" />
	{#if restaurants.length > 0}
		<button onclick={clearAllFavorites} class="btn btn-error btn-sm btn-outline">
			<FluentDelete24Regular class="size-4" />
			Clear All
		</button>
	{/if}
</div>

<header class="mb-6 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500"
		>
			<FluentEmojiGlowingStar class="size-10" />
		</div>
	</div>
	<h1 class="text-3xl font-bold text-white">My Favorite Döner Spots</h1>
	<p class="mt-2 text-lg text-orange-200/90">
		{restaurants.length} spot{restaurants.length !== 1 ? 's' : ''} saved
	</p>
</header>

<!-- Loading State -->
{#if isLoading}
	<div class="mb-8 flex justify-center py-8">
		<div
			class="flex items-center gap-3 rounded-full border border-orange-500/40 bg-gradient-to-br from-orange-900/30 to-red-900/30 px-6 py-3 backdrop-blur-md"
		>
			<span class="loading loading-ring loading-md text-orange-400"></span>
			<span class="font-medium text-white">Loading your favorites...</span>
		</div>
	</div>
{/if}

<!-- Restaurant Cards -->
{#if !isLoading && restaurants.length > 0}
	<div class="space-y-4">
		{#each restaurants as restaurant (restaurant.id)}
			<DoenerCard {restaurant} />
		{/each}
	</div>
{/if}

<!-- Empty State -->
{#if !isLoading && restaurants.length === 0}
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<div class="text-8xl">😢</div>
			<h3 class="text-2xl font-bold text-white">No favorites yet</h3>
			<p class="max-w-md text-center text-lg text-orange-200/90">
				Start adding döner spots to your favorites by clicking the star icon on restaurant pages.
			</p>
			<a
				href={resolve('/')}
				class="btn btn-lg mt-4 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				<FluentFood20Filled class="size-5" />
				Find Döner Spots
				<FluentArrowRight24Regular class="size-5" />
			</a>
		</div>
	</div>
{/if}
