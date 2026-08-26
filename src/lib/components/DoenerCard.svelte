<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentChevronRight20Regular from '~icons/fluent/chevron-right-20-regular';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import { t } from '$lib/i18n';
	import type { TranslationKey } from '$lib/i18n/messages';
	import type { DoenerRestaurantResult } from '$lib/types';
	import PreviewImage from './PreviewImage.svelte';

	interface Props {
		restaurant: DoenerRestaurantResult;
		position?: number;
		rankingLabel?: string;
	}

	let { restaurant, position, rankingLabel = 'Overall rating' }: Props = $props();
	let opening = $state(false);
	const rating = $derived(restaurant.averageRating ?? 0);

	function ratingColor(value: number) {
		if (value >= 4.5) return 'text-emerald-300';
		if (value >= 3.5) return 'text-sky-300';
		if (value >= 2.5) return 'text-amber-300';
		return 'text-orange-300';
	}

	const sauceEmoji: Record<string, string> = {
		Herbal: '🌿',
		Yoghurt: '🥛',
		Garlic: '🧄',
		Cocktail: '🍹',
		Spicy: '🌶️'
	};
	const proteinEmoji: Record<string, string> = { Chicken: '🐔', Beef: '🐄', Lamb: '🐑' };
	const proteinTranslationKey: Record<string, TranslationKey> = {
		Chicken: 'protein.chicken',
		Beef: 'protein.beef',
		Lamb: 'protein.lamb'
	};
	const sauceTranslationKey: Record<string, TranslationKey> = {
		Herbal: 'sauce.herbal',
		Yoghurt: 'sauce.yoghurt',
		Garlic: 'sauce.garlic',
		Cocktail: 'sauce.cocktail',
		Spicy: 'sauce.spicy'
	};

	function translatedLabel(value: string, translations: Record<string, TranslationKey>): string {
		return translations[value] ? $t(translations[value]) : value;
	}

	function openRestaurant(event: MouseEvent): void {
		event.preventDefault();
		if (opening) return;

		opening = true;
		requestAnimationFrame(() => {
			void goto(`/doener/${restaurant.id}`);
		});
	}
</script>

<a
	href="/doener/{restaurant.id}"
	onclick={openRestaurant}
	aria-label={$t('card.openRestaurant', { name: restaurant.name })}
	aria-busy={opening}
	class="group relative flex items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-3 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-950 hover:shadow-xl hover:shadow-black/30 sm:p-4"
	style="view-transition-name: restaurant-{restaurant.id}"
>
	<div class="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-800 sm:h-36 sm:w-44">
		<PreviewImage
			src={restaurant.latestReviewImage ?? restaurant.doenerImage}
			alt={restaurant.name}
			class="size-full rounded-none transition-transform duration-500 group-hover:scale-105"
		/>
		{#if position}
			<div
				class="absolute top-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] font-bold text-white backdrop-blur"
			>
				#{position}
			</div>
		{/if}
		{#if restaurant.distance !== undefined}
			<div
				class="absolute right-2 bottom-2 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur"
			>
				{restaurant.distance.toFixed(1)} km
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1 py-0.5">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<h3
					class="truncate text-lg font-bold text-white transition-colors group-hover:text-orange-100 sm:text-xl"
				>
					{restaurant.name}
				</h3>
				<div class="mt-1 flex items-center gap-1.5 text-sm text-white/55">
					<FluentLocation20Filled class="size-3.5 shrink-0 text-orange-300" />
					<span class="truncate">{restaurant.city}, {restaurant.country}</span>
				</div>
			</div>
			<div class="ml-auto flex shrink-0 items-start gap-2">
				{#if restaurant.reviewCount > 0}
					<div class="text-right">
						<p class="text-[10px] font-semibold tracking-[0.12em] text-white/40 uppercase">
							{rankingLabel}
						</p>
						<div class="mt-1 flex items-center justify-end gap-1">
							<FluentStar20Filled class="size-4 {ratingColor(rating)}" />
							<span class="text-xl font-black leading-none {ratingColor(rating)}"
								>{rating.toFixed(1)}</span
							>
						</div>
					</div>
				{/if}
				<span
					class="mt-0.5 inline-flex size-8 items-center justify-center rounded-full bg-slate-800 text-orange-200 transition-colors group-hover:bg-orange-500 group-hover:text-white"
					aria-hidden="true"
				>
					{#if opening}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<FluentChevronRight20Regular class="size-5" />
					{/if}
				</span>
			</div>
		</div>

		{#if restaurant.reviewCount > 0}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{#each (restaurant.topProteins ?? []).slice(0, 2) as protein}
					<span
						class="rounded-full border border-red-400/25 bg-red-400/10 px-2 py-0.5 text-xs text-red-100"
						>{proteinEmoji[protein.label] || '🍖'}
						{translatedLabel(protein.label, proteinTranslationKey)}</span
					>
				{/each}
				{#if restaurant.mostCommonMeatType}<span
						class="rounded-full border border-orange-400/25 bg-orange-400/10 px-2 py-0.5 text-xs text-orange-100"
						>🥩 {restaurant.mostCommonMeatType === 'minced'
							? $t('card.meat.minced')
							: $t('card.meat.layered')}</span
					>{/if}
				{#each (restaurant.topSauces ?? []).filter((sauce) => sauce.pct >= 40).slice(0, 2) as sauce}
					<span
						class="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-100"
						>{sauceEmoji[sauce.label] || '🫗'}
						{translatedLabel(sauce.label, sauceTranslationKey)}</span
					>
				{/each}
				{#if restaurant.avgPrice != null}<span
						class="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-100"
						>€{restaurant.avgPrice.toFixed(1)}</span
					>{/if}
			</div>
		{/if}
	</div>
</a>
