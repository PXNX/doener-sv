<script lang="ts">
	import { browser } from '$app/environment';
	import BackButton from '$lib/components/BackButton.svelte';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import FluentHeart20Filled from '~icons/fluent/heart-20-filled';
	import FluentHeart20Regular from '~icons/fluent/heart-20-regular';
	import FluentChevronDown20Regular from '~icons/fluent/chevron-down-20-regular';
	import FluentChevronUp20Regular from '~icons/fluent/chevron-up-20-regular';
	import FluentChevronRight20Regular from '~icons/fluent/chevron-right-20-regular';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const FAVORITES_KEY = 'doener_favorites';
	let isFavorite = $state(false);
	let showReviews = $state(false);
	let reviews = $state<any[]>([]);
	let reviewsLoading = $state(false);
	let reviewsLoaded = $state(false);
	let sortBy = $state<'recent' | 'highest' | 'lowest'>('recent');

	$effect(() => {
		if (browser) {
			try {
				const stored = localStorage.getItem(FAVORITES_KEY);
				const favorites: string[] = stored ? JSON.parse(stored) : [];
				isFavorite = favorites.includes(data.restaurant.id.toString());
			} catch {}
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
		} catch {}
	}

	async function toggleReviews() {
		showReviews = !showReviews;
		if (showReviews && !reviewsLoaded) {
			reviewsLoading = true;
			try {
				const response = await fetch(`/doener/${data.restaurant.id}/reviews`);
				if (response.ok) reviews = await response.json();
			} catch (error) {
				console.error('Failed to load reviews', error);
			} finally {
				reviewsLoading = false;
				reviewsLoaded = true;
			}
		}
	}

	async function upvote(reviewId: number) {
		reviews = reviews.map((review) =>
			review.id === reviewId ? { ...review, upvotes: (review.upvotes ?? 0) + 1 } : review
		);
		try {
			const response = await fetch(`/doener/${data.restaurant.id}/reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reviewId })
			});
			if (response.ok) {
				const { upvotes } = await response.json();
				reviews = reviews.map((review) =>
					review.id === reviewId ? { ...review, upvotes } : review
				);
			}
		} catch {}
	}

	const sortedReviews = $derived(() => {
		const values = [...reviews];
		if (sortBy === 'highest') return values.sort((a, b) => b.overallRating - a.overallRating);
		if (sortBy === 'lowest') return values.sort((a, b) => a.overallRating - b.overallRating);
		return values;
	});

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	function rc(rating: number) {
		if (rating >= 3.5) return 'text-emerald-300';
		if (rating >= 2.5) return 'text-sky-300';
		if (rating >= 1.5) return 'text-amber-300';
		return 'text-orange-300';
	}
	function rb(rating: number) {
		if (rating >= 3.5) return 'border-emerald-400/40 bg-emerald-400/10';
		if (rating >= 2.5) return 'border-sky-400/40 bg-sky-400/10';
		if (rating >= 1.5) return 'border-amber-400/40 bg-amber-400/10';
		return 'border-orange-400/40 bg-orange-400/10';
	}
	function scoreLabel(rating: number) {
		if (rating >= 3.5) return 'Exceptional stop';
		if (rating >= 2.5) return 'Strong pick';
		if (rating >= 1.5) return 'Mixed tasting notes';
		return 'Awaiting tasting notes';
	}
	function barWidth(value: number | null) {
		return value != null ? `${(value / 4) * 100}%` : '0%';
	}

	const a = $derived(data.aggregate);
	const overall = $derived(a?.avgOverall ?? data.restaurant.averageOverallRating ?? 0);
	const googleMapsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${data.restaurant.latitude},${data.restaurant.longitude}`
	);
	const primaryMeatStyle = $derived(a?.topStyles?.[0]?.label ?? null);
	const scoreCards = $derived([
		{
			label: 'Meat',
			emoji: '🥩',
			value: a?.avgMeat ?? null,
			tone: 'from-red-500/20 to-orange-500/5'
		},
		{
			label: 'Bread',
			emoji: '🍞',
			value: a?.avgBread ?? null,
			tone: 'from-amber-500/20 to-orange-500/5'
		},
		{
			label: 'Veggies',
			emoji: '🥬',
			value: a?.avgVeggies ?? null,
			tone: 'from-emerald-500/20 to-green-500/5'
		},
		{
			label: 'Sauce',
			emoji: '🫗',
			value: a?.avgSauce ?? null,
			tone: 'from-sky-500/20 to-blue-500/5'
		}
	]);

	const sauceEmoji: Record<string, string> = {
		Herbal: '🌿',
		Yoghurt: '🥛',
		Garlic: '🧄',
		Cocktail: '🍹',
		Spicy: '🌶️'
	};
	const proteinEmoji: Record<string, string> = { Chicken: '🐔', Beef: '🐄', Lamb: '🐑' };
	const veggieEmoji: Record<string, string> = {
		Tomatoes: '🍅',
		Cabbage: '🥬',
		Rucola: '🌿',
		Corn: '🌽',
		Parsley: '🌱'
	};
</script>

<svelte:head>
	<title>{data.restaurant.name} — Döner Rating</title>
</svelte:head>

<BackButton href="/" />

<section
	class="relative mb-5 overflow-hidden rounded-3xl border border-orange-400/25 bg-slate-900 shadow-2xl shadow-orange-950/25"
>
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.26),_transparent_42%),linear-gradient(135deg,_rgba(127,29,29,0.42),_rgba(15,23,42,0.95)_56%)]"
	></div>
	<div class="relative grid gap-0 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
		<div class="relative min-h-72 overflow-hidden bg-slate-800 lg:min-h-full">
			{#if data.restaurant.doenerImage}
				<img
					src={data.restaurant.doenerImage}
					alt={data.restaurant.name}
					class="absolute inset-0 h-full w-full object-cover"
				/>
			{:else}
				<div
					class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500/35 to-red-800/35 text-9xl"
				>
					🥙
				</div>
			{/if}
			<div
				class="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/85 to-transparent"
			></div>
			<div
				class="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-orange-200 uppercase backdrop-blur"
			>
				Tasting dossier
			</div>
		</div>

		<div class="relative p-5 sm:p-8 lg:py-10">
			<div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<div class="min-w-0">
					<p class="text-[11px] font-bold tracking-[0.16em] text-orange-300 uppercase">
						Döner profile
					</p>
					<h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
						{data.restaurant.name}
					</h1>
					<a
						href={googleMapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-orange-200"
					>
						<FluentLocation20Filled class="size-4 text-orange-300" />
						<span>{data.restaurant.city}, {data.restaurant.country}</span>
						<FluentChevronRight20Regular class="size-4" />
					</a>
				</div>
				<button
					onclick={toggleFavorite}
					class="btn btn-circle border {isFavorite
						? 'border-orange-300 bg-orange-400 text-slate-950 hover:bg-orange-300'
						: 'border-white/15 bg-white/5 text-orange-200 hover:border-orange-300 hover:bg-orange-300/10'}"
					title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
				>
					{#if isFavorite}<FluentHeart20Filled class="size-5" />{:else}<FluentHeart20Regular
							class="size-5"
						/>{/if}
				</button>
			</div>

			<div class="mt-7 flex flex-wrap items-end gap-4">
				<div class="rounded-2xl border px-4 py-3 {rb(overall)}">
					<div class="flex items-center gap-2">
						<FluentStar20Filled class="size-5 {rc(overall)}" />
						<span class="text-4xl font-black leading-none {rc(overall)}"
							>{overall > 0 ? overall.toFixed(1) : '—'}</span
						>
						<span class="self-end pb-0.5 text-sm font-semibold text-slate-300">/ 4</span>
					</div>
					<p class="mt-1 text-xs font-semibold text-slate-300">{scoreLabel(overall)}</p>
				</div>
				<div class="pb-1 text-sm text-slate-400">
					<p class="font-semibold text-slate-200">A profile built from community tasting notes.</p>
					{#if a?.avgPrice != null}<p class="mt-1 text-emerald-200">
							Typical spend: €{a.avgPrice.toFixed(1)}
						</p>{/if}
				</div>
			</div>

			<div class="mt-7 flex flex-wrap gap-2">
				{#if data.user && !data.userHasReviewed}
					<a
						href="/doener/{data.restaurant.id}/review"
						class="btn border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-900/25 hover:from-orange-400 hover:to-red-400"
					>
						<FluentAdd24Regular class="size-4" /> Add your tasting note
					</a>
				{:else if data.userHasReviewed}
					<span
						class="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100"
						>✓ Your tasting note is on this profile</span
					>
				{/if}
				<a
					href={googleMapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn border-white/12 bg-white/5 text-slate-100 hover:border-orange-300/50 hover:bg-orange-400/10"
					>Open directions</a
				>
			</div>
		</div>
	</div>
</section>

{#if a}
	<section class="mb-5" aria-label="Taste scorecard">
		<div class="mb-3 flex items-end justify-between gap-4">
			<div>
				<p class="text-[11px] font-bold tracking-[0.16em] text-orange-300 uppercase">Scorecard</p>
				<h2 class="mt-1 text-2xl font-bold text-white">How the Döner tastes</h2>
			</div>
			<p class="hidden text-sm text-slate-400 sm:block">Each score is measured out of four.</p>
		</div>

		<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{#each scoreCards as score}
				<div class="rounded-2xl border border-white/8 bg-gradient-to-br {score.tone} p-4">
					<div class="flex items-start justify-between gap-2">
						<span class="text-xl">{score.emoji}</span>
						<span class="text-2xl font-black text-white"
							>{score.value != null ? score.value.toFixed(1) : '—'}</span
						>
					</div>
					<p class="mt-4 text-sm font-semibold text-slate-200">{score.label}</p>
					<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/45">
						<div
							class="h-full rounded-full bg-white/75"
							style={`width: ${barWidth(score.value)}`}
						></div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
			<div class="rounded-2xl border border-white/8 bg-slate-900/55 p-5">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="font-semibold text-white">Flavor geometry</h3>
					<span class="text-xs text-slate-500">6 dimensions</span>
				</div>
				<RadarChart
					axes={[
						{ emoji: '🥩', label: 'Meat', value: a.avgMeat },
						{ emoji: '🍞', label: 'Bread', value: a.avgBread },
						{ emoji: '🥬', label: 'Veggies', value: a.avgVeggies },
						{ emoji: '🫗', label: 'Sauce', value: a.avgSauce },
						{ emoji: '⭐', label: 'Flavor', value: a.avgFlavor },
						{ emoji: '🧹', label: 'Hygiene', value: a.avgCleanliness }
					]}
				/>
			</div>
			<div class="rounded-2xl border border-white/8 bg-slate-900/55 p-5">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="font-semibold text-white">At a glance</h3>
					<span class="text-xs text-slate-500">Community patterns</span>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<p class="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
							Protein & style
						</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each a.topProteins as protein}<span
									class="rounded-full border border-red-400/25 bg-red-400/10 px-2 py-1 text-xs text-red-100"
									>{proteinEmoji[protein.label] || '🍖'} {protein.label}</span
								>{/each}
							{#if primaryMeatStyle}<span
									class="rounded-full border border-orange-400/25 bg-orange-400/10 px-2 py-1 text-xs text-orange-100"
									>🥩 {primaryMeatStyle === 'minced' ? 'Minced' : 'Layered'}</span
								>{/if}
						</div>
					</div>
					<div>
						<p class="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">Sauces</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each a.topSauces as sauce}<span
									class="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-1 text-xs text-sky-100"
									>{sauceEmoji[sauce.label] || '🫗'} {sauce.label}</span
								>{/each}
						</div>
					</div>
					<div>
						<p class="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
							Veggie signals
						</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each a.topVeggies as veggie}<span
									class="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100"
									>{veggieEmoji[veggie.label] || '🥗'} {veggie.label}</span
								>{/each}
						</div>
					</div>
					<div>
						<p class="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
							Value & build
						</p>
						<div class="mt-2 space-y-1 text-sm text-slate-300">
							{#if a.avgPrice != null}<p>
									Average €{a.avgPrice.toFixed(1)}
									{#if a.minPrice != null && a.maxPrice != null && a.minPrice !== a.maxPrice}<span
											class="text-slate-500"
											>(€{a.minPrice.toFixed(0)}–{a.maxPrice.toFixed(0)})</span
										>{/if}
								</p>{/if}
							{#if (a.avgBreadCrispiness ?? 0) >= 3}<p>🔥 Often described as crisp</p>{/if}
							{#if a.sesamePct >= 50}<p>🌰 Sesame appears frequently</p>{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-3 grid gap-3 md:grid-cols-2">
			<div class="rounded-2xl border border-white/8 bg-slate-900/45 p-5">
				<p class="text-[11px] font-bold tracking-[0.14em] text-orange-300 uppercase">
					Texture notes
				</p>
				<h3 class="mt-1 font-semibold text-white">Meat & bread</h3>
				<div class="mt-4 space-y-3">
					{#each [{ label: 'Meat juiciness', value: a.avgJuiciness }, { label: 'Meat crispiness', value: a.avgMeatCrispiness }, { label: 'Bread crispiness', value: a.avgBreadCrispiness }, { label: 'Bread fluffiness', value: a.avgFluffy }] as metric}
						<div>
							<div class="mb-1 flex items-center justify-between text-sm">
								<span class="text-slate-300">{metric.label}</span><span
									class="font-semibold text-orange-200"
									>{metric.value != null ? metric.value.toFixed(1) : '—'}</span
								>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-slate-800">
								<div
									class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
									style={`width: ${barWidth(metric.value)}`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="rounded-2xl border border-white/8 bg-slate-900/45 p-5">
				<p class="text-[11px] font-bold tracking-[0.14em] text-orange-300 uppercase">
					Serving notes
				</p>
				<h3 class="mt-1 font-semibold text-white">Portion & bread shape</h3>
				<div class="mt-4 grid grid-cols-3 gap-2">
					{#each a.sizes as size}
						<div class="rounded-xl border border-white/8 bg-slate-800/70 p-3 text-center">
							<p class="text-xl">
								{size.label === 'small' ? '🤏' : size.label === 'medium' ? '👌' : '💪'}
							</p>
							<p class="mt-1 text-xs font-semibold capitalize text-slate-200">{size.label}</p>
							<p class="text-xs text-slate-500">{size.pct}%</p>
						</div>
					{/each}
					{#if a.sizes.length === 0}<p class="col-span-3 text-sm text-slate-500">
							No portion-size notes yet.
						</p>{/if}
				</div>
			</div>
		</div>
	</section>
{:else}
	<section
		class="mb-5 rounded-3xl border border-orange-400/25 bg-gradient-to-br from-orange-500/10 to-slate-900 p-8 text-center"
	>
		<div class="text-5xl">📝</div>
		<p class="mt-4 text-lg font-semibold text-white">
			This profile is waiting for its first tasting note.
		</p>
		<p class="mt-1 text-sm text-slate-400">
			Add a review to shape the scorecard and taste profile.
		</p>
		{#if data.user}<a
				href="/doener/{data.restaurant.id}/review"
				class="btn mt-5 border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white"
				><FluentAdd24Regular class="size-4" /> Write the first review</a
			>{/if}
	</section>
{/if}

{#if data.restaurant.reviewCount > 0}
	<section
		class="mb-6 rounded-3xl border border-white/8 bg-slate-900/45 p-4 sm:p-5"
		aria-label="Community reviews"
	>
		<button
			onclick={toggleReviews}
			class="flex w-full items-center justify-between gap-4 text-left"
		>
			<div>
				<p class="text-[11px] font-bold tracking-[0.16em] text-orange-300 uppercase">
					Community notes
				</p>
				<h2 class="mt-1 text-xl font-bold text-white">Individual tasting reports</h2>
			</div>
			<div class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
				{#if showReviews}<FluentChevronUp20Regular
						class="size-5"
					/>{:else}<FluentChevronDown20Regular class="size-5" />{/if}
			</div>
		</button>

		{#if showReviews}
			{#if reviewsLoading}
				<div class="flex justify-center py-12">
					<span class="loading loading-spinner loading-lg text-orange-400"></span>
				</div>
			{:else}
				<div class="mt-5 flex flex-wrap gap-2">
					{#each [{ key: 'recent', label: 'Latest' }, { key: 'highest', label: 'Highest score' }, { key: 'lowest', label: 'Lowest score' }] as option}
						<button
							onclick={() => (sortBy = option.key as typeof sortBy)}
							class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors {sortBy ===
							option.key
								? 'border-orange-300 bg-orange-400 text-slate-950'
								: 'border-white/10 bg-white/5 text-slate-300 hover:border-orange-300/50'}"
							>{option.label}</button
						>
					{/each}
				</div>

				<div class="mt-4 grid gap-3 lg:grid-cols-2">
					{#each sortedReviews() as review (review.id)}
						<article class="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
									<p class="mt-1 text-sm font-semibold text-slate-200">Community tasting note</p>
								</div>
								<div class="flex items-center gap-2">
									<button
										onclick={() => upvote(review.id)}
										class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:border-orange-300/50"
										>👍 {review.upvotes ?? 0}</button
									>
									<div
										class="flex items-center gap-1 rounded-lg border px-2 py-1 {rb(
											review.overallRating
										)}"
									>
										<FluentStar20Filled class="size-3.5 {rc(review.overallRating)}" /><span
											class="text-sm font-bold {rc(review.overallRating)}"
											>{review.overallRating.toFixed(1)}</span
										>
									</div>
								</div>
							</div>
							{#if review.reviewImageUrl}<img
									src={review.reviewImageUrl}
									alt="Döner review"
									class="mt-4 h-48 w-full rounded-xl border border-white/8 object-cover"
								/>{/if}
							<div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
								{#each [{ label: 'Meat', value: review.meatRating }, { label: 'Bread', value: review.breadRating }, { label: 'Veggies', value: review.veggiesRating }, { label: 'Sauce', value: review.sauceRating }, { label: 'Flavor', value: review.overallFlavorRating }, { label: 'Hygiene', value: review.cleanlinessRating }] as metric}
									<div>
										<div class="mb-1 flex justify-between text-[11px] text-slate-500">
											<span>{metric.label}</span><span>{metric.value ?? '—'}</span>
										</div>
										<div class="h-1 rounded-full bg-slate-800">
											<div
												class="h-full rounded-full bg-orange-400"
												style={`width: ${barWidth(metric.value ?? 0)}`}
											></div>
										</div>
									</div>
								{/each}
							</div>
							{#if review.description}<p
									class="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-slate-300"
								>
									“{review.description}”
								</p>{/if}
						</article>
					{/each}
				</div>
			{/if}
		{/if}
	</section>
{/if}
