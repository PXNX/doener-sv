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

	// Reviews state — lazy loaded
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
				const res = await fetch(`/doener/${data.restaurant.id}/reviews`);
				if (res.ok) reviews = await res.json();
			} catch (e) {
				console.error('Failed to load reviews', e);
			} finally {
				reviewsLoading = false;
				reviewsLoaded = true;
			}
		}
	}

	async function upvote(reviewId: number) {
		// Optimistic update
		reviews = reviews.map((r) => (r.id === reviewId ? { ...r, upvotes: (r.upvotes ?? 0) + 1 } : r));

		try {
			const res = await fetch(`/doener/${data.restaurant.id}/reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reviewId })
			});
			if (res.ok) {
				const { upvotes } = await res.json();
				reviews = reviews.map((r) => (r.id === reviewId ? { ...r, upvotes } : r));
			}
		} catch {}
	}

	const sortedReviews = $derived(() => {
		const r = [...reviews];
		if (sortBy === 'highest') return r.sort((a, b) => b.overallRating - a.overallRating);
		if (sortBy === 'lowest') return r.sort((a, b) => a.overallRating - b.overallRating);
		return r;
	});

	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function rc(r: number) {
		if (r >= 3.5) return 'text-green-400';
		if (r >= 2.5) return 'text-blue-400';
		if (r >= 1.5) return 'text-yellow-400';
		return 'text-orange-400';
	}
	function rb(r: number) {
		if (r >= 3.5) return 'bg-green-400/20 border-green-400/40';
		if (r >= 2.5) return 'bg-blue-400/20 border-blue-400/40';
		if (r >= 1.5) return 'bg-yellow-400/20 border-yellow-400/40';
		return 'bg-orange-400/20 border-orange-400/40';
	}
	function rl(r: number) {
		if (r >= 3.5) return 'Excellent';
		if (r >= 2.5) return 'Good';
		if (r >= 1.5) return 'Average';
		return 'Sub Average';
	}
	function barW(v: number | null) {
		return v != null ? `${(v / 4) * 100}%` : '0%';
	}

	const a = $derived(data.aggregate);
	const overall = $derived(a?.avgOverall ?? data.restaurant.averageOverallRating ?? 0);

	const googleMapsUrl = $derived(
		`https://www.google.com/maps/search/?api=1&query=${data.restaurant.latitude},${data.restaurant.longitude}`
	);

	const sauceEmoji: Record<string, string> = { Herbal: '🌿', Yoghurt: '🥛', Garlic: '🧄', Cocktail: '🍹', Spicy: '🌶️' };
	const proteinEmoji: Record<string, string> = { Chicken: '🐔', Beef: '🐄', Lamb: '🐑' };
	const veggieEmoji: Record<string, string> = { Tomatoes: '🍅', Cabbage: '🥬', Rucola: '🌿', Corn: '🌽', Parsley: '🌱' };
</script>

<svelte:head>
	<title>{data.restaurant.name} - Döner Finder</title>
</svelte:head>

<BackButton href="/" />

<!-- ========== HERO CARD ========== -->
<div class="card mb-4 border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md">
	<div class="card-body p-5">
		<div class="flex flex-col gap-5 lg:flex-row">
			<div class="shrink-0">
				{#if data.restaurant.doenerImage}
					<img src={data.restaurant.doenerImage} alt={data.restaurant.name} class="h-56 w-full rounded-xl border-2 border-orange-500/30 object-cover shadow-lg lg:w-56" />
				{:else}
					<div class="flex h-56 w-full items-center justify-center rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/40 to-red-600/40 lg:w-56">
						<span class="text-7xl">🥙</span>
					</div>
				{/if}
			</div>

			<div class="flex-1 space-y-3">
				<div>
					<h1 class="text-2xl font-bold text-white lg:text-3xl">{data.restaurant.name}</h1>
					<a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" class="mt-1 flex w-fit items-center gap-1.5 text-orange-300/80 transition-colors hover:text-orange-200">
						<FluentLocation20Filled class="size-4" />
						<span>{data.restaurant.city}, {data.restaurant.country}</span>
						<FluentChevronRight20Regular class="size-3.5" />
					</a>
				</div>

				<div class="flex items-center gap-2">
					<div class="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 {rb(overall)}">
						<FluentStar20Filled class="size-5 {rc(overall)}" />
						<span class="text-xl font-bold {rc(overall)}">{overall > 0 ? overall.toFixed(1) : 'N/A'}</span>
					</div>
					<button onclick={toggleFavorite} class="btn btn-circle {isFavorite ? 'btn-warning' : 'btn-outline btn-warning'} transition-transform hover:scale-110" title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
						{#if isFavorite}<FluentHeart20Filled class="size-5" />{:else}<FluentHeart20Regular class="size-5" />{/if}
					</button>
				</div>

				{#if a}
					<div class="flex flex-wrap gap-2">
						{#if a.avgPrice != null}
							<div class="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-sm">
								<span class="text-green-300">💰 ~€{a.avgPrice.toFixed(1)}</span>
								{#if a.minPrice != null && a.maxPrice != null && a.minPrice !== a.maxPrice}
									<span class="text-xs text-green-400/60">(€{a.minPrice.toFixed(0)}–{a.maxPrice.toFixed(0)})</span>
								{/if}
							</div>
						{/if}
						{#each a.topProteins as p}
							<span class="badge badge-sm border-red-400/40 bg-red-500/20 text-red-200">{proteinEmoji[p.label] || '🍖'} {p.label} <span class="opacity-60">{p.pct}%</span></span>
						{/each}
						{#if a.mostCommonMeatType}
							<span class="badge badge-sm border-orange-400/40 bg-orange-500/20 text-orange-200">🥩 {a.mostCommonMeatType === 'minced' ? 'Minced' : 'Layered'}</span>
						{/if}
						{#each (a.topSauces ?? []).filter((s) => s.pct >= 30) as s}
							<span class="badge badge-sm border-blue-300/40 bg-blue-400/20 text-blue-200">{sauceEmoji[s.label] || '🫗'} {s.label}</span>
						{/each}
					</div>
				{/if}

				{#if data.user && !data.userHasReviewed}
					<a href="/doener/{data.restaurant.id}/review" class="btn btn-sm border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500">
						<FluentAdd24Regular class="size-4" /> Add Your Review
					</a>
				{:else if data.userHasReviewed}
					<div class="inline-flex items-center gap-1.5 text-sm text-green-300"><span>✓</span> You've reviewed this döner</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- ========== AGGREGATE BREAKDOWN ========== -->
{#if a}
	<div class="mb-4 space-y-3">
		<!-- Radar chart -->
		<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
			<h2 class="mb-2 text-sm font-semibold tracking-wide text-gray-400 uppercase">Rating Breakdown</h2>
			<RadarChart axes={[
				{ emoji: '🥩', label: 'Meat', value: a.avgMeat },
				{ emoji: '🍞', label: 'Bread', value: a.avgBread },
				{ emoji: '🥬', label: 'Veggies', value: a.avgVeggies },
				{ emoji: '🫗', label: 'Sauce', value: a.avgSauce },
				{ emoji: '⭐', label: 'Flavor', value: a.avgFlavor },
				{ emoji: '🧹', label: 'Hygiene', value: a.avgCleanliness }
			]} />
		</div>

		<!-- Meat & Bread details -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
				<h3 class="mb-2.5 text-sm font-semibold tracking-wide text-gray-400 uppercase">🥩 Meat Profile</h3>
				<div class="space-y-2">
					{#each [{ l: 'Juiciness', v: a.avgJuiciness }, { l: 'Crispiness', v: a.avgMeatCrispiness }, { l: 'Dry Feel', v: a.avgDryFeel }, { l: 'Fattiness', v: a.avgFatty }] as row}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400">{row.l}</span>
							<div class="flex items-center gap-1.5">
								<div class="flex gap-0.5">
									{#each [1, 2, 3, 4] as dot}
										<div class="size-2 rounded-full {(row.v ?? 0) >= dot ? 'bg-orange-400' : 'bg-slate-600'}"></div>
									{/each}
								</div>
								<span class="w-6 text-right text-xs text-gray-500">{row.v != null ? row.v.toFixed(1) : '–'}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
				<h3 class="mb-2.5 text-sm font-semibold tracking-wide text-gray-400 uppercase">🍞 Bread Profile</h3>
				<div class="space-y-2">
					{#each [{ l: 'Thickness', v: a.avgThickness }, { l: 'Crispiness', v: a.avgBreadCrispiness }, { l: 'Fluffy', v: a.avgFluffy }] as row}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400">{row.l}</span>
							<div class="flex items-center gap-1.5">
								<div class="flex gap-0.5">
									{#each [1, 2, 3, 4] as dot}
										<div class="size-2 rounded-full {(row.v ?? 0) >= dot ? 'bg-amber-400' : 'bg-slate-600'}"></div>
									{/each}
								</div>
								<span class="w-6 text-right text-xs text-gray-500">{row.v != null ? row.v.toFixed(1) : '–'}</span>
							</div>
						</div>
					{/each}
					{#if a.sesamePct > 0}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400">Sesame Seeds</span>
							<span class="text-xs text-amber-300">{a.sesamePct}% of reviews</span>
						</div>
					{/if}
					{#if a.shapes.length > 0}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400">Shape</span>
							<div class="flex gap-1">
								{#each a.shapes as s}
									<span class="badge badge-xs border-amber-400/30 bg-amber-500/15 text-amber-200">{s.label} <span class="opacity-50">{s.pct}%</span></span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Veggies & Sauces -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#if (a.topVeggies ?? []).length > 0}
				<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
					<h3 class="mb-2.5 text-sm font-semibold tracking-wide text-gray-400 uppercase">🥬 Veggies Reported</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each a.topVeggies as v}
							<span class="badge badge-sm border-green-400/30 bg-green-500/15 text-green-200">{veggieEmoji[v.label] || '🥗'} {v.label} <span class="ml-0.5 opacity-50">{v.pct}%</span></span>
						{/each}
					</div>
				</div>
			{/if}
			{#if (a.topSauces ?? []).length > 0}
				<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
					<h3 class="mb-2.5 text-sm font-semibold tracking-wide text-gray-400 uppercase">🫗 Sauces Reported</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each a.topSauces as s}
							<span class="badge badge-sm border-blue-300/30 bg-blue-400/15 text-blue-200">{sauceEmoji[s.label] || '🫗'} {s.label} <span class="ml-0.5 opacity-50">{s.pct}%</span></span>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		{#if (a.sizes ?? []).length > 0}
			<div class="rounded-xl border border-white/5 bg-slate-800/50 p-4">
				<h3 class="mb-2.5 text-sm font-semibold tracking-wide text-gray-400 uppercase">📏 Portion Size</h3>
				<div class="flex gap-2">
					{#each a.sizes as s}
						<div class="flex-1 rounded-lg border border-white/5 bg-slate-700/40 p-2 text-center">
							<div class="text-lg">{s.label === 'small' ? '🤏' : s.label === 'medium' ? '👌' : '💪'}</div>
							<div class="text-xs font-medium capitalize text-gray-300">{s.label}</div>
							<div class="text-xs text-gray-500">{s.pct}%</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="card mb-4 border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md">
		<div class="card-body items-center py-10">
			<div class="text-5xl">📝</div>
			<p class="mt-2 text-orange-200/80">No reviews yet — be the first!</p>
			{#if data.user}
				<a href="/doener/{data.restaurant.id}/review" class="btn btn-sm mt-3 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white">
					<FluentAdd24Regular class="size-4" /> Write a Review
				</a>
			{/if}
		</div>
	</div>
{/if}

<!-- ========== INDIVIDUAL REVIEWS (lazy loaded) ========== -->
{#if data.restaurant.reviewCount > 0}
	<div class="mb-6">
		<button
			onclick={toggleReviews}
			class="mb-3 flex w-full items-center justify-between rounded-xl border border-white/5 bg-slate-800/50 px-4 py-3 transition-colors hover:bg-slate-800/70"
		>
			<h2 class="text-lg font-semibold text-white">Individual Reviews ({data.restaurant.reviewCount})</h2>
			{#if showReviews}
				<FluentChevronUp20Regular class="size-5 text-gray-400" />
			{:else}
				<FluentChevronDown20Regular class="size-5 text-gray-400" />
			{/if}
		</button>

		{#if showReviews}
			{#if reviewsLoading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-lg text-orange-400"></span>
				</div>
			{:else}
				<!-- Sort -->
				<div class="mb-3 flex gap-1.5">
					{#each [{ k: 'recent', l: 'Recent' }, { k: 'highest', l: 'Best' }, { k: 'lowest', l: 'Worst' }] as s}
						<button
							onclick={() => (sortBy = s.k as any)}
							class="btn btn-xs {sortBy === s.k ? 'btn-primary' : 'btn-ghost text-gray-400 hover:text-white'}"
						>{s.l}</button>
					{/each}
				</div>

				<div class="space-y-3">
					{#each sortedReviews() as review (review.id)}
						<div class="rounded-xl border border-white/5 bg-slate-800/40 p-4">
							<!-- Header: date + rating + upvote -->
							<div class="mb-2.5 flex items-center justify-between">
								<span class="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
								<div class="flex items-center gap-2">
									<!-- Upvote button -->
									<button
										onclick={() => upvote(review.id)}
										class="flex items-center gap-1 rounded-md border border-white/10 bg-slate-700/50 px-2 py-0.5 text-xs transition-colors hover:border-orange-400/40 hover:bg-orange-500/15 hover:text-orange-300 active:scale-95"
										title="Helpful"
									>
										<span>👍</span>
										<span class="font-medium">{review.upvotes ?? 0}</span>
									</button>
									<div class="flex items-center gap-1 rounded-md border px-1.5 py-0.5 {rb(review.overallRating)}">
										<FluentStar20Filled class="size-3 {rc(review.overallRating)}" />
										<span class="text-xs font-bold {rc(review.overallRating)}">{review.overallRating.toFixed(1)}</span>
									</div>
								</div>
							</div>

							<!-- Review photo -->
							{#if review.reviewImageUrl}
								<img src={review.reviewImageUrl} alt="Döner" class="mb-2.5 h-40 w-full rounded-lg border border-white/10 object-cover" />
							{/if}

							<!-- Rating bars compact -->
							<div class="mb-2.5 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
								{#each [{ l: 'Meat', v: review.meatRating }, { l: 'Bread', v: review.breadRating }, { l: 'Veggies', v: review.veggiesRating }, { l: 'Sauce', v: review.sauceRating }, { l: 'Flavor', v: review.overallFlavorRating }, { l: 'Hygiene', v: review.cleanlinessRating }] as cat}
									<div class="flex items-center gap-2">
										<span class="w-14 text-xs text-gray-500">{cat.l}</span>
										<div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
											<div
												class="absolute inset-y-0 left-0 rounded-full {cat.v != null && cat.v >= 3.5 ? 'bg-green-500' : cat.v != null && cat.v >= 2.5 ? 'bg-blue-500' : cat.v != null && cat.v >= 1.5 ? 'bg-yellow-500' : 'bg-orange-500'}"
												style="width: {barW(cat.v ?? 0)}"
											></div>
										</div>
										<span class="w-4 text-right text-[10px] text-gray-500">{cat.v ?? '–'}</span>
									</div>
								{/each}
							</div>

							<!-- Tags -->
							<div class="mb-2 flex flex-wrap gap-1">
								{#if review.meatChicken}<span class="badge badge-xs border-red-400/30 bg-red-500/15 text-red-200">🐔 Chicken</span>{/if}
								{#if review.meatBeef}<span class="badge badge-xs border-red-400/30 bg-red-500/15 text-red-200">🐄 Beef</span>{/if}
								{#if review.meatLamb}<span class="badge badge-xs border-amber-400/30 bg-amber-500/15 text-amber-200">🐑 Lamb</span>{/if}
								{#if review.meatStyle}<span class="badge badge-xs border-orange-400/30 bg-orange-500/15 text-orange-200">🥩 {review.meatStyle === 'minced' ? 'Minced' : 'Layered'}</span>{/if}
								{#if review.breadShape}<span class="badge badge-xs border-amber-400/30 bg-amber-500/15 text-amber-200">🍞 {review.breadShape}</span>{/if}
								{#if review.breadSesameSeeds}<span class="badge badge-xs border-amber-400/30 bg-amber-500/15 text-amber-200">🌰 Sesame</span>{/if}
								{#if review.hasHerbalSauce}<span class="badge badge-xs border-green-300/30 bg-green-400/15 text-green-200">🌿 Herbal</span>{/if}
								{#if review.hasYoghurtSauce}<span class="badge badge-xs border-blue-300/30 bg-blue-400/15 text-blue-200">🥛 Yoghurt</span>{/if}
								{#if review.hasGarlicSauce}<span class="badge badge-xs border-purple-300/30 bg-purple-400/15 text-purple-200">🧄 Garlic</span>{/if}
								{#if review.hasCocktailSauce}<span class="badge badge-xs border-pink-300/30 bg-pink-400/15 text-pink-200">🍹 Cocktail</span>{/if}
								{#if review.hasSpicySauce}<span class="badge badge-xs border-red-300/30 bg-red-400/15 text-red-200">🌶️ Spicy</span>{/if}
								{#if review.doenerSize}<span class="badge badge-xs border-slate-400/30 bg-slate-500/15 text-slate-300">📏 {review.doenerSize}</span>{/if}
								{#if review.price != null}<span class="badge badge-xs border-green-400/30 bg-green-500/15 text-green-200">💰 €{review.price.toFixed(2)}</span>{/if}
							</div>

							{#if review.description}
								<p class="rounded-lg bg-slate-900/40 p-2.5 text-sm leading-relaxed text-gray-300 italic">"{review.description}"</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}
