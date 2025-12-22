<!-- src/routes/my-reviews/+page.svelte -->
<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentAdd24Regular from '~icons/fluent/add-24-regular';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

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
</script>

<svelte:head>
	<title>My Reviews - Döner Finder</title>
</svelte:head>

<BackButton href="/" />

<header class="mb-8 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentFood20Filled class="size-12 text-white" />
		</div>
	</div>
	<h1 class="text-3xl font-bold text-white">My Döner Reviews</h1>
	<p class="mt-2 text-lg text-orange-200/90">
		You've contributed {data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''}
	</p>
</header>

{#if data.reviews.length === 0}
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<div class="text-8xl">🥙</div>
			<h3 class="text-2xl font-bold text-white">No reviews yet</h3>
			<p class="max-w-md text-center text-lg text-orange-200/90">
				Start contributing to the community by reviewing your favorite döner spots!
			</p>
			<a
				href="/doener/create"
				class="btn btn-lg mt-4 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				<FluentAdd24Regular class="size-5" />
				Add Your First Review
			</a>
		</div>
	</div>
{:else}
	<div class="space-y-4">
		{#each data.reviews as review}
			<a
				href="/doener/restaurant/{review.restaurant.id}"
				class="card group border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-600/20"
			>
				<div class="card-body p-0">
					<div class="flex flex-col items-start gap-4 p-4 sm:flex-row">
						<!-- Review Image -->
						<div class="w-full shrink-0 sm:w-32">
							{#if review.imageUrl}
								<img
									src={review.imageUrl}
									alt="Döner"
									class="h-32 w-full rounded-lg border-2 border-orange-500/30 object-cover sm:w-32"
								/>
							{:else}
								<div
									class="flex h-32 w-full items-center justify-center rounded-lg border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/40 to-red-600/40 sm:w-32"
								>
									<span class="text-6xl">🥙</span>
								</div>
							{/if}
						</div>

						<!-- Review Info -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0 flex-1">
									<h3
										class="truncate text-xl font-bold text-white transition-colors duration-200 group-hover:text-orange-200"
									>
										{review.restaurant.name}
									</h3>
									<div class="mt-1 flex items-center gap-2 text-sm text-orange-300/90">
										<FluentLocation20Filled class="size-4 shrink-0" />
										<span class="truncate"
											>{review.restaurant.city}, {review.restaurant.country}</span
										>
									</div>
									<p class="mt-1 text-xs text-orange-300/70">
										Reviewed on {formatDate(review.createdAt)}
									</p>
								</div>

								<!-- Rating -->
								<div class="flex shrink-0 items-center gap-2">
									<div
										class="flex items-center gap-1 rounded-lg border border-yellow-400/40 bg-yellow-400/20 px-3 py-1.5"
									>
										<FluentStar20Filled class="size-5 text-yellow-400" />
										<span class="text-lg font-bold text-yellow-400">
											{review.overallRating}
										</span>
									</div>
								</div>
							</div>

							<!-- Criteria Tags -->
							<div class="mt-3 flex flex-wrap gap-2">
								<!-- Bread -->
								{#if review.breadHasSesame}
									<span class="badge badge-sm border-amber-400/40 bg-amber-500/20 text-amber-200">
										🌰 Sesame
									</span>
								{/if}
								{#if review.breadFluffyInside}
									<span
										class="badge badge-sm border-yellow-400/40 bg-yellow-500/20 text-yellow-200"
									>
										☁️ Fluffy
									</span>
								{/if}
								{#if review.breadCrispyOutside}
									<span
										class="badge badge-sm border-orange-400/40 bg-orange-500/20 text-orange-200"
									>
										🔥 Crispy
									</span>
								{/if}

								<!-- Meat -->
								<span class="badge badge-sm border-red-400/40 bg-red-500/20 text-red-200">
									🥩 {review.meatType === 'minced' ? 'Minced' : 'Layered'}
								</span>
								<span class="badge badge-sm border-orange-500/40 bg-orange-600/20 text-orange-200">
									{#if review.meatProtein === 'chicken'}🐔{:else if review.meatProtein === 'beef'}🐄{:else}🍖{/if}
									{review.meatProtein.charAt(0).toUpperCase() + review.meatProtein.slice(1)}
								</span>

								<!-- Spice & Sauces -->
								{#if review.spiceLevel === 'spicy'}
									<span class="badge badge-sm border-red-400/40 bg-red-500/20 text-red-200">
										🌶️ Spicy
									</span>
								{:else}
									<span class="badge badge-sm border-green-400/40 bg-green-500/20 text-green-200">
										🌿 Mild
									</span>
								{/if}

								{#if review.hasYoghurtSauce}
									<span class="badge badge-sm border-blue-300/40 bg-blue-400/20 text-blue-200">
										🥛 Yoghurt
									</span>
								{/if}
								{#if review.hasGarlicSauce}
									<span
										class="badge badge-sm border-purple-300/40 bg-purple-400/20 text-purple-200"
									>
										🧄 Garlic
									</span>
								{/if}
							</div>

							<!-- Notes -->
							{#if review.notes}
								<div class="mt-3 rounded-lg border border-orange-500/20 bg-slate-800/40 p-2">
									<p class="line-clamp-2 text-sm text-orange-100/80 italic">
										"{review.notes}"
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}
