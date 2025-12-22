<!-- src/routes/doener/[id]/edit/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { createDoenerReviewSchema } from './schema';
	import { goto } from '$app/navigation';
	import { beforeNavigate } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentCheckmark20Filled from '~icons/fluent/checkmark-20-filled';
	import FluentImage20Filled from '~icons/fluent/image-20-filled';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentDocument20Filled from '~icons/fluent/document-20-filled';
	import FluentEmojiBread from '~icons/fluent-emoji/bread';
	import FluentEmojiMeatOnBone from '~icons/fluent-emoji/meat-on-bone';
	import FluentEmojiPoultryLeg from '~icons/fluent-emoji/poultry-leg';
	import FluentEmojiSaltShaker from '~icons/fluent-emoji/salt';
	import FluentEmojiOnion from '~icons/fluent-emoji/onion';
	import FluentEmojiLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import FluentEmojiBottleWithPoppingCork from '~icons/fluent-emoji/bottle-with-popping-cork';

	let { data } = $props();

	const { form, errors, message, enhance, submitting, delayed } = superForm(data.form, {
		validators: valibotClient(createDoenerReviewSchema),
		multipleSubmits: 'prevent',
		clearOnSubmit: 'none',
		taintedMessage: null
	});

	// Store original values for comparison
	const originalValues = {
		breadHasSesame: data.form.data.breadHasSesame,
		breadFluffyInside: data.form.data.breadFluffyInside,
		breadCrispyOutside: data.form.data.breadCrispyOutside,
		meatType: data.form.data.meatType,
		meatProtein: data.form.data.meatProtein,
		meatSeasoning: data.form.data.meatSeasoning,
		hasOnions: data.form.data.hasOnions,
		krautLevel: data.form.data.krautLevel,
		hasYoghurtSauce: data.form.data.hasYoghurtSauce,
		hasGarlicSauce: data.form.data.hasGarlicSauce,
		overallRating: data.form.data.overallRating,
		notes: data.form.data.notes || ''
	};

	let previewUrl = $state<string | null>(null);
	let dragActive = $state(false);
	let fileInput: HTMLInputElement;
	let showUnsavedDialog = $state(false);
	let showConfirmSaveDialog = $state(false);
	let pendingNavigationUrl: string | null = null;
	let allowNavigation = $state(false);
	let hasSubmitted = $state(false);
	let formElement: HTMLFormElement;

	// Check if form has been modified
	const hasChanges = $derived(
		Object.keys(originalValues).some((key) => $form[key] !== originalValues[key]) ||
			$form.doenerImage !== undefined
	);

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

	function goBack() {
		if (hasChanges && !hasSubmitted) {
			pendingNavigationUrl = `/doener/restaurant/${data.review.restaurantId}`;
			showUnsavedDialog = true;
		} else {
			goto(`/doener/restaurant/${data.review.restaurantId}`);
		}
	}

	function confirmLeave() {
		showUnsavedDialog = false;
		allowNavigation = true;

		if (pendingNavigationUrl) {
			const url = pendingNavigationUrl;
			pendingNavigationUrl = null;
			goto(url);
		}
	}

	function cancelLeave() {
		showUnsavedDialog = false;
		pendingNavigationUrl = null;
	}

	beforeNavigate(({ cancel, to }) => {
		if (hasSubmitted || allowNavigation || $submitting) {
			allowNavigation = false;
			return;
		}

		if (hasChanges) {
			cancel();
			pendingNavigationUrl = to?.url.pathname || '/';
			showUnsavedDialog = true;
		}
	});

	function initiateSubmit() {
		if (hasChanges && !hasSubmitted) {
			showConfirmSaveDialog = true;
		}
	}

	function confirmSave() {
		showConfirmSaveDialog = false;
		formElement?.requestSubmit();
	}

	function handleSubmit() {
		allowNavigation = true;
		return async ({ result, update }: any) => {
			await update();
			hasSubmitted = true;

			if (result.type === 'success' || result.type === 'redirect') {
				goto(`/doener/restaurant/${data.review.restaurantId}`);
			} else if (result.location) {
				goto(result.location);
			}
		};
	}

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	const sectionClass =
		'space-y-4 rounded-xl border border-orange-500/20 bg-orange-900/10 p-5 backdrop-blur-sm';
	const fieldClass =
		'w-full rounded-lg border border-orange-500/30 bg-slate-700/50 px-4 py-3 text-white placeholder-orange-300/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none';
	const checkboxClass = 'checkbox checkbox-warning';
</script>

