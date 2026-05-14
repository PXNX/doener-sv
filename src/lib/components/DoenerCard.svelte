<script lang="ts">
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import type { DoenerRestaurantResult } from '$lib/types';
	import PreviewImage from './PreviewImage.svelte';

	interface Props {
		restaurant: DoenerRestaurantResult;
	}

	let { restaurant }: Props = $props();

	const rating = $derived(restaurant.averageRating ?? 0);

	function ratingColor(r: number) {
		if (r >= 3.5) return 'text-green-400';
		if (r >= 2.5) return 'text-blue-400';
		if (r >= 1.5) return 'text-yellow-400';
		return 'text-orange-400';
	}
	function ratingBg(r: number) {
		if (r >= 3.5) return 'bg-green-400/20 border-green-400/40';
		if (r >= 2.5) return 'bg-blue-400/20 border-blue-400/40';
		if (r >= 1.5) return 'bg-yellow-400/20 border-yellow-400/40';
		return 'bg-orange-400/20 border-orange-400/40';
	}

	const sauceEmoji: Record<string, string> = {
		Herbal: '🌿',
		Yoghurt: '🥛',
		Garlic: '🧄',
		Cocktail: '🍹',
		Spicy: '🌶️'
	};
	const proteinEmoji: Record<string, string> = {
		Chicken: '🐔',
		Beef: '🐄',
		Lamb: '🐑'
	};
</script>

<a
	href="/doener/{restaurant.id}"
	class="card group overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-600/20"
	style="view-transition-name: restaurant-{restaurant.id}"
>
	<div class="card-body p-0">
		<div class="flex flex-col items-start gap-4 p-4 sm:flex-row">
			<PreviewImage
				src={restaurant.latestReviewImage ?? restaurant.doenerImage}
				alt={restaurant.name}
				class="size-32"
			/>

			<div class="min-w-0 flex-1">
				<!-- Name + Location -->
				<div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0 flex-1">
						<h3
							class="truncate text-xl font-bold text-white transition-colors group-hover:text-orange-200"
						>
							{restaurant.name}
						</h3>
						<div class="mt-0.5 flex items-center gap-1.5 text-sm text-orange-300/80">
							<FluentLocation20Filled class="size-3.5 shrink-0" />
							<span class="truncate">{restaurant.city}, {restaurant.country}</span>
							{#if restaurant.distance !== undefined}
								<span class="text-xs text-gray-500">• {restaurant.distance.toFixed(1)} km</span>
							{/if}
						</div>
					</div>

					<!-- Rating pill -->
					{#if restaurant.reviewCount > 0}
						<div class="flex shrink-0 items-center gap-2">
							<div
								class="flex items-center gap-1 rounded-lg border px-2.5 py-1 {ratingBg(rating)}"
							>
								<FluentStar20Filled class="size-4 {ratingColor(rating)}" />
								<span class="text-base font-bold {ratingColor(rating)}">
									{rating.toFixed(1)}
								</span>
							</div>
							<span class="text-xs text-gray-400">
								{restaurant.reviewCount} review{restaurant.reviewCount !== 1 ? 's' : ''}
							</span>
						</div>
					{:else}
						<span class="badge badge-sm border-slate-600 bg-slate-700/50 text-gray-400"
							>No reviews</span
						>
					{/if}
				</div>

				<!-- Tags row — review-derived -->
				{#if restaurant.reviewCount > 0}
					<div class="mt-2 flex flex-wrap gap-1.5">
						<!-- Proteins -->
						{#each restaurant.topProteins.slice(0, 2) as p}
							<span class="badge badge-sm border-red-400/40 bg-red-500/20 text-red-200">
								{proteinEmoji[p.label] || '🍖'} {p.label}
								<span class="ml-0.5 opacity-60">{p.pct}%</span>
							</span>
						{/each}

						<!-- Meat style -->
						{#if restaurant.mostCommonMeatType}
							<span class="badge badge-sm border-orange-400/40 bg-orange-500/20 text-orange-200">
								🥩 {restaurant.mostCommonMeatType === 'minced' ? 'Minced' : 'Layered'}
							</span>
						{/if}

						<!-- Sauces -->
						{#each restaurant.topSauces.filter((s) => s.pct >= 40).slice(0, 3) as s}
							<span class="badge badge-sm border-blue-300/40 bg-blue-400/20 text-blue-200">
								{sauceEmoji[s.label] || '🫗'} {s.label}
							</span>
						{/each}

						<!-- Price -->
						{#if restaurant.avgPrice != null}
							<span class="badge badge-sm border-green-400/40 bg-green-500/20 text-green-200">
								💰 ~€{restaurant.avgPrice.toFixed(1)}
							</span>
						{/if}

						<!-- Bread highlights -->
						{#if restaurant.mostCommonBreadSesame}
							<span class="badge badge-sm border-amber-400/40 bg-amber-500/20 text-amber-200"
								>🌰 Sesame</span
							>
						{/if}
						{#if restaurant.mostCommonBreadCrispy}
							<span class="badge badge-sm border-orange-400/40 bg-orange-500/20 text-orange-200"
								>🔥 Crispy</span
							>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Arrow -->
			<div class="hidden shrink-0 items-center self-center sm:flex">
				<FluentArrowRight24Regular
					class="size-8 text-orange-400/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-orange-300"
				/>
			</div>
		</div>
	</div>
</a>
