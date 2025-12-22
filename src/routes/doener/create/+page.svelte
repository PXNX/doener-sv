<!-- src/routes/doener/create/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { createDoenerReviewSchema } from './schema';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentCheckmark20Filled from '~icons/fluent/checkmark-20-filled';
	import FluentImage20Filled from '~icons/fluent/image-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentDocument20Filled from '~icons/fluent/document-20-filled';

	let { data } = $props();

	const { form, errors, message, enhance, submitting, delayed } = superForm(data.form, {
		validators: valibotClient(createDoenerReviewSchema),
		multipleSubmits: 'prevent',
		clearOnSubmit: 'none',
		taintedMessage: null
	});

	let previewUrl = $state<string | null>(null);
	let dragActive = $state(false);
	let fileInput: HTMLInputElement;
	let isGettingLocation = $state(false);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			$form.doenerImage = file;
			updatePreview(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		const file = event.dataTransfer?.files[0];
		if (file) {
			$form.doenerImage = file;
			updatePreview(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	function updatePreview(file: File) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = URL.createObjectURL(file);
	}

	function clearImage() {
		if ($submitting) return;
		$form.doenerImage = undefined;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		if (fileInput) {
			fileInput.value = '';
		}
	}

	async function getCurrentLocation() {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		isGettingLocation = true;
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000
				});
			});

			$form.latitude = position.coords.latitude;
			$form.longitude = position.coords.longitude;
		} catch (error) {
			alert('Unable to get your location. Please enter coordinates manually.');
		} finally {
			isGettingLocation = false;
		}
	}

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	// Initialize form defaults
	$effect(() => {
		if ($form.overallRating === undefined) {
			$form.overallRating = 3;
		}
	});
</script>

