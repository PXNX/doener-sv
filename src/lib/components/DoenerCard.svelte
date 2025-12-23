<!-- src/lib/components/DoenerCard.svelte -->
<script lang="ts">
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import type { DoenerRestaurantResult } from '$lib/types';

	interface Props {
		restaurant: DoenerRestaurantResult;
	}

	let { restaurant }: Props = $props();

	const ratingColor = $derived(
		restaurant.averageRating >= 4.5
			? 'text-yellow-400'
			: restaurant.averageRating >= 3.5
				? 'text-orange-400'
				: 'text-red-400'
	);

	const ratingBg = $derived(
		restaurant.averageRating >= 4.5
			? 'bg-yellow-400/20 border-yellow-400/40'
			: restaurant.averageRating >= 3.5
				? 'bg-orange-400/20 border-orange-400/40'
				: 'bg-red-400/20 border-red-400/40'
	);
</script>

<a
	href="/doener/{restaurant.id}"
	class="card group overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-600/20"
	style="view-transition-name: restaurant-{restaurant.id}"
>
	<div class="card-body p-0">
		<div class="flex flex-col items-start gap-4 p-4 sm:flex-row">
			<!-- Restaurant Image -->
			<div class="w-full shrink-0 sm:w-32" style="view-transition-name: image-{restaurant.id}">
				{#if restaurant.doenerImage}
					<img
						src={restaurant.doenerImage}
						alt={restaurant.name}
						class="h-32 w-full rounded-lg border-2 border-orange-500/30 object-cover shadow-lg transition-all group-hover:border-orange-500/60 sm:w-32"
					/>
				{:else}
					<div
						class="flex h-32 w-full items-center justify-center rounded-lg border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/40 to-red-600/40 sm:w-32"
					>
						<span class="text-6xl">🥙</span>
					</div>
				{/if}
			</div>

			<!-- Restaurant Info -->
			<div class="min-w-0 flex-1">
				<div class="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0 flex-1">
						<h3
							class="truncate text-xl font-bold text-white transition-colors duration-200 group-hover:text-orange-200"
						>
							{restaurant.name}
						</h3>
						<div class="mt-1 flex items-center gap-2 text-sm text-orange-300/90">
							<FluentLocation20Filled class="size-4 shrink-0" />
							<span class="truncate">{restaurant.city}, {restaurant.country}</span>
						</div>
					</div>

					<!-- Rating Badge -->
					<div class="flex shrink-0 items-center gap-3">
						<div class="flex items-center gap-1 rounded-lg border px-3 py-1.5 {ratingBg}">
							<FluentStar20Filled class="size-5 {ratingColor}" />
							<span class="font-bold {ratingColor} text-lg">
								{restaurant.averageRating?.toFixed(1) || 'N/A'}
							</span>
						</div>
						<div class="text-sm text-orange-300/70">
							{restaurant.reviewCount} review{restaurant.reviewCount !== 1 ? 's' : ''}
						</div>
					</div>
				</div>

				<!-- Criteria Tags - Most Common -->
				<div class="mt-3 flex flex-wrap gap-2">
					<!-- Bread Tags -->
					{#if restaurant.breadHasSesame}
						<span class="badge badge-sm border-amber-400/40 bg-amber-500/20 text-amber-200">
							🌰 Sesame
						</span>
					{/if}
					{#if restaurant.breadFluffyInside}
						<span class="badge badge-sm border-yellow-400/40 bg-yellow-500/20 text-yellow-200">
							☁️ Fluffy
						</span>
					{/if}
					{#if restaurant.breadCrispyOutside}
						<span class="badge badge-sm border-orange-400/40 bg-orange-500/20 text-orange-200">
							🔥 Crispy
						</span>
					{/if}

					<!-- Meat Tags -->
					{#if restaurant.meatType === 'minced'}
						<span class="badge badge-sm border-red-400/40 bg-red-500/20 text-red-200">
							🥩 Minced
						</span>
					{:else if restaurant.meatType === 'layered'}
						<span class="badge badge-sm border-red-500/40 bg-red-600/20 text-red-200">
							🥓 Layered
						</span>
					{/if}

					{#if restaurant.meatProtein === 'chicken'}
						<span class="badge badge-sm border-orange-500/40 bg-orange-600/20 text-orange-200">
							🐔 Chicken
						</span>
					{:else if restaurant.meatProtein === 'beef'}
						<span class="badge badge-sm border-red-600/40 bg-red-700/20 text-red-200">
							🐄 Beef
						</span>
					{:else if restaurant.meatProtein === 'lamb'}
						<span class="badge badge-sm border-purple-500/40 bg-purple-600/20 text-purple-200">
							🐑 Lamb
						</span>
					{:else if restaurant.meatProtein === 'mixed'}
						<span class="badge badge-sm border-pink-400/40 bg-pink-500/20 text-pink-200">
							🍖 Mixed
						</span>
					{/if}

					<!-- Sauces -->
					{#if restaurant.hasYoghurtSauce}
						<span class="badge badge-sm border-blue-300/40 bg-blue-400/20 text-blue-200">
							🥛 Yoghurt
						</span>
					{/if}
					{#if restaurant.hasGarlicSauce}
						<span class="badge badge-sm border-purple-300/40 bg-purple-400/20 text-purple-200">
							🧄 Garlic
						</span>
					{/if}
				</div>
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
