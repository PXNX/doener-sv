<!-- src/routes/admin/reviews/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';

	let { data } = $props();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Admin - Manage Reviews</title>
</svelte:head>

<BackButton href="/" label="Back to Home" />

<header class="mb-8 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600"
		>
			<span class="text-4xl">🛡️</span>
		</div>
	</div>
	<h1 class="text-3xl font-bold text-white">Review Management</h1>
	<p class="mt-2 text-lg text-orange-200/90">
		{data.reviews.length} total review{data.reviews.length !== 1 ? 's' : ''} in database
	</p>
</header>

{#if data.reviews.length === 0}
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body items-center justify-center py-12">
			<p class="text-lg text-orange-200/90">No reviews in the database yet.</p>
		</div>
	</div>
{:else}
	<div class="space-y-4">
		{#each data.reviews as review}
			<div
				class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
			>
				<div class="card-body p-4">
					<div class="flex flex-col gap-4 sm:flex-row">
						<!-- Image from restaurant -->
						<div class="w-full shrink-0 sm:w-24">
							{#if review.imageUrl}
								<img
									src={review.imageUrl}
									alt={review.restaurant.name}
									class="h-24 w-full rounded-lg border-2 border-orange-500/30 object-cover sm:w-24"
								/>
							{:else}
								<div
									class="flex h-24 w-full items-center justify-center rounded-lg border-2 border-orange-500/30 bg-gradient-to-br from-orange-600/40 to-red-600/40 sm:w-24"
								>
									<span class="text-4xl">🥙</span>
								</div>
							{/if}
						</div>

						<!-- Info -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0 flex-1">
									<h3 class="truncate text-lg font-bold text-white">
										{review.restaurant.name}
									</h3>
									<div class="flex items-center gap-2 text-sm text-orange-300/90">
										<FluentLocation20Filled class="size-4 shrink-0" />
										<span class="truncate"
											>{review.restaurant.city}, {review.restaurant.country}</span
										>
									</div>
								</div>

								<div class="flex items-center gap-2">
									<div
										class="flex items-center gap-1 rounded-lg border border-yellow-400/40 bg-yellow-400/20 px-2 py-1"
									>
										<FluentStar20Filled class="size-4 text-yellow-400" />
										<span class="text-sm font-bold text-yellow-400">
											{review.rating}
										</span>
									</div>
								</div>
							</div>

							<div class="mb-2 text-xs text-orange-300/70">
								By <strong>{review.user.name}</strong> ({review.user.email}) on {formatDate(
									review.createdAt
								)}
							</div>

							<!-- Döner Characteristics from restaurant -->
							<div class="mb-2 flex flex-wrap gap-1">
								<span class="badge badge-xs bg-amber-500/20 text-amber-200"
									>{review.restaurant.breadShape}</span
								>
								{#if review.restaurant.breadHasSesame}<span
										class="badge badge-xs bg-amber-500/20 text-amber-200">Sesame</span
									>{/if}
								{#if review.restaurant.breadFluffyInside}<span
										class="badge badge-xs bg-yellow-500/20 text-yellow-200">Fluffy</span
									>{/if}
								{#if review.restaurant.breadCrispyOutside}<span
										class="badge badge-xs bg-orange-500/20 text-orange-200">Crispy</span
									>{/if}
								<span class="badge badge-xs bg-red-500/20 text-red-200"
									>{review.restaurant.meatType}</span
								>
								<span class="badge badge-xs bg-orange-600/20 text-orange-200"
									>{review.restaurant.meatProtein}</span
								>
								{#if review.restaurant.onionLevel}<span
										class="badge badge-xs bg-purple-500/20 text-purple-200"
										>{review.restaurant.onionLevel} onions</span
									>{/if}
								{#if review.restaurant.krautLevel}<span
										class="badge badge-xs bg-green-500/20 text-green-200"
										>{review.restaurant.krautLevel} kraut</span
									>{/if}
							</div>

							<!-- Review Description -->
							{#if review.description}
								<p
									class="line-clamp-2 rounded border border-orange-500/20 bg-slate-800/40 p-2 text-sm text-orange-100/80"
								>
									"{review.description}"
								</p>
							{/if}
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 gap-2 sm:flex-col">
							<a
								href="/doener/{review.restaurant.id}"
								class="btn btn-sm btn-ghost text-orange-300 hover:text-white"
							>
								View
							</a>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="reviewId" value={review.id} />
								<button
									type="submit"
									class="btn btn-sm btn-error btn-outline"
									onclick={(e) => {
										if (
											!confirm(
												'Are you sure you want to delete this review? This cannot be undone.'
											)
										) {
											e.preventDefault();
										}
									}}
								>
									<FluentDelete24Regular class="size-4" />
									Delete
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
