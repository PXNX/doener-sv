<!-- src/routes/admin/doener/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
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
	<title>Admin - Manage Döner Listings</title>
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
	<h1 class="text-3xl font-bold text-white">Döner Listing Management</h1>
	<p class="mt-2 text-lg text-orange-200/90">
		{data.restaurants.length} total döner listing{data.restaurants.length !== 1 ? 's' : ''} in database
	</p>
</header>

{#if data.restaurants.length === 0}
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body items-center justify-center py-12">
			<p class="text-lg text-orange-200/90">No döner listings in the database yet.</p>
		</div>
	</div>
{:else}
	<div class="space-y-4">
		{#each data.restaurants as restaurant}
			<div
				class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
			>
				<div class="card-body p-4">
					<div class="flex flex-col gap-4 sm:flex-row">
						<!-- Image -->
						<div class="w-full shrink-0 sm:w-32">
							{#if restaurant.imageUrl}
								<img
									src={restaurant.imageUrl}
									alt={restaurant.name}
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

						<!-- Info -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div class="min-w-0 flex-1">
									<h3 class="truncate text-xl font-bold text-white">
										{restaurant.name}
									</h3>
									<div class="flex items-center gap-2 text-sm text-orange-300/90">
										<FluentLocation20Filled class="size-4 shrink-0" />
										<span class="truncate">{restaurant.city}, {restaurant.country}</span>
									</div>
								</div>

								<div class="flex items-center gap-2">
									{#if restaurant.averageRating}
										<div
											class="flex items-center gap-1 rounded-lg border border-yellow-400/40 bg-yellow-400/20 px-2 py-1"
										>
											<FluentStar20Filled class="size-4 text-yellow-400" />
											<span class="text-sm font-bold text-yellow-400">
												{restaurant.averageRating.toFixed(1)}
											</span>
										</div>
									{/if}
									<span class="badge badge-sm bg-blue-500/20 text-blue-200">
										{restaurant.reviewCount} review{restaurant.reviewCount !== 1 ? 's' : ''}
									</span>
								</div>
							</div>

							<div class="mb-2 text-xs text-orange-300/70">
								Added by <strong>{restaurant.addedBy.name}</strong> ({restaurant.addedBy.email}) on {formatDate(
									restaurant.createdAt
								)}
								{#if restaurant.updatedAt !== restaurant.createdAt}
									<br />Last updated: {formatDate(restaurant.updatedAt)}
								{/if}
							</div>

							<!-- Döner Characteristics -->
							<div class="mb-2 flex flex-wrap gap-1">
								<!-- Bread -->
								<span class="badge badge-xs bg-amber-500/20 text-amber-200"
									>{restaurant.breadShape}</span
								>
								{#if restaurant.breadHasSesame}
									<span class="badge badge-xs bg-amber-500/20 text-amber-200">Sesame</span>
								{/if}
								{#if restaurant.breadFluffyInside}
									<span class="badge badge-xs bg-yellow-500/20 text-yellow-200">Fluffy</span>
								{/if}
								{#if restaurant.breadCrispyOutside}
									<span class="badge badge-xs bg-orange-500/20 text-orange-200">Crispy</span>
								{/if}

								<!-- Meat -->
								<span class="badge badge-xs bg-red-500/20 text-red-200">{restaurant.meatType}</span>
								<span class="badge badge-xs bg-orange-600/20 text-orange-200"
									>{restaurant.meatProtein}</span
								>
								<span class="badge badge-xs bg-pink-500/20 text-pink-200"
									>{restaurant.meatSeasoning}</span
								>

								<!-- Toppings -->
								{#if restaurant.onionLevel}
									<span class="badge badge-xs bg-purple-500/20 text-purple-200"
										>{restaurant.onionLevel} onions</span
									>
								{/if}
								{#if restaurant.krautLevel}
									<span class="badge badge-xs bg-green-500/20 text-green-200"
										>{restaurant.krautLevel} kraut</span
									>
								{/if}

								<!-- Sauces -->
								{#if restaurant.hasYoghurtSauce}
									<span class="badge badge-xs bg-blue-400/20 text-blue-200">Yoghurt</span>
								{/if}
								{#if restaurant.hasGarlicSauce}
									<span class="badge badge-xs bg-purple-400/20 text-purple-200">Garlic</span>
								{/if}
							</div>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 gap-2 sm:flex-col">
							<a
								href="/doener/{restaurant.id}"
								class="btn btn-sm btn-ghost text-orange-300 hover:text-white"
							>
								View
							</a>
							<a
								href="/doener/{restaurant.id}/edit"
								class="btn btn-sm btn-outline text-blue-300 hover:bg-blue-600/20 hover:text-white"
							>
								<FluentEdit24Regular class="size-4" />
								Edit
							</a>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="restaurantId" value={restaurant.id} />
								<button
									type="submit"
									class="btn btn-sm btn-error btn-outline"
									onclick={(e) => {
										if (
											!confirm(
												`Are you sure you want to delete "${restaurant.name}"? This will also delete all ${restaurant.reviewCount} reviews. This cannot be undone.`
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
