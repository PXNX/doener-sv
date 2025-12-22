<!-- src/routes/doener/[id]/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentHeart20Filled from '~icons/fluent/heart-20-filled';
	import FluentHeart20Regular from '~icons/fluent/heart-20-regular';
	import type { PageData } from './$types';

	let { data }: Props = $props();

	interface Props {
		data: PageData;
	}

	const FAVORITES_KEY = 'doener_favorites';
	let isFavorite = $state(false);

	// Check if restaurant is in favorites
	$effect(() => {
		if (browser) {
			try {
				const stored = localStorage.getItem(FAVORITES_KEY);
				const favorites: string[] = stored ? JSON.parse(stored) : [];
				isFavorite = favorites.includes(data.restaurant.id);
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
				favorites = favorites.filter((id) => id !== data.restaurant.id);
			} else {
				favorites.push(data.restaurant.id);
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

	const renderStars = (rating: number) => {
		return '⭐'.repeat(rating);
	};

	const ratingColor = $derived(
		data.restaurant.averageRating >= 4.5
			? 'text-yellow-400'
			: data.restaurant.averageRating >= 3.5
				? 'text-orange-400'
				: 'text-red-400'
	);

	const ratingBg = $derived(
		data.restaurant.averageRating >= 4.5
			? 'bg-yellow-400/20 border-yellow-400/40'
			: data.restaurant.averageRating >= 3.5
				? 'bg-orange-400/20 border-orange-400/40'
				: 'bg-red-400/20 border-red-400/40'
	);
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
				{#if data.latestReviewImage}
					<img
						src={data.latestReviewImage}
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

				<!-- Rating -->
				<div class="mb-4 flex items-center gap-4">
					<div class="flex items-center gap-2 rounded-xl border px-4 py-2 {ratingBg}">
						<FluentStar20Filled class="size-6 {ratingColor}" />
						<span class="font-bold {ratingColor} text-2xl">
							{data.restaurant.averageRating?.toFixed(1) || 'N/A'}
						</span>
					</div>
					<div class="text-orange-300/90">
						<div class="text-xl font-semibold">
							{data.restaurant.reviewCount} review{data.restaurant.reviewCount !== 1 ? 's' : ''}
						</div>
						<div class="text-sm">Based on community ratings</div>
					</div>
				</div>

				<!-- Most Common Criteria -->
				<div class="mb-4">
					<h3 class="mb-2 text-sm font-semibold text-orange-300">What to expect here:</h3>
					<div class="flex flex-wrap gap-2">
						{#if data.criteria.mostCommonBreadSesame}
							<span class="badge border-amber-400/40 bg-amber-500/20 text-amber-200"
								>🌰 Sesame seeds</span
							>
						{/if}
						{#if data.criteria.mostCommonBreadFluffy}
							<span class="badge border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
								>☁️ Fluffy bread</span
							>
						{/if}
						{#if data.criteria.mostCommonBreadCrispy}
							<span class="badge border-orange-400/40 bg-orange-500/20 text-orange-200"
								>🔥 Crispy outside</span
							>
						{/if}
						{#if data.criteria.mostCommonMeatType}
							<span class="badge border-red-400/40 bg-red-500/20 text-red-200">
								🥩 {data.criteria.mostCommonMeatType === 'minced' ? 'Minced' : 'Layered'} meat
							</span>
						{/if}
						{#if data.criteria.mostCommonMeatProtein}
							<span class="badge border-orange-500/40 bg-orange-600/20 text-orange-200">
								{#if data.criteria.mostCommonMeatProtein === 'chicken'}🐔{:else if data.criteria.mostCommonMeatProtein === 'beef'}🐄{:else}🍖{/if}
								{data.criteria.mostCommonMeatProtein.charAt(0).toUpperCase() +
									data.criteria.mostCommonMeatProtein.slice(1)}
							</span>
						{/if}
						{#if data.criteria.mostCommonSpiceLevel}
							<span
								class="badge bg-{data.criteria.mostCommonSpiceLevel === 'spicy'
									? 'red'
									: 'green'}-500/20 border-{data.criteria.mostCommonSpiceLevel === 'spicy'
									? 'red'
									: 'green'}-400/40 text-{data.criteria.mostCommonSpiceLevel === 'spicy'
									? 'red'
									: 'green'}-200"
							>
								{data.criteria.mostCommonSpiceLevel === 'spicy' ? '🌶️ Spicy' : '🌿 Mild'}
							</span>
						{/if}
						{#if data.criteria.mostCommonYoghurtSauce}
							<span class="badge border-blue-300/40 bg-blue-400/20 text-blue-200"
								>🥛 Yoghurt sauce</span
							>
						{/if}
						{#if data.criteria.mostCommonGarlicSauce}
							<span class="badge border-purple-300/40 bg-purple-400/20 text-purple-200"
								>🧄 Garlic sauce</span
							>
						{/if}
					</div>
				</div>

				<!-- Action Button -->
				<a
					href="/doener/create?restaurant={data.restaurant.id}"
					class="btn border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
				>
					<FluentAdd24Regular class="size-5" />
					Add Your Review
				</a>
			</div>
		</div>
	</div>
</div>

<!-- Reviews Section -->
<div class="mb-6">
	<h2 class="mb-4 text-2xl font-bold text-white">Community Reviews ({data.reviews.length})</h2>

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
		<div class="space-y-4">
			{#each data.reviews as review}
				<div
					class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
				>
					<div class="card-body p-4">
						<div class="flex flex-col gap-4 md:flex-row">
							<!-- Review Image -->
							{#if review.imageUrl}
								<div class="shrink-0">
									<img
										src={review.imageUrl}
										alt="Döner"
										class="h-40 w-full rounded-lg border-2 border-orange-500/30 object-cover md:w-40"
									/>
								</div>
							{/if}

							<!-- Review Content -->
							<div class="flex-1">
								<div class="mb-3 flex items-start justify-between gap-4">
									<div>
										<div class="mb-1 flex items-center gap-2">
											<span class="font-semibold text-white">{review.user.name}</span>
											<span class="text-sm text-orange-300/70"
												>• {formatDate(review.createdAt)}</span
											>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-2xl">{renderStars(review.overallRating)}</span>
											<span class="text-lg font-bold text-yellow-400">{review.overallRating}/5</span
											>
										</div>
									</div>
								</div>

								<!-- Review Criteria -->
								<div class="mb-3 flex flex-wrap gap-2">
									<!-- Bread -->
									{#if review.breadHasSesame}
										<span class="badge badge-xs border-amber-400/40 bg-amber-500/20 text-amber-200"
											>🌰 Sesame</span
										>
									{/if}
									{#if review.breadFluffyInside}
										<span
											class="badge badge-xs border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
											>☁️ Fluffy</span
										>
									{/if}
									{#if review.breadCrispyOutside}
										<span
											class="badge badge-xs border-orange-400/40 bg-orange-500/20 text-orange-200"
											>🔥 Crispy</span
										>
									{/if}

									<!-- Meat -->
									<span class="badge badge-xs border-red-400/40 bg-red-500/20 text-red-200">
										🥩 {review.meatType === 'minced' ? 'Minced' : 'Layered'}
									</span>
									<span
										class="badge badge-xs border-orange-500/40 bg-orange-600/20 text-orange-200"
									>
										{#if review.meatProtein === 'chicken'}🐔{:else if review.meatProtein === 'beef'}🐄{:else}🍖{/if}
										{review.meatProtein.charAt(0).toUpperCase() + review.meatProtein.slice(1)}
									</span>
									<span class="badge badge-xs border-pink-400/40 bg-pink-500/20 text-pink-200">
										{review.meatSeasoning === 'pure'
											? '🧂 Pure'
											: review.meatSeasoning === 'seasoned'
												? '🌶️ Seasoned'
												: '💧 Phosphate'}
									</span>

									<!-- Toppings -->
									{#if review.hasOnions}
										<span
											class="badge badge-xs border-purple-400/40 bg-purple-500/20 text-purple-200"
											>🧅 Onions</span
										>
									{/if}
									<span
										class="badge badge-xs bg-{review.spiceLevel === 'spicy'
											? 'red'
											: 'green'}-500/20 border-{review.spiceLevel === 'spicy'
											? 'red'
											: 'green'}-400/40 text-{review.spiceLevel === 'spicy' ? 'red' : 'green'}-200"
									>
										{review.spiceLevel === 'spicy' ? '🌶️ Spicy' : '🌿 Mild'}
									</span>

									<!-- Sauces -->
									{#if review.hasYoghurtSauce}
										<span class="badge badge-xs border-blue-300/40 bg-blue-400/20 text-blue-200"
											>🥛 Yoghurt</span
										>
									{/if}
									{#if review.hasGarlicSauce}
										<span
											class="badge badge-xs border-purple-300/40 bg-purple-400/20 text-purple-200"
											>🧄 Garlic</span
										>
									{/if}
								</div>

								<!-- Review Notes -->
								{#if review.notes}
									<div class="rounded-lg border border-orange-500/20 bg-slate-800/40 p-3">
										<p class="text-sm leading-relaxed text-orange-100/90 italic">
											"{review.notes}"
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
