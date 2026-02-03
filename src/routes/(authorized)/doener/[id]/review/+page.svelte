<!-- src/routes/doener/[id]/review/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { createReviewSchema } from './schema';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';
	import FluentCheckmark20Filled from '~icons/fluent/checkmark-20-filled';
	import FluentDocument20Filled from '~icons/fluent/document-20-filled';
	import NotoMeatOnBone from '~icons/fluent-emoji/meat-on-bone';
	import NotoBread from '~icons/fluent-emoji/bread';
	import NotoLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import FluentEmojiSalt from '~icons/fluent-emoji/salt';
	let { data } = $props();

	const { form, errors, message, enhance, submitting, delayed } = superForm(data.form, {
		validators: valibotClient(createReviewSchema),
		multipleSubmits: 'prevent',
		clearOnSubmit: 'none',
		taintedMessage: null,
		dataType: 'json'
	});

	const ratingLabels = ['Sub Average', 'Average', 'Good', 'Excellent'];
	const ratingEmojis = ['😕', '😐', '🙂', '😍'];

	function getRatingClass(rating: number, currentValue: number) {
		if (currentValue >= rating) {
			if (rating === 4) return 'text-green-400';
			if (rating === 3) return 'text-blue-400';
			if (rating === 2) return 'text-yellow-400';
			return 'text-orange-400';
		}
		return 'text-gray-600';
	}
</script>

<svelte:head>
	<title>Review {data.restaurant.name} - Döner Finder</title>
</svelte:head>

<BackButton href="/doener/{data.restaurant.id}" />

