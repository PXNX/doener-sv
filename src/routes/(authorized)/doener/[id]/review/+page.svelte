<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { createReviewSchema } from './schema';
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentCheckmark20Filled from '~icons/fluent/checkmark-20-filled';
	import FluentImage20Filled from '~icons/fluent/image-20-filled';
	import FluentCamera20Filled from '~icons/fluent/camera-20-filled';
	import NotoMeatOnBone from '~icons/fluent-emoji/meat-on-bone';
	import NotoBread from '~icons/fluent-emoji/bread';
	import NotoLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import FluentEmojiSalt from '~icons/fluent-emoji/salt';
	import FluentStar20Filled from '~icons/fluent/star-20-filled';

	let { data } = $props();

	const { form, errors, message, enhance, submitting, delayed } = superForm(data.form, {
		validators: valibotClient(createReviewSchema),
		multipleSubmits: 'prevent',
		clearOnSubmit: 'none',
		taintedMessage: null
	});

	let step = $state(0);
	const totalSteps = 6;

	const stepMeta = [
		{ label: 'Photo', icon: '📸', emoji: '📷' },
		{ label: 'Meat', icon: '🥩', emoji: '🍖' },
		{ label: 'Bread', icon: '🍞', emoji: '🥖' },
		{ label: 'Veggies', icon: '🥬', emoji: '🥗' },
		{ label: 'Sauces', icon: '🫗', emoji: '🧂' },
		{ label: 'Overall', icon: '⭐', emoji: '✨' }
	];

	// Quality rating labels (1-4 = bad → excellent)
	const qualityLabels = ['😕 Sub Average', '😐 Average', '🙂 Good', '😍 Excellent'];
	const qualityEmojis = ['😕', '😐', '🙂', '😍'];

	// Level labels (1-4 = low → high)
	const levelLabels = [
		['Very Low', 'Low', 'Moderate', 'High'],
		['Very Dry', 'Slightly Dry', 'Juicy', 'Very Juicy'],
		['Not Crispy', 'Slightly Crispy', 'Crispy', 'Very Crispy'],
		['No Dry Feel', 'Slight', 'Noticeable', 'Very Dry/Salty'],
		['Very Lean', 'Lean', 'Fatty', 'Very Fatty'],
		['Very Thin', 'Thin', 'Thick', 'Very Thick'],
		['Dense', 'Slightly Fluffy', 'Fluffy', 'Very Fluffy']
	];

	function getLevelLabels(type: string): string[] {
		const map: Record<string, string[]> = {
			juiciness: ['Very Dry', 'Slightly Dry', 'Juicy', 'Very Juicy'],
			crispiness: ['Not Crispy', 'Slightly', 'Crispy', 'Very Crispy'],
			dryFeel: ['None', 'Slight', 'Noticeable', 'Very Dry'],
			fatty: ['Very Lean', 'Lean', 'Fatty', 'Very Fatty'],
			thickness: ['Very Thin', 'Thin', 'Thick', 'Very Thick'],
			fluffy: ['Dense', 'Slightly', 'Fluffy', 'Very Fluffy']
		};
		return map[type] || ['1', '2', '3', '4'];
	}

	function getLevelColor(value: number): string {
		if (value === 1) return 'border-slate-400 bg-slate-400/20 text-slate-200';
		if (value === 2) return 'border-blue-400 bg-blue-400/20 text-blue-200';
		if (value === 3) return 'border-yellow-400 bg-yellow-400/20 text-yellow-200';
		return 'border-orange-400 bg-orange-400/20 text-orange-200';
	}

	function getQualityColor(value: number): string {
		if (value === 1) return 'border-orange-400 bg-orange-400/20';
		if (value === 2) return 'border-yellow-400 bg-yellow-400/20';
		if (value === 3) return 'border-blue-400 bg-blue-400/20';
		return 'border-green-400 bg-green-400/20';
	}

	function nextStep() {
		if (step < totalSteps - 1) step++;
	}

	function prevStep() {
		if (step > 0) step--;
	}

	// Photo handling
	let previewUrl = $state<string | null>(null);
	let fileInputCamera: HTMLInputElement;
	let fileInputGallery: HTMLInputElement;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			$form.reviewImage = file;
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			previewUrl = URL.createObjectURL(file);
		}
	}

	function clearImage() {
		$form.reviewImage = undefined;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		if (fileInputCamera) fileInputCamera.value = '';
		if (fileInputGallery) fileInputGallery.value = '';
	}

	$effect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});