<div class="mx-auto max-w-3xl space-y-6 px-4 py-6">
	<!-- Header -->
	<div class="space-y-2 text-center">
		<div
			class="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentFood20Filled class="size-10 text-white" />
		</div>
		<h1 class="text-3xl font-bold text-white">Review a Döner</h1>
		<p class="text-gray-400">Share your döner experience with the community</p>
	</div>

	<!-- Error Message -->
	{#if $message}
		<div class="rounded-xl border border-red-500/30 bg-red-600/20 p-4">
			<p class="text-sm font-medium text-red-300">{$message}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-6">
		<!-- Restaurant Details -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-2">
				<FluentLocation20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-white">Restaurant Location</h2>
			</div>

			<div>
				<label for="restaurantName" class="mb-2 block text-sm font-medium text-gray-300">
					Restaurant Name <span class="text-red-400">*</span>
				</label>
				<input
					type="text"
					id="restaurantName"
					name="restaurantName"
					bind:value={$form.restaurantName}
					placeholder="e.g., Mustafa's Gemüse Kebap"
					maxlength="200"
					class="input w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
					class:input-error={$errors.restaurantName}
					disabled={$submitting}
				/>
				{#if $errors.restaurantName}
					<p class="mt-1 text-xs text-red-400">{$errors.restaurantName}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="latitude" class="mb-2 block text-sm font-medium text-gray-300">
						Latitude <span class="text-red-400">*</span>
					</label>
					<input
						type="number"
						id="latitude"
						name="latitude"
						step="any"
						bind:value={$form.latitude}
						placeholder="52.5200"
						class="input w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
						class:input-error={$errors.latitude}
						disabled={$submitting}
					/>
					{#if $errors.latitude}
						<p class="mt-1 text-xs text-red-400">{$errors.latitude}</p>
					{/if}
				</div>

				<div>
					<label for="longitude" class="mb-2 block text-sm font-medium text-gray-300">
						Longitude <span class="text-red-400">*</span>
					</label>
					<input
						type="number"
						id="longitude"
						name="longitude"
						step="any"
						bind:value={$form.longitude}
						placeholder="13.4050"
						class="input w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
						class:input-error={$errors.longitude}
						disabled={$submitting}
					/>
					{#if $errors.longitude}
						<p class="mt-1 text-xs text-red-400">{$errors.longitude}</p>
					{/if}
				</div>
			</div>

			<button
				type="button"
				onclick={getCurrentLocation}
				disabled={$submitting || isGettingLocation}
				class="btn btn-sm border-blue-500/30 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
			>
				{#if isGettingLocation}
					<span class="loading loading-spinner loading-xs"></span>
					Getting location...
				{:else}
					<FluentLocation20Filled class="size-4" />
					Use My Current Location
				{/if}
			</button>
		</div>

		<!-- Döner Image -->
		<div class="space-y-3 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-2">
				<FluentImage20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-white">Döner Photo</h2>
			</div>

			<div
				class="relative"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
			>
				<input
					bind:this={fileInput}
					type="file"
					id="doenerImage"
					name="doenerImage"
					accept="image/*"
					class="hidden"
					onchange={handleFileSelect}
					disabled={$submitting}
				/>

				<button
					type="button"
					onclick={() => fileInput?.click()}
					disabled={$submitting}
					class="group relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200 active:scale-[0.98]"
					class:border-orange-500={dragActive}
					class:bg-orange-600-10={dragActive}
					class:border-orange-500-30={!dragActive && !$form.doenerImage}
					class:border-success={$form.doenerImage && !dragActive}
					class:bg-success-5={$form.doenerImage && !dragActive}
					class:hover:border-orange-500-50={!$submitting && !$form.doenerImage}
					class:hover:bg-orange-600-10={!$submitting && !$form.doenerImage}
					class:opacity-50={$submitting}
					class:input-error={$errors.doenerImage}
				>
					{#if !$form.doenerImage}
						<div class="flex min-h-[120px] flex-col items-center justify-center gap-3 p-6">
							<div
								class="rounded-full bg-orange-600/20 p-3 transition-transform group-hover:scale-110"
							>
								<FluentImage20Filled class="size-8 text-orange-400" />
							</div>
							<div class="text-center">
								<p class="text-base font-semibold text-white">
									{#if dragActive}
										Drop photo here
									{:else if $submitting}
										Uploading...
									{:else}
										Tap to upload döner photo
									{/if}
								</p>
								{#if !$submitting}
									<p class="mt-1 text-sm text-gray-400">Images only • 10MB max</p>
								{/if}
							</div>
						</div>
					{:else}
						<div class="relative">
							<div class="flex items-center justify-center bg-slate-900/50 p-6">
								<img
									src={previewUrl}
									alt="Döner preview"
									class="max-h-64 rounded-lg object-contain"
								/>
							</div>
							<div
								class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<p class="text-base font-semibold text-white">Tap to change</p>
							</div>
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									clearImage();
								}}
								disabled={$submitting}
								class="btn btn-circle btn-sm absolute top-2 right-2 bg-slate-800 hover:bg-slate-700"
							>
								✕
							</button>
						</div>
					{/if}
				</button>
			</div>

			{#if $errors.doenerImage}
				<p class="text-xs text-red-400">{$errors.doenerImage}</p>
			{/if}
		</div>

		<!-- Bread Quality -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<h2 class="text-lg font-semibold text-white">🥖 Bread Quality</h2>

			<div class="space-y-3">
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadHasSesame}
						class="checkbox checkbox-warning"
						disabled={$submitting}
					/>
					<span class="text-white">Sesame seeds on bread</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadFluffyInside}
						class="checkbox checkbox-warning"
						disabled={$submitting}
					/>
					<span class="text-white">Fluffy inside</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadCrispyOutside}
						class="checkbox checkbox-warning"
						disabled={$submitting}
					/>
					<span class="text-white">Crispy outside</span>
				</label>
			</div>
		</div>

		<!-- Meat Details -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<h2 class="text-lg font-semibold text-white">🥩 Meat Details</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div>
					<label for="meatType" class="mb-2 block text-sm font-medium text-gray-300">
						Meat Type <span class="text-red-400">*</span>
					</label>
					<select
						id="meatType"
						name="meatType"
						bind:value={$form.meatType}
						class="select w-full border-slate-600/30 bg-slate-700/50 text-white"
						class:input-error={$errors.meatType}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="minced">Minced</option>
						<option value="layered">Layered</option>
					</select>
					{#if $errors.meatType}
						<p class="mt-1 text-xs text-red-400">{$errors.meatType}</p>
					{/if}
				</div>

				<div>
					<label for="meatProtein" class="mb-2 block text-sm font-medium text-gray-300">
						Protein <span class="text-red-400">*</span>
					</label>
					<select
						id="meatProtein"
						name="meatProtein"
						bind:value={$form.meatProtein}
						class="select w-full border-slate-600/30 bg-slate-700/50 text-white"
						class:input-error={$errors.meatProtein}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="chicken">Chicken</option>
						<option value="beef">Beef</option>
						<option value="mixed">Mixed</option>
					</select>
					{#if $errors.meatProtein}
						<p class="mt-1 text-xs text-red-400">{$errors.meatProtein}</p>
					{/if}
				</div>

				<div>
					<label for="meatSeasoning" class="mb-2 block text-sm font-medium text-gray-300">
						Seasoning <span class="text-red-400">*</span>
					</label>
					<select
						id="meatSeasoning"
						name="meatSeasoning"
						bind:value={$form.meatSeasoning}
						class="select w-full border-slate-600/30 bg-slate-700/50 text-white"
						class:input-error={$errors.meatSeasoning}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="pure">Pure</option>
						<option value="seasoned">Heavily Seasoned</option>
						<option value="phosphate">Phosphate (wet mouth)</option>
					</select>
					{#if $errors.meatSeasoning}
						<p class="mt-1 text-xs text-red-400">{$errors.meatSeasoning}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Toppings & Sauces -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<h2 class="text-lg font-semibold text-white">🧅 Toppings & Sauces</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="spiceLevel" class="mb-2 block text-sm font-medium text-gray-300">
						Spice Level <span class="text-red-400">*</span>
					</label>
					<select
						id="spiceLevel"
						name="spiceLevel"
						bind:value={$form.spiceLevel}
						class="select w-full border-slate-600/30 bg-slate-700/50 text-white"
						class:input-error={$errors.spiceLevel}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="mild">Mild</option>
						<option value="spicy">Spicy 🌶️</option>
					</select>
					{#if $errors.spiceLevel}
						<p class="mt-1 text-xs text-red-400">{$errors.spiceLevel}</p>
					{/if}
				</div>

				<div class="space-y-3">
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							bind:checked={$form.hasOnions}
							class="checkbox checkbox-warning"
							disabled={$submitting}
						/>
						<span class="text-white">Has onions</span>
					</label>
				</div>
			</div>

			<div class="space-y-3 pt-2">
				<p class="text-sm font-medium text-gray-300">Sauces:</p>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.hasYoghurtSauce}
						class="checkbox checkbox-warning"
						disabled={$submitting}
					/>
					<span class="text-white">Yoghurt sauce</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.hasGarlicSauce}
						class="checkbox checkbox-warning"
						disabled={$submitting}
					/>
					<span class="text-white">Garlic sauce</span>
				</label>
			</div>
		</div>

		<!-- Overall Rating -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-2">
				<FluentStar20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-white">Overall Rating</h2>
			</div>

			<div class="flex items-center gap-4">
				{#each [1, 2, 3, 4, 5] as rating}
					<button
						type="button"
						onclick={() => ($form.overallRating = rating)}
						class="text-4xl transition-all hover:scale-110"
						class:opacity-30={$form.overallRating < rating}
						disabled={$submitting}
					>
						⭐
					</button>
				{/each}
			</div>

			{#if $errors.overallRating}
				<p class="text-xs text-red-400">{$errors.overallRating}</p>
			{/if}
		</div>

		<!-- Notes -->
		<div class="space-y-3 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-2">
				<FluentDocument20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-white">Additional Notes</h2>
			</div>

			<textarea
				id="notes"
				name="notes"
				bind:value={$form.notes}
				rows="4"
				placeholder="Share more details about your döner experience..."
				maxlength="1000"
				class="textarea w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
				disabled={$submitting}
			></textarea>

			<p class="text-xs text-gray-400">{$form.notes?.length || 0}/1000 characters</p>
		</div>

		<!-- Submit -->
		<div class="flex gap-3">
			<a
				href="/"
				class="btn flex-1 border-slate-600/30 bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
				class:btn-disabled={$submitting}
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={$submitting}
				class="btn flex-1 gap-2 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				{#if $delayed}
					<span class="loading loading-spinner loading-sm"></span>
					Submitting...
				{:else}
					<FluentCheckmark20Filled class="size-5" />
					Submit Review
				{/if}
			</button>
		</div>
	</form>
</div>
