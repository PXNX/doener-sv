<!-- src/routes/doener/[id]/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentHeart20Filled from '~icons/fluent/heart-20-filled';
	import FluentHeart20Regular from '~icons/fluent/heart-20-regular';
	import FluentChevronDown20Regular from '~icons/fluent/chevron-down-20-regular';
	import FluentChevronUp20Regular from '~icons/fluent/chevron-up-20-regular';
	import NotoMeatOnBone from '~icons/fluent-emoji/meat-on-bone';
	import NotoBread from '~icons/fluent-emoji/bread';
	import NotoLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import NotoSaltShaker from '~icons/fluent-emoji/salt';
	import type { PageData } from './$types';

	let { data }: Props = $props();

	interface Props {
		data: PageData;
	}

	const FAVORITES_KEY = 'doener_favorites';
	let isFavorite = $state(false);
	let showReviews = $state(false);
	let sortBy = $state<'recent' | 'highest' | 'lowest'>('recent');

	// Check if restaurant is in favorites
	$effect(() => {
		if (browser) {
			try {
				const stored = localStorage.getItem(FAVORITES_KEY);
				const favorites: string[] = stored ? JSON.parse(stored) : [];
				isFavorite = favorites.includes(data.restaurant.id.toString());
			} catch (error) {
				console.error('Failed to load favorites:', error);
			}
		}
	});

	function toggleFavorite() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(FAVORITES_KEY);
			let favorites: string[] = stored ? JSON.parse(stored) : [];

			if (isFavorite) {
				favorites = favorites.filter((id) => id !== data.restaurant.id.toString());
			} else {
				favorites.push(data.restaurant.id.toString());
			}

			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
			isFavorite = !isFavorite;
		} catch (error) {
			console.error('Failed to update favorites:', error);
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	const sortedReviews = $derived(() => {
		const reviews = [...data.reviews];
		if (sortBy === 'highest') {
			return reviews.sort((a, b) => b.overallRating - a.overallRating);
		} else if (sortBy === 'lowest') {
			return reviews.sort((a, b) => a.overallRating - b.overallRating);
		}
		return reviews; // Already sorted by recent
	});

	function getRatingColor(rating: number) {
		if (rating >= 3.5) return 'text-green-400';
		if (rating >= 2.5) return 'text-blue-400';
		if (rating >= 1.5) return 'text-yellow-400';
		return 'text-orange-400';
	}

	function getRatingBg(rating: number) {
		if (rating >= 3.5) return 'bg-green-400/20 border-green-400/40';
		if (rating >= 2.5) return 'bg-blue-400/20 border-blue-400/40';
		if (rating >= 1.5) return 'bg-yellow-400/20 border-yellow-400/40';
		return 'bg-orange-400/20 border-orange-400/40';
	}

	function getRatingLabel(rating: number) {
		if (rating >= 3.5) return 'Excellent';
		if (rating >= 2.5) return 'Good';
		if (rating >= 1.5) return 'Average';
		return 'Sub Average';
	}

	const overallRatingColor = $derived(getRatingColor(data.restaurant.averageOverallRating));
	const overallRatingBg = $derived(getRatingBg(data.restaurant.averageOverallRating));
</script>

<svelte:head>
	<title>{data.restaurant.name} - Döner Finder</title>
</svelte:head>

<BackButton href="/" />

<!-- Restaurant Header -->
<div
	class="card mb-6 border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
>
	<div class="card-body p-6">
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Restaurant Image -->
			<div class="shrink-0">
				{#if data.restaurant.doenerImage}
					<img
						src={data.restaurant.doenerImage}
						alt={data.restaurant.name}
						class="h-64 w-full rounded-xl border-2 border-orange-500/30 object-cover shadow-lg lg:w-64"
					/>
				{:else}
					<div
						class="flex h-64 w-full items-center justify-center rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/40 to-red-600/40 lg:w-64"
					>
						<span class="text-8xl">🥙</span>
					</div>
				{/if}
			</div>

			<!-- Restaurant Info -->
			<div class="flex-1">
				<div class="mb-4 flex items-start justify-between gap-4">
					<div class="flex-1">
						<h1 class="mb-2 text-3xl font-bold text-white">{data.restaurant.name}</h1>
						<div class="mb-3 flex items-center gap-2 text-orange-300/90">
							<FluentLocation20Filled class="size-5" />
							<span class="text-lg">{data.restaurant.city}, {data.restaurant.country}</span>
						</div>
					</div>

					<button
						onclick={toggleFavorite}
						class="btn btn-circle btn-lg {isFavorite
							? 'btn-warning'
							: 'btn-outline btn-warning'} transition-transform hover:scale-110"
						title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
					>
						{#if isFavorite}
							<FluentHeart20Filled class="size-6" />
						{:else}
							<FluentHeart20Regular class="size-6" />
						{/if}
					</button>
				</div>

				<!-- Overall Rating -->
				<div class="mb-4 flex items-center gap-4">
					<div class="flex items-center gap-2 rounded-xl border px-4 py-2 {overallRatingBg}">
						<FluentStar20Filled class="size-6 {overallRatingColor}" />
						<span class="font-bold {overallRatingColor} text-2xl">
							{data.restaurant.averageOverallRating?.toFixed(1) || 'N/A'}
						</span>
					</div>
					<div class="text-orange-300/90">
						<div class="text-xl font-semibold">
							{data.restaurant.reviewCount} review{data.restaurant.reviewCount !== 1 ? 's' : ''}
						</div>
						<div class="text-sm">{getRatingLabel(data.restaurant.averageOverallRating)}</div>
					</div>
				</div>

				<!-- Category Ratings -->
				<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div class="rounded-lg border border-white/10 bg-slate-800/50 p-3">
						<div class="mb-1 flex items-center gap-2">
							<NotoMeatOnBone class="size-5" />
							<span class="text-xs font-medium text-gray-300">Meat</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="text-lg font-bold {getRatingColor(data.restaurant.averageMeatRating)}">
								{data.restaurant.averageMeatRating?.toFixed(1) || 'N/A'}
							</span>
							<span class="text-xs text-gray-400">/4</span>
						</div>
					</div>

					<div class="rounded-lg border border-white/10 bg-slate-800/50 p-3">
						<div class="mb-1 flex items-center gap-2">
							<NotoBread class="size-5" />
							<span class="text-xs font-medium text-gray-300">Bread</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="text-lg font-bold {getRatingColor(data.restaurant.averageBreadRating)}">
								{data.restaurant.averageBreadRating?.toFixed(1) || 'N/A'}
							</span>
							<span class="text-xs text-gray-400">/4</span>
						</div>
					</div>

					<div class="rounded-lg border border-white/10 bg-slate-800/50 p-3">
						<div class="mb-1 flex items-center gap-2">
							<NotoLeafyGreen class="size-5" />
							<span class="text-xs font-medium text-gray-300">Veggies</span>
						</div>
						<div class="flex items-center gap-1">
							<span
								class="text-lg font-bold {getRatingColor(data.restaurant.averageVeggiesRating)}"
							>
								{data.restaurant.averageVeggiesRating?.toFixed(1) || 'N/A'}
							</span>
							<span class="text-xs text-gray-400">/4</span>
						</div>
					</div>

					<div class="rounded-lg border border-white/10 bg-slate-800/50 p-3">
						<div class="mb-1 flex items-center gap-2">
							<NotoSaltShaker class="size-5" />
							<span class="text-xs font-medium text-gray-300">Sauce</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="text-lg font-bold {getRatingColor(data.restaurant.averageSauceRating)}">
								{data.restaurant.averageSauceRating?.toFixed(1) || 'N/A'}
							</span>
							<span class="text-xs text-gray-400">/4</span>
						</div>
					</div>
				</div>

				<!-- Döner Characteristics -->
				<div class="mb-4">
					<h3 class="mb-2 text-sm font-semibold text-orange-300">What to expect here:</h3>
					<div class="flex flex-wrap gap-2">
						{#if data.restaurant.breadHasSesame}
							<span class="badge border-amber-400/40 bg-amber-500/20 text-amber-200"
								>🌰 Sesame seeds</span
							>
						{/if}
						{#if data.restaurant.breadFluffyInside}
							<span class="badge border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
								>☁️ Fluffy bread</span
							>
						{/if}
						{#if data.restaurant.breadCrispyOutside}
							<span class="badge border-orange-400/40 bg-orange-500/20 text-orange-200"
								>🔥 Crispy outside</span
							>
						{/if}
						<span class="badge border-red-400/40 bg-red-500/20 text-red-200">
							🥩 {data.restaurant.meatType === 'minced' ? 'Minced' : 'Layered'} meat
						</span>
						<span class="badge border-orange-500/40 bg-orange-600/20 text-orange-200">
							{#if data.restaurant.meatProtein === 'chicken'}🐔{:else if data.restaurant.meatProtein === 'beef'}🐄{:else if data.restaurant.meatProtein === 'lamb'}🐑{:else}🍖{/if}
							{data.restaurant.meatProtein.charAt(0).toUpperCase() +
								data.restaurant.meatProtein.slice(1)}
						</span>
						{#if data.restaurant.onionLevel}
							<span class="badge border-purple-400/40 bg-purple-500/20 text-purple-200">
								🧅 {data.restaurant.onionLevel === 'spicy' ? 'Spicy' : 'Mild'} onions
							</span>
						{/if}
						{#if data.restaurant.krautLevel}
							<span class="badge border-green-400/40 bg-green-500/20 text-green-200">
								🥬 {data.restaurant.krautLevel === 'sour' ? 'Sour' : 'Mild'} kraut
							</span>
						{/if}
						{#if data.restaurant.hasYoghurtSauce}
							<span class="badge border-blue-300/40 bg-blue-400/20 text-blue-200"
								>🥛 Yoghurt sauce</span
							>
						{/if}
						{#if data.restaurant.hasGarlicSauce}
							<span class="badge border-purple-300/40 bg-purple-400/20 text-purple-200"
								>🧄 Garlic sauce</span
							>
						{/if}
					</div>
				</div>

				<!-- Action Button -->
				{#if data.user && !data.userHasReviewed}
					<a
						href="/doener/{data.restaurant.id}/review"
						class="btn border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
					>
						<FluentAdd24Regular class="size-5" />
						Add Your Review
					</a>
				{:else if data.userHasReviewed}
					<div class="rounded-lg border border-green-400/40 bg-green-500/20 p-3">
						<p class="text-sm font-medium text-green-200">✓ You've already reviewed this döner</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Reviews Section -->
<div class="mb-6">
	<button
		onclick={() => (showReviews = !showReviews)}
		class="mb-4 flex w-full items-center justify-between rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 p-4 backdrop-blur-md transition-all hover:from-orange-900/30 hover:to-red-900/30"
	>
		<h2 class="text-2xl font-bold text-white">Reviews ({data.reviews.length})</h2>
		{#if showReviews}
			<FluentChevronUp20Regular class="size-6 text-orange-400" />
		{:else}
			<FluentChevronDown20Regular class="size-6 text-orange-400" />
		{/if}
	</button>

	{#if showReviews}
		{#if data.reviews.length === 0}
			<div
				class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
			>
				<div class="card-body items-center justify-center py-12">
					<div class="mb-4 text-6xl">📝</div>
					<p class="text-lg text-orange-200/90">No reviews yet. Be the first to review!</p>
				</div>
			</div>
		{:else}
			<!-- Sort Controls -->
			<div class="mb-4 flex gap-2">
				<button
					onclick={() => (sortBy = 'recent')}
					class="btn btn-sm"
					class:btn-active={sortBy === 'recent'}
				>
					Most Recent
				</button>
				<button
					onclick={() => (sortBy = 'highest')}
					class="btn btn-sm"
					class:btn-active={sortBy === 'highest'}
				>
					Highest Rated
				</button>
				<button
					onclick={() => (sortBy = 'lowest')}
					class="btn btn-sm"
					class:btn-active={sortBy === 'lowest'}
				>
					Lowest Rated
				</button>
			</div>

			<!-- Reviews List -->
			<div class="space-y-4">
				{#each sortedReviews() as review}
					<div
						class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
					>
						<div class="card-body p-4">
							<div class="mb-3 flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-2">
										<span class="font-semibold text-white">{review.user.name}</span>
										<span class="text-sm text-orange-300/70">• {formatDate(review.createdAt)}</span>
									</div>

									<!-- Overall Rating -->
									<div class="mb-2 flex items-center gap-2">
										<div
											class="flex items-center gap-1 rounded-lg border px-2 py-1 {getRatingBg(
												review.overallRating
											)}"
										>
											<FluentStar20Filled class="size-4 {getRatingColor(review.overallRating)}" />
											<span class="text-sm font-bold {getRatingColor(review.overallRating)}">
												{review.overallRating.toFixed(1)}
											</span>
										</div>
										<span class="text-xs text-gray-400">{getRatingLabel(review.overallRating)}</span
										>
									</div>

									<!-- Category Ratings -->
									<div class="mb-3 flex flex-wrap gap-2">
										<span class="badge badge-xs {getRatingBg(review.meatRating)}">
											<NotoMeatOnBone class="size-3" />
											{review.meatRating}
										</span>
										<span class="badge badge-xs {getRatingBg(review.breadRating)}">
											<NotoBread class="size-3" />
											{review.breadRating}
										</span>
										<span class="badge badge-xs {getRatingBg(review.veggiesRating)}">
											<NotoLeafyGreen class="size-3" />
											{review.veggiesRating}
										</span>
										<span class="badge badge-xs {getRatingBg(review.sauceRating)}">
											<NotoSaltShaker class="size-3" />
											{review.sauceRating}
										</span>
									</div>

									<!-- Review Description -->
									<div class="rounded-lg border border-orange-500/20 bg-slate-800/40 p-3">
										<p class="text-sm leading-relaxed text-orange-100/90 italic">
											"{review.description}"
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