<div class="mx-auto max-w-3xl space-y-6 px-4 py-6">
	<!-- Header -->
	<div class="space-y-2 text-center">
		<div
			class="mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentStar20Filled class="size-10 text-white" />
		</div>
		<h1 class="text-3xl font-bold text-white">Review Döner</h1>
		<p class="text-gray-400">{data.restaurant.name}</p>
		<p class="text-sm text-gray-500">{data.restaurant.city}, {data.restaurant.country}</p>
	</div>

	<!-- Restaurant Image -->
	{#if data.restaurant.doenerImage}
		<div class="flex justify-center">
			<img
				src={data.restaurant.doenerImage}
				alt={data.restaurant.name}
				class="h-48 w-full max-w-md rounded-xl border-2 border-orange-500/30 object-cover shadow-lg"
			/>
		</div>
	{/if}

	<!-- Error Message -->
	{#if $message}
		<div class="rounded-xl border border-red-500/30 bg-red-600/20 p-4">
			<p class="text-sm font-medium text-red-300">{$message}</p>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" use:enhance class="space-y-6">
		<!-- Meat Rating -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-3">
				<NotoMeatOnBone class="size-7" />
				<h2 class="text-lg font-semibold text-white">Meat Quality</h2>
			</div>

			<div class="grid grid-cols-4 gap-2">
				{#each [1, 2, 3, 4] as rating (rating)}
					<button
						type="button"
						onclick={() => ($form.meatRating = rating)}
						class="flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105"
						class:border-green-400={rating === 4 && $form.meatRating === rating}
						class:bg-green-400-20={rating === 4 && $form.meatRating === rating}
						class:border-blue-400={rating === 3 && $form.meatRating === rating}
						class:bg-blue-400-20={rating === 3 && $form.meatRating === rating}
						class:border-yellow-400={rating === 2 && $form.meatRating === rating}
						class:bg-yellow-400-20={rating === 2 && $form.meatRating === rating}
						class:border-orange-400={rating === 1 && $form.meatRating === rating}
						class:bg-orange-400-20={rating === 1 && $form.meatRating === rating}
						class:border-slate-600={$form.meatRating !== rating}
						class:bg-slate-700-30={$form.meatRating !== rating}
						disabled={$submitting}
					>
						<span class="text-3xl">{ratingEmojis[rating - 1]}</span>
						<span class="text-xs font-medium text-white">{ratingLabels[rating - 1]}</span>
					</button>
				{/each}
			</div>

			{#if $errors.meatRating}
				<p class="text-xs text-red-400">{$errors.meatRating}</p>
			{/if}
		</div>

		<!-- Bread Rating -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-3">
				<NotoBread class="size-7" />
				<h2 class="text-lg font-semibold text-white">Bread Quality</h2>
			</div>

			<div class="grid grid-cols-4 gap-2">
				{#each [1, 2, 3, 4] as rating (rating)}
					<button
						type="button"
						onclick={() => ($form.breadRating = rating)}
						class="flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105"
						class:border-green-400={rating === 4 && $form.breadRating === rating}
						class:bg-green-400-20={rating === 4 && $form.breadRating === rating}
						class:border-blue-400={rating === 3 && $form.breadRating === rating}
						class:bg-blue-400-20={rating === 3 && $form.breadRating === rating}
						class:border-yellow-400={rating === 2 && $form.breadRating === rating}
						class:bg-yellow-400-20={rating === 2 && $form.breadRating === rating}
						class:border-orange-400={rating === 1 && $form.breadRating === rating}
						class:bg-orange-400-20={rating === 1 && $form.breadRating === rating}
						class:border-slate-600={$form.breadRating !== rating}
						class:bg-slate-700-30={$form.breadRating !== rating}
						disabled={$submitting}
					>
						<span class="text-3xl">{ratingEmojis[rating - 1]}</span>
						<span class="text-xs font-medium text-white">{ratingLabels[rating - 1]}</span>
					</button>
				{/each}
			</div>

			{#if $errors.breadRating}
				<p class="text-xs text-red-400">{$errors.breadRating}</p>
			{/if}
		</div>

		<!-- Veggies Rating -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-3">
				<NotoLeafyGreen class="size-7" />
				<h2 class="text-lg font-semibold text-white">Veggies Quality</h2>
			</div>

			<div class="grid grid-cols-4 gap-2">
				{#each [1, 2, 3, 4] as rating (rating)}
					<button
						type="button"
						onclick={() => ($form.veggiesRating = rating)}
						class="flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105"
						class:border-green-400={rating === 4 && $form.veggiesRating === rating}
						class:bg-green-400-20={rating === 4 && $form.veggiesRating === rating}
						class:border-blue-400={rating === 3 && $form.veggiesRating === rating}
						class:bg-blue-400-20={rating === 3 && $form.veggiesRating === rating}
						class:border-yellow-400={rating === 2 && $form.veggiesRating === rating}
						class:bg-yellow-400-20={rating === 2 && $form.veggiesRating === rating}
						class:border-orange-400={rating === 1 && $form.veggiesRating === rating}
						class:bg-orange-400-20={rating === 1 && $form.veggiesRating === rating}
						class:border-slate-600={$form.veggiesRating !== rating}
						class:bg-slate-700-30={$form.veggiesRating !== rating}
						disabled={$submitting}
					>
						<span class="text-3xl">{ratingEmojis[rating - 1]}</span>
						<span class="text-xs font-medium text-white">{ratingLabels[rating - 1]}</span>
					</button>
				{/each}
			</div>

			{#if $errors.veggiesRating}
				<p class="text-xs text-red-400">{$errors.veggiesRating}</p>
			{/if}
		</div>

		<!-- Sauce Rating -->
		<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-3">
				<FluentEmojiSalt class="size-7" />
				<h2 class="text-lg font-semibold text-white">Sauce Quality</h2>
			</div>

			<div class="grid grid-cols-4 gap-2">
				{#each [1, 2, 3, 4] as rating (rating)}
					<button
						type="button"
						onclick={() => ($form.sauceRating = rating)}
						class="flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105"
						class:border-green-400={rating === 4 && $form.sauceRating === rating}
						class:bg-green-400-20={rating === 4 && $form.sauceRating === rating}
						class:border-blue-400={rating === 3 && $form.sauceRating === rating}
						class:bg-blue-400-20={rating === 3 && $form.sauceRating === rating}
						class:border-yellow-400={rating === 2 && $form.sauceRating === rating}
						class:bg-yellow-400-20={rating === 2 && $form.sauceRating === rating}
						class:border-orange-400={rating === 1 && $form.sauceRating === rating}
						class:bg-orange-400-20={rating === 1 && $form.sauceRating === rating}
						class:border-slate-600={$form.sauceRating !== rating}
						class:bg-slate-700-30={$form.sauceRating !== rating}
						disabled={$submitting}
					>
						<span class="text-3xl">{ratingEmojis[rating - 1]}</span>
						<span class="text-xs font-medium text-white">{ratingLabels[rating - 1]}</span>
					</button>
				{/each}
			</div>

			{#if $errors.sauceRating}
				<p class="text-xs text-red-400">{$errors.sauceRating}</p>
			{/if}
		</div>

		<!-- Description -->
		<div class="space-y-3 rounded-xl border border-white/5 bg-slate-800/50 p-5">
			<div class="flex items-center gap-2">
				<FluentDocument20Filled class="size-5 text-orange-400" />
				<h2 class="text-lg font-semibold text-white">Your Review</h2>
			</div>

			<textarea
				id="description"
				name="description"
				bind:value={$form.description}
				rows="4"
				placeholder="Share your thoughts about this döner..."
				maxlength="200"
				class="textarea w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
				class:input-error={$errors.description}
				disabled={$submitting}
			></textarea>

			<p class="text-xs text-gray-400">{$form.description?.length || 0}/200 characters</p>

			{#if $errors.description}
				<p class="text-xs text-red-400">{$errors.description}</p>
			{/if}
		</div>

		<!-- Submit -->
		<div class="flex gap-3">
			<a
				href="/doener/{data.restaurant.id}"
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