</script>

<svelte:head>
	<title>Review {data.restaurant.name} - Döner Finder</title>
</svelte:head>

<BackButton href="/doener/{data.restaurant.id}" />

<div class="mx-auto max-w-3xl space-y-4 px-4 py-4">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-2xl font-bold text-white">Review Döner</h1>
		<p class="text-sm text-gray-400">{data.restaurant.name} — {data.restaurant.city}</p>
	</div>

	<!-- Step Progress -->
	<div class="flex items-center justify-center gap-1">
		{#each stepMeta as s, i}
			<button
				type="button"
				onclick={() => (step = i)}
				class="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-all"
				class:bg-orange-600-20={i === step}
				class:text-orange-300={i === step}
				class:text-gray-500={i !== step && i > step}
				class:text-green-400={i < step}
			>
				<span class="text-lg">{i < step ? '✅' : s.emoji}</span>
				<span class="hidden font-medium sm:block">{s.label}</span>
			</button>
			{#if i < totalSteps - 1}
				<div
					class="h-0.5 w-4 rounded-full sm:w-8"
					class:bg-green-400={i < step}
					class:bg-orange-500={i === step}
					class:bg-gray-700={i > step}
				></div>
			{/if}
		{/each}
	</div>

	<!-- Error Message -->
	{#if $message}
		<div class="rounded-xl border border-red-500/30 bg-red-600/20 p-3">
			<p class="text-sm font-medium text-red-300">{$message}</p>
		</div>
	{/if}

	<!-- Form - all steps rendered, hidden with CSS -->
	<form method="POST" enctype="multipart/form-data" use:enhance>
		<!-- Hidden inputs for programmatically-set values -->
		<input type="hidden" name="meatStyle" value={$form.meatStyle} />
		<input type="hidden" name="meatJuiciness" value={$form.meatJuiciness} />
		<input type="hidden" name="meatCrispiness" value={$form.meatCrispiness} />
		<input type="hidden" name="meatDryFeel" value={$form.meatDryFeel} />
		<input type="hidden" name="meatFatty" value={$form.meatFatty} />
		<input type="hidden" name="meatRating" value={$form.meatRating} />
		<input type="hidden" name="breadShape" value={$form.breadShape} />
		<input type="hidden" name="breadThickness" value={$form.breadThickness} />
		<input type="hidden" name="breadCrispiness" value={$form.breadCrispiness} />
		<input type="hidden" name="breadFluffy" value={$form.breadFluffy} />
		<input type="hidden" name="veggiesRating" value={$form.veggiesRating} />
		<input type="hidden" name="sauceRating" value={$form.sauceRating} />
		<input type="hidden" name="overallFlavorRating" value={$form.overallFlavorRating} />
		<input type="hidden" name="doenerSize" value={$form.doenerSize} />
		<input type="hidden" name="cleanlinessRating" value={$form.cleanlinessRating} />

		<!-- ============ STEP 0: PHOTO ============ -->
		<div class={step === 0 ? '' : 'hidden'}>
			<div class="space-y-4 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<span class="text-3xl">📸</span>
					<div>
						<h2 class="text-lg font-semibold text-white">Snap Your Döner</h2>
						<p class="text-sm text-gray-400">Take a photo or upload from gallery</p>
					</div>
				</div>

				<!-- File inputs (hidden) -->
				<input
					bind:this={fileInputCamera}
					type="file"
					name="reviewImage"
					accept="image/*"
					capture="environment"
					class="hidden"
					onchange={handleFileSelect}
				/>
				<input
					bind:this={fileInputGallery}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handleFileSelect}
				/>

				{#if previewUrl}
					<div class="relative">
						<img
							src={previewUrl}
							alt="Döner preview"
							class="mx-auto max-h-64 rounded-xl border-2 border-orange-500/30 object-cover"
						/>
						<button
							type="button"
							onclick={clearImage}
							class="btn btn-circle btn-sm absolute top-2 right-2 bg-slate-800/80 hover:bg-red-600"
						>✕</button>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={() => fileInputCamera?.click()}
							class="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-orange-500/30 p-6 transition-all hover:border-orange-500 hover:bg-orange-600/10 active:scale-95"
						>
							<FluentCamera20Filled class="size-10 text-orange-400" />
							<span class="text-sm font-medium text-white">Take Photo</span>
							<span class="text-xs text-gray-500">Open camera</span>
						</button>
						<button
							type="button"
							onclick={() => fileInputGallery?.click()}
							class="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-orange-500/30 p-6 transition-all hover:border-orange-500 hover:bg-orange-600/10 active:scale-95"
						>
							<FluentImage20Filled class="size-10 text-orange-400" />
							<span class="text-sm font-medium text-white">Gallery</span>
							<span class="text-xs text-gray-500">Upload image</span>
						</button>
					</div>
				{/if}

				{#if data.restaurant.doenerImage}
					<p class="text-center text-xs text-gray-500">
						📌 Photo is optional — the restaurant already has an image
					</p>
				{/if}
			</div>
		</div>

		<!-- ============ STEP 1: MEAT ============ -->
		<div class={step === 1 ? '' : 'hidden'}>
			<div class="space-y-5 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<NotoMeatOnBone class="size-8" />
					<div>
						<h2 class="text-lg font-semibold text-white">Meat</h2>
						<p class="text-sm text-gray-400">What protein did you get?</p>
					</div>
				</div>

				<!-- Protein multiselect -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Protein(s)</p>
					<div class="flex flex-wrap gap-2">
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all"
							class:border-orange-400={$form.meatChicken}
							class:bg-orange-400-20={$form.meatChicken}
							class:border-slate-600={!$form.meatChicken}
							class:bg-slate-700-30={!$form.meatChicken}
						>
							<input
								type="checkbox"
								name="meatChicken"
								bind:checked={$form.meatChicken}
								class="checkbox checkbox-warning checkbox-sm"
							/>
							<span class="text-white">🐔 Chicken</span>
						</label>
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all"
							class:border-red-400={$form.meatBeef}
							class:bg-red-400-20={$form.meatBeef}
							class:border-slate-600={!$form.meatBeef}
							class:bg-slate-700-30={!$form.meatBeef}
						>
							<input
								type="checkbox"
								name="meatBeef"
								bind:checked={$form.meatBeef}
								class="checkbox checkbox-error checkbox-sm"
							/>
							<span class="text-white">🐄 Beef</span>
						</label>
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all"
							class:border-amber-400={$form.meatLamb}
							class:bg-amber-400-20={$form.meatLamb}
							class:border-slate-600={!$form.meatLamb}
							class:bg-slate-700-30={!$form.meatLamb}
						>
							<input
								type="checkbox"
								name="meatLamb"
								bind:checked={$form.meatLamb}
								class="checkbox checkbox-warning checkbox-sm"
							/>
							<span class="text-white">🐑 Lamb</span>
						</label>
					</div>
				</div>

				<!-- Meat style -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Cut Style</p>
					<div class="grid grid-cols-2 gap-2">
						{#each ['minced', 'layered'] as style}
							<button
								type="button"
								onclick={() => ($form.meatStyle = style)}
								class="rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all"
								class:border-orange-400={$form.meatStyle === style}
								class:bg-orange-400-20={$form.meatStyle === style}
								class:text-orange-200={$form.meatStyle === style}
								class:border-slate-600={$form.meatStyle !== style}
								class:bg-slate-700-30={$form.meatStyle !== style}
								class:text-gray-300={$form.meatStyle !== style}
							>
								{style === 'minced' ? '🔪 Minced' : '📐 Layered'}
							</button>
						{/each}
					</div>
				</div>

				<!-- Juiciness slider -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Juiciness</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.meatJuiciness = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.meatJuiciness !== val}
								class:bg-slate-700-30={$form.meatJuiciness !== val}
								class:text-gray-400={$form.meatJuiciness !== val}
								class:text-white={$form.meatJuiciness === val}
								class:font-bold={$form.meatJuiciness === val}
								class:scale-105={$form.meatJuiciness === val}
								style={$form.meatJuiciness === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('juiciness')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Crispiness -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Crispiness</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.meatCrispiness = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.meatCrispiness !== val}
								class:bg-slate-700-30={$form.meatCrispiness !== val}
								class:text-gray-400={$form.meatCrispiness !== val}
								class:text-white={$form.meatCrispiness === val}
								class:font-bold={$form.meatCrispiness === val}
								class:scale-105={$form.meatCrispiness === val}
								style={$form.meatCrispiness === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('crispiness')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Dry feel -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">
						Dry Feel After Eating <span class="text-xs text-gray-500">(salts, additives)</span>
					</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.meatDryFeel = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.meatDryFeel !== val}
								class:bg-slate-700-30={$form.meatDryFeel !== val}
								class:text-gray-400={$form.meatDryFeel !== val}
								class:text-white={$form.meatDryFeel === val}
								class:font-bold={$form.meatDryFeel === val}
								class:scale-105={$form.meatDryFeel === val}
								style={$form.meatDryFeel === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('dryFeel')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Fatty -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Fattiness</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.meatFatty = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.meatFatty !== val}
								class:bg-slate-700-30={$form.meatFatty !== val}
								class:text-gray-400={$form.meatFatty !== val}
								class:text-white={$form.meatFatty === val}
								class:font-bold={$form.meatFatty === val}
								class:scale-105={$form.meatFatty === val}
								style={$form.meatFatty === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('fatty')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Overall meat quality -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Overall Meat Quality</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.meatRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.meatRating !== rating}
								class:bg-slate-700-30={$form.meatRating !== rating}
								style={$form.meatRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ============ STEP 2: BREAD ============ -->
		<div class={step === 2 ? '' : 'hidden'}>
			<div class="space-y-5 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<NotoBread class="size-8" />
					<div>
						<h2 class="text-lg font-semibold text-white">Bread</h2>
						<p class="text-sm text-gray-400">How was the bread?</p>
					</div>
				</div>

				<!-- Shape -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Shape</p>
					<div class="grid grid-cols-3 gap-2">
						{#each [{ v: 'round', l: '⚪ Round' }, { v: 'triangle', l: '🔺 Triangle' }, { v: 'long', l: '📏 Long' }] as shape}
							<button
								type="button"
								onclick={() => ($form.breadShape = shape.v)}
								class="rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all"
								class:border-orange-400={$form.breadShape === shape.v}
								class:bg-orange-400-20={$form.breadShape === shape.v}
								class:text-orange-200={$form.breadShape === shape.v}
								class:border-slate-600={$form.breadShape !== shape.v}
								class:bg-slate-700-30={$form.breadShape !== shape.v}
								class:text-gray-300={$form.breadShape !== shape.v}
							>
								{shape.l}
							</button>
						{/each}
					</div>
				</div>

				<!-- Thickness -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Thickness</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.breadThickness = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.breadThickness !== val}
								class:bg-slate-700-30={$form.breadThickness !== val}
								class:text-gray-400={$form.breadThickness !== val}
								class:text-white={$form.breadThickness === val}
								class:font-bold={$form.breadThickness === val}
								class:scale-105={$form.breadThickness === val}
								style={$form.breadThickness === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('thickness')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Crispiness -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Crispiness</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.breadCrispiness = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.breadCrispiness !== val}
								class:bg-slate-700-30={$form.breadCrispiness !== val}
								class:text-gray-400={$form.breadCrispiness !== val}
								class:text-white={$form.breadCrispiness === val}
								class:font-bold={$form.breadCrispiness === val}
								class:scale-105={$form.breadCrispiness === val}
								style={$form.breadCrispiness === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('crispiness')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Fluffy -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Fluffy Inside</p>
					<div class="grid grid-cols-4 gap-1.5">
						{#each [1, 2, 3, 4] as val}
							<button
								type="button"
								onclick={() => ($form.breadFluffy = val)}
								class="rounded-lg border-2 px-2 py-2 text-center text-xs font-medium transition-all"
								class:border-slate-600={$form.breadFluffy !== val}
								class:bg-slate-700-30={$form.breadFluffy !== val}
								class:text-gray-400={$form.breadFluffy !== val}
								class:text-white={$form.breadFluffy === val}
								class:font-bold={$form.breadFluffy === val}
								class:scale-105={$form.breadFluffy === val}
								style={$form.breadFluffy === val
									? `border-color: var(--color-blue-400); background: rgba(96, 165, 250, 0.2);`
									: ''}
							>
								{getLevelLabels('fluffy')[val - 1]}
							</button>
						{/each}
					</div>
				</div>

				<!-- Sesame seeds -->
				<label
					class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
				>
					<input
						type="checkbox"
						name="breadSesameSeeds"
						bind:checked={$form.breadSesameSeeds}
						class="checkbox checkbox-warning"
					/>
					<span class="text-white">🌰 Has sesame seeds</span>
				</label>

				<!-- Overall bread quality -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Overall Bread Quality</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.breadRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.breadRating !== rating}
								class:bg-slate-700-30={$form.breadRating !== rating}
								style={$form.breadRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ============ STEP 3: VEGGIES ============ -->
		<div class={step === 3 ? '' : 'hidden'}>
			<div class="space-y-5 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<NotoLeafyGreen class="size-8" />
					<div>
						<h2 class="text-lg font-semibold text-white">Veggies</h2>
						<p class="text-sm text-gray-400">What came in your döner?</p>
					</div>
				</div>

				<!-- Veggie checkboxes -->
				<div class="space-y-2">
					<p class="text-sm font-medium text-orange-200/90">Ingredients</p>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasTomatoes"
							bind:checked={$form.hasTomatoes}
							class="checkbox checkbox-warning checkbox-sm"
						/>
						<span class="text-white">🍅 Tomatoes</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasCabbage"
							bind:checked={$form.hasCabbage}
							class="checkbox checkbox-warning checkbox-sm"
						/>
						<span class="text-white">🥬 White Cabbage</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasRucola"
							bind:checked={$form.hasRucola}
							class="checkbox checkbox-warning checkbox-sm"
						/>
						<span class="text-white">🌿 Rucola</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasCorn"
							bind:checked={$form.hasCorn}
							class="checkbox checkbox-warning checkbox-sm"
						/>
						<span class="text-white">🌽 Corn</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasParsley"
							bind:checked={$form.hasParsley}
							class="checkbox checkbox-warning checkbox-sm"
						/>
						<span class="text-white">🌱 Parsley</span>
					</label>
				</div>

				<!-- Onion type -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">🧅 Onions</p>
					<div class="grid grid-cols-4 gap-2">
						<input type="hidden" name="onionType" value={$form.onionType ?? ''} />
						<button
							type="button"
							onclick={() => ($form.onionType = null)}
							class="rounded-lg border-2 px-2 py-2.5 text-xs font-medium transition-all"
							class:border-orange-400={$form.onionType === null}
							class:bg-orange-400-20={$form.onionType === null}
							class:text-orange-200={$form.onionType === null}
							class:border-slate-600={$form.onionType !== null}
							class:text-gray-400={$form.onionType !== null}
						>
							None
						</button>
						{#each [{ v: 'spicy', l: '🌶️ Spicy' }, { v: 'toned_down', l: '😌 Mild' }, { v: 'sweet', l: '🍯 Sweet' }] as opt}
							<button
								type="button"
								onclick={() => ($form.onionType = opt.v)}
								class="rounded-lg border-2 px-2 py-2.5 text-xs font-medium transition-all"
								class:border-orange-400={$form.onionType === opt.v}
								class:bg-orange-400-20={$form.onionType === opt.v}
								class:text-orange-200={$form.onionType === opt.v}
								class:border-slate-600={$form.onionType !== opt.v}
								class:text-gray-400={$form.onionType !== opt.v}
							>
								{opt.l}
							</button>
						{/each}
					</div>
				</div>

				<!-- Red cabbage -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">🥗 Red Cabbage</p>
					<div class="grid grid-cols-3 gap-2">
						<input type="hidden" name="redCabbageType" value={$form.redCabbageType ?? ''} />
						<button
							type="button"
							onclick={() => ($form.redCabbageType = null)}
							class="rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-all"
							class:border-orange-400={$form.redCabbageType === null}
							class:bg-orange-400-20={$form.redCabbageType === null}
							class:text-orange-200={$form.redCabbageType === null}
							class:border-slate-600={$form.redCabbageType !== null}
							class:text-gray-400={$form.redCabbageType !== null}
						>
							None
						</button>
						{#each [{ v: 'sour', l: '🍋 Sour' }, { v: 'natural', l: '🌿 Natural' }] as opt}
							<button
								type="button"
								onclick={() => ($form.redCabbageType = opt.v)}
								class="rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-all"
								class:border-orange-400={$form.redCabbageType === opt.v}
								class:bg-orange-400-20={$form.redCabbageType === opt.v}
								class:text-orange-200={$form.redCabbageType === opt.v}
								class:border-slate-600={$form.redCabbageType !== opt.v}
								class:text-gray-400={$form.redCabbageType !== opt.v}
							>
								{opt.l}
							</button>
						{/each}
					</div>
				</div>

				<!-- Salad type -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">🥗 Salad Type (optional)</p>
					<input
						type="text"
						name="saladType"
						bind:value={$form.saladType}
						placeholder="e.g., iceberg, mixed, romaine..."
						maxlength="50"
						class="input w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
					/>
				</div>

				<!-- Overall veggies quality -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Overall Veggies Quality</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.veggiesRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.veggiesRating !== rating}
								class:bg-slate-700-30={$form.veggiesRating !== rating}
								style={$form.veggiesRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ============ STEP 4: SAUCES ============ -->
		<div class={step === 4 ? '' : 'hidden'}>
			<div class="space-y-5 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<FluentEmojiSalt class="size-8" />
					<div>
						<h2 class="text-lg font-semibold text-white">Sauces</h2>
						<p class="text-sm text-gray-400">Which sauces were used?</p>
					</div>
				</div>

				<div class="space-y-2">
					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasHerbalSauce"
							bind:checked={$form.hasHerbalSauce}
							class="checkbox checkbox-warning"
						/>
						<span class="text-white">🌿 Herbal Sauce</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasYoghurtSauce"
							bind:checked={$form.hasYoghurtSauce}
							class="checkbox checkbox-warning"
						/>
						<span class="text-white">🥛 Yoghurt Sauce</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasGarlicSauce"
							bind:checked={$form.hasGarlicSauce}
							class="checkbox checkbox-warning"
						/>
						<span class="text-white">🧄 Garlic Sauce</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasCocktailSauce"
							bind:checked={$form.hasCocktailSauce}
							class="checkbox checkbox-warning"
						/>
						<span class="text-white">🍹 Cocktail Sauce</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							name="hasSpicySauce"
							bind:checked={$form.hasSpicySauce}
							class="checkbox checkbox-warning"
						/>
						<span class="text-white">🌶️ Spicy Sauce</span>
					</label>
				</div>

				<!-- Overall sauce quality -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Overall Sauce Quality</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.sauceRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.sauceRating !== rating}
								class:bg-slate-700-30={$form.sauceRating !== rating}
								style={$form.sauceRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- ============ STEP 5: OVERALL ============ -->
		<div class={step === 5 ? '' : 'hidden'}>
			<div class="space-y-5 rounded-xl border border-white/5 bg-slate-800/50 p-5">
				<div class="flex items-center gap-3">
					<FluentStar20Filled class="size-8 text-yellow-400" />
					<div>
						<h2 class="text-lg font-semibold text-white">Overall</h2>
						<p class="text-sm text-gray-400">Final thoughts on this döner</p>
					</div>
				</div>

				<!-- Overall flavor -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Overall Flavor</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.overallFlavorRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.overallFlavorRating !== rating}
								class:bg-slate-700-30={$form.overallFlavorRating !== rating}
								style={$form.overallFlavorRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Size -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">Döner Size</p>
					<div class="grid grid-cols-3 gap-2">
						{#each [{ v: 'small', l: '🤏 Small' }, { v: 'medium', l: '👌 Medium' }, { v: 'large', l: '💪 Large' }] as size}
							<button
								type="button"
								onclick={() => ($form.doenerSize = size.v)}
								class="rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all"
								class:border-orange-400={$form.doenerSize === size.v}
								class:bg-orange-400-20={$form.doenerSize === size.v}
								class:text-orange-200={$form.doenerSize === size.v}
								class:border-slate-600={$form.doenerSize !== size.v}
								class:bg-slate-700-30={$form.doenerSize !== size.v}
								class:text-gray-300={$form.doenerSize !== size.v}
							>
								{size.l}
							</button>
						{/each}
					</div>
				</div>

				<!-- Price -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">💰 Price (€, optional)</p>
					<input
						type="number"
						name="price"
						step="0.5"
						min="0"
						max="100"
						placeholder="e.g., 7.50"
						bind:value={$form.price}
						class="input w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
					/>
				</div>

				<!-- Cleanliness -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">🧹 Cleanliness / Hygiene</p>
					<div class="grid grid-cols-4 gap-2">
						{#each [1, 2, 3, 4] as rating}
							<button
								type="button"
								onclick={() => ($form.cleanlinessRating = rating)}
								class="flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:scale-105"
								class:border-slate-600={$form.cleanlinessRating !== rating}
								class:bg-slate-700-30={$form.cleanlinessRating !== rating}
								style={$form.cleanlinessRating === rating
									? rating === 4
										? 'border-color: #4ade80; background: rgba(74,222,128,0.2);'
										: rating === 3
											? 'border-color: #60a5fa; background: rgba(96,165,250,0.2);'
											: rating === 2
												? 'border-color: #facc15; background: rgba(250,204,21,0.2);'
												: 'border-color: #fb923c; background: rgba(251,146,60,0.2);'
									: ''}
							>
								<span class="text-2xl">{qualityEmojis[rating - 1]}</span>
								<span class="text-[10px] font-medium text-white"
									>{['Sub Avg', 'Average', 'Good', 'Excellent'][rating - 1]}</span
								>
							</button>
						{/each}
					</div>
				</div>

				<!-- Description -->
				<div>
					<p class="mb-2 text-sm font-medium text-orange-200/90">📝 Your Review (optional)</p>
					<textarea
						name="description"
						bind:value={$form.description}
						rows="3"
						placeholder="Share your thoughts about this döner..."
						maxlength="200"
						class="textarea w-full border-slate-600/30 bg-slate-700/50 text-white placeholder:text-gray-500"
					></textarea>
					<p class="text-xs text-gray-500">{$form.description?.length || 0}/200 characters</p>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<div class="flex gap-3 pt-2">
			{#if step > 0}
				<button
					type="button"
					onclick={prevStep}
					class="btn flex-1 border-slate-600/30 bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
				>
					← Back
				</button>
			{:else}
				<a
					href="/doener/{data.restaurant.id}"
					class="btn flex-1 border-slate-600/30 bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
				>
					Cancel
				</a>
			{/if}

			{#if step < totalSteps - 1}
				<button
					type="button"
					onclick={nextStep}
					class="btn flex-1 gap-2 border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
				>
					Next →
				</button>
			{:else}
				<button
					type="submit"
					disabled={$submitting}
					class="btn flex-1 gap-2 border-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500"
				>
					{#if $delayed}
						<span class="loading loading-spinner loading-sm"></span>
						Submitting...
					{:else}
						<FluentCheckmark20Filled class="size-5" />
						Submit Review
					{/if}
				</button>
			{/if}
		</div>
	</form>
</div>
