<script lang="ts">
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import type { DoenerRestaurantResult } from '$lib/types';
	import PreviewImage from './PreviewImage.svelte';

	interface Props {
		restaurant: DoenerRestaurantResult;
		position?: number;
		rankingLabel?: string;
	}

	let { restaurant, position, rankingLabel = 'Overall score' }: Props = $props();

	const rating = $derived(restaurant.averageRating ?? 0);
	const scoreLabel = $derived(
		rating >= 3.5
			? 'Exceptional'
			: rating >= 2.5
				? 'Worth a stop'
				: rating >= 1.5
					? 'Mixed notes'
					: 'New listing'
	);

	function ratingColor(r: number) {
		if (r >= 3.5) return 'text-emerald-300';
		if (r >= 2.5) return 'text-sky-300';
		if (r >= 1.5) return 'text-amber-300';
		return 'text-orange-300';
	}
	function ratingBg(r: number) {
		if (r >= 3.5) return 'border-emerald-400/40 bg-emerald-400/10';
		if (r >= 2.5) return 'border-sky-400/40 bg-sky-400/10';
		if (r >= 1.5) return 'border-amber-400/40 bg-amber-400/10';
		return 'border-orange-400/40 bg-orange-400/10';
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
	class="group relative grid overflow-hidden rounded-2xl border border-white/8 bg-slate-900/55 p-3 shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:bg-slate-800/80 hover:shadow-orange-950/30 sm:grid-cols-[9rem_1fr] sm:gap-5 sm:p-4"
	style="view-transition-name: restaurant-{restaurant.id}"
>
	<div class="relative overflow-hidden rounded-xl border border-white/8 bg-slate-800">
		<PreviewImage
			src={restaurant.latestReviewImage ?? restaurant.doenerImage}
			alt={restaurant.name}
			class="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
		/>
		{#if position}
			<div
				class="absolute top-2 left-2 rounded-full border border-white/10 bg-slate-950/75 px-2 py-1 text-[11px] font-bold tracking-wide text-orange-200 backdrop-blur"
			>
				#{position}
			</div>
		{/if}
		{#if restaurant.distance !== undefined}
			<div
				class="absolute right-2 bottom-2 rounded-full bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur"
			>
				{restaurant.distance.toFixed(1)} km
			</div>
		{/if}
	</div>

	<div class="min-w-0 pt-3 sm:pt-0">
		<div class="flex gap-3">
			<div class="min-w-0 flex-1">
				<div
					class="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-orange-300 uppercase"
				>
					<FluentLocation20Filled class="size-3.5 shrink-0" />
					<span class="truncate">{restaurant.city}, {restaurant.country}</span>
				</div>
				<h3
					class="truncate text-xl font-bold text-white transition-colors group-hover:text-orange-100"
				>
					{restaurant.name}
				</h3>
				<p class="mt-1 text-sm text-slate-400">{scoreLabel}</p>
			</div>

			{#if restaurant.reviewCount > 0}
				<div class="shrink-0 text-right">
					<div
						class="flex items-center justify-end gap-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase"
					>
						{rankingLabel}
					</div>
					<div
						class="mt-1 flex items-center justify-end gap-1.5 rounded-xl border px-2.5 py-1.5 {ratingBg(
							rating
						)}"
						aria-label={`${rankingLabel}: ${rating.toFixed(1)} out of 4`}
					>
						<FluentStar20Filled class="size-4 {ratingColor(rating)}" />
						<span class="text-xl font-black leading-none {ratingColor(rating)}"
							>{rating.toFixed(1)}</span
						>
					</div>
				</div>
			{/if}
		</div>

		{#if restaurant.reviewCount > 0}
			<div class="mt-4 flex flex-wrap gap-1.5">
				{#each (restaurant.topProteins ?? []).slice(0, 2) as protein}
					<span
						class="rounded-full border border-red-400/25 bg-red-400/10 px-2 py-1 text-xs font-medium text-red-100"
					>
						{proteinEmoji[protein.label] || '🍖'}
						{protein.label}
					</span>
				{/each}
				{#if restaurant.mostCommonMeatType}
					<span
						class="rounded-full border border-orange-400/25 bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-100"
					>
						🥩 {restaurant.mostCommonMeatType === 'minced' ? 'Minced' : 'Layered'}
					</span>
				{/if}
				{#each (restaurant.topSauces ?? []).filter((sauce) => sauce.pct >= 40).slice(0, 2) as sauce}
					<span
						class="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-1 text-xs font-medium text-sky-100"
					>
						{sauceEmoji[sauce.label] || '🫗'}
						{sauce.label}
					</span>
				{/each}
				{#if restaurant.avgPrice != null}
					<span
						class="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-100"
					>
						€{restaurant.avgPrice.toFixed(1)} avg.
					</span>
				{/if}
			</div>
		{/if}

		<div
			class="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-300 transition-all group-hover:gap-3"
		>
			<span>View tasting profile</span>
			<FluentArrowRight24Regular class="size-4" />
		</div>
	</div>
</a>