<svelte:head>
	<title>Edit Review - {data.review.restaurantName}</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6 px-4 py-6">
	<!-- Back Button -->
	<button
		onclick={goBack}
		type="button"
		class="group mb-6 inline-flex items-center gap-2 text-orange-200/80 transition-colors hover:text-orange-100"
	>
		<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
		<span>Back to Restaurant</span>
	</button>

	<!-- Header -->
	<div class="space-y-2 text-center">
		<div
			class="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentFood20Filled class="size-10 text-white" />
		</div>
		<h1 class="text-3xl font-bold text-white">Edit Review</h1>
		<p class="text-lg text-orange-200">{data.review.restaurantName}</p>
		<p class="text-sm text-orange-300/70">
			{data.review.city}, {data.review.country}
		</p>
	</div>

	<!-- Error Message -->
	{#if $message}
		<div class="rounded-xl border border-red-500/30 bg-red-600/20 p-4">
			<p class="text-sm font-medium text-red-300">{$message}</p>
		</div>
	{/if}

	<!-- Form -->
	<form
		bind:this={formElement}
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
		class="space-y-6"
	>
		<!-- Restaurant Info (Read-only) -->
		<div class={sectionClass}>
			<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
				📍 Restaurant Location
			</h2>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<p class="text-white">{data.review.restaurantName}</p>
				<p class="text-sm text-orange-300/70">{data.review.city}, {data.review.country}</p>
			</div>
		</div>

		<!-- Döner Image -->
		<div class={sectionClass}>
			<div class="flex items-center gap-2">
				<FluentImage20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-orange-200">Döner Photo</h2>
			</div>

			{#if data.review.currentImageUrl && !$form.doenerImage}
				<div class="relative overflow-hidden rounded-lg">
					<img
						src={data.review.currentImageUrl}
						alt="Current döner"
						class="max-h-64 w-full rounded-lg object-cover"
					/>
					<button
						type="button"
						onclick={() => fileInput?.click()}
						class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
						disabled={$submitting}
					>
						<p class="text-base font-semibold text-white">Click to change photo</p>
					</button>
				</div>
			{/if}

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
										Tap to upload new photo
									{/if}
								</p>
								{#if !$submitting}
									<p class="mt-1 text-sm text-orange-300/70">Images only • 10MB max</p>
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
		<div class={sectionClass}>
			<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
				<FluentEmojiBread class="size-5" />
				<span>Bread Quality</span>
			</h2>

			<div class="space-y-3">
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadHasSesame}
						class={checkboxClass}
						disabled={$submitting}
					/>
					<span class="text-white">Sesame seeds on bread</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadFluffyInside}
						class={checkboxClass}
						disabled={$submitting}
					/>
					<span class="text-white">Fluffy inside</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.breadCrispyOutside}
						class={checkboxClass}
						disabled={$submitting}
					/>
					<span class="text-white">Crispy outside</span>
				</label>
			</div>
		</div>

		<!-- Meat Details -->
		<div class={sectionClass}>
			<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
				<FluentEmojiMeatOnBone class="size-5" />
				<span>Meat Details</span>
			</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div>
					<label
						for="meatType"
						class="mb-2 flex items-center gap-1 text-sm font-medium text-orange-300"
					>
						Meat Type <span class="text-red-400">*</span>
					</label>
					<select
						id="meatType"
						name="meatType"
						bind:value={$form.meatType}
						class="select w-full border-orange-500/30 bg-slate-700/50 text-white"
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
					<label
						for="meatProtein"
						class="mb-2 flex items-center gap-1 text-sm font-medium text-orange-300"
					>
						<FluentEmojiPoultryLeg class="size-4" />
						Protein <span class="text-red-400">*</span>
					</label>
					<select
						id="meatProtein"
						name="meatProtein"
						bind:value={$form.meatProtein}
						class="select w-full border-orange-500/30 bg-slate-700/50 text-white"
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
					<label
						for="meatSeasoning"
						class="mb-2 flex items-center gap-1 text-sm font-medium text-orange-300"
					>
						<FluentEmojiSaltShaker class="size-4" />
						Seasoning <span class="text-red-400">*</span>
					</label>
					<select
						id="meatSeasoning"
						name="meatSeasoning"
						bind:value={$form.meatSeasoning}
						class="select w-full border-orange-500/30 bg-slate-700/50 text-white"
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

		<!-- Toppings -->
		<div class={sectionClass}>
			<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
				<FluentEmojiOnion class="size-5" />
				<span>Toppings & Flavors</span>
			</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="hasOnions" class="mb-2 block text-sm font-medium text-orange-300">
						Onions <span class="text-red-400">*</span>
					</label>
					<select
						id="hasOnions"
						name="hasOnions"
						bind:value={$form.hasOnions}
						class="select w-full border-orange-500/30 bg-slate-700/50 text-white"
						class:input-error={$errors.hasOnions}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="none">No onions</option>
						<option value="mild">Mild onions</option>
						<option value="spicy">Spicy onions</option>
					</select>
					{#if $errors.hasOnions}
						<p class="mt-1 text-xs text-red-400">{$errors.hasOnions}</p>
					{/if}
				</div>

				<div>
					<label
						for="krautLevel"
						class="mb-2 flex items-center gap-1 text-sm font-medium text-orange-300"
					>
						<FluentEmojiLeafyGreen class="size-4" />
						Kraut <span class="text-red-400">*</span>
					</label>
					<select
						id="krautLevel"
						name="krautLevel"
						bind:value={$form.krautLevel}
						class="select w-full border-orange-500/30 bg-slate-700/50 text-white"
						class:input-error={$errors.krautLevel}
						disabled={$submitting}
					>
						<option value="">Select...</option>
						<option value="none">No kraut</option>
						<option value="mild">Mild kraut</option>
						<option value="sour">Sour kraut</option>
					</select>
					{#if $errors.krautLevel}
						<p class="mt-1 text-xs text-red-400">{$errors.krautLevel}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-3 pt-2">
				<p class="flex items-center gap-2 text-sm font-medium text-orange-300">
					<FluentEmojiBottleWithPoppingCork class="size-4" />
					<span>Sauces:</span>
				</p>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.hasYoghurtSauce}
						class={checkboxClass}
						disabled={$submitting}
					/>
					<span class="text-white">Yoghurt sauce</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={$form.hasGarlicSauce}
						class={checkboxClass}
						disabled={$submitting}
					/>
					<span class="text-white">Garlic sauce</span>
				</label>
			</div>
		</div>

		<!-- Overall Rating -->
		<div class={sectionClass}>
			<div class="flex items-center gap-2">
				<FluentStar20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-orange-200">Overall Rating</h2>
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
		<div class={sectionClass}>
			<div class="flex items-center gap-2">
				<FluentDocument20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-orange-200">Additional Notes</h2>
			</div>

			<textarea
				id="notes"
				name="notes"
				bind:value={$form.notes}
				rows="4"
				placeholder="Share more details about your döner experience..."
				maxlength="1000"
				class={fieldClass}
				disabled={$submitting}
			></textarea>

			<p class="text-xs text-orange-300/70">{$form.notes?.length || 0}/1000 characters</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-3">
			<button
				type="button"
				onclick={initiateSubmit}
				disabled={$submitting || !hasChanges || hasSubmitted}
				class="btn flex-1 gap-2 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 disabled:opacity-50"
				title={!hasChanges ? 'No changes to save' : hasSubmitted ? 'Already submitted' : ''}
			>
				{#if $delayed}
					<span class="loading loading-spinner loading-sm"></span>
					Saving...
				{:else}
					<FluentCheckmark20Filled class="size-5" />
					Update Review
				{/if}
			</button>
		</div>
	</form>
</div>

<!-- Unsaved Changes Dialog -->
{#if showUnsavedDialog}
	<dialog class="modal modal-open" open>
		<div class="modal-box border border-orange-500/30 bg-slate-800 text-white">
			<h3 class="text-lg font-bold text-orange-200">Unsaved Changes</h3>
			<p class="py-4 text-orange-100">You have unsaved changes. Are you sure you want to leave?</p>
			<div class="modal-action">
				<button onclick={cancelLeave} type="button" class="btn btn-ghost text-orange-200"
					>Cancel</button
				>
				<button
					onclick={confirmLeave}
					type="button"
					class="btn border-0 bg-gradient-to-r from-red-600 to-orange-600 text-white"
					>Leave Without Saving</button
				>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={cancelLeave} type="button">close</button>
		</form>
	</dialog>
{/if}

<!-- Confirm Save Dialog -->
{#if showConfirmSaveDialog}
	<dialog class="modal modal-open" open>
		<div class="modal-box border border-orange-500/30 bg-slate-800 text-white">
			<h3 class="text-lg font-bold text-orange-200">Confirm Changes</h3>
			<p class="py-4 text-orange-100">
				Are you sure you want to save these changes to your review?
			</p>
			<div class="modal-action">
				<button onclick={cancelLeave} type="button" class="btn btn-ghost text-orange-200"
					>Cancel</button
				>
				<button
					onclick={confirmSave}
					type="button"
					class="btn border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white"
				>
					Save Changes
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={cancelLeave} type="button">close</button>
		</form>
	</dialog>
{/if}
