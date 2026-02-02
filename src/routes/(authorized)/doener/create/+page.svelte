<!-- src/routes/doener/create/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { createDoenerSchema } from './schema';
	import FluentEmojiStuffedFlatbread from '~icons/fluent-emoji/stuffed-flatbread';
	import FluentCheckmark20Filled from '~icons/fluent/checkmark-20-filled';
	import FluentImage20Filled from '~icons/fluent/image-20-filled';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentEmojiBread from '~icons/fluent-emoji/bread';
	import FluentEmojiPoultryLeg from '~icons/fluent-emoji/poultry-leg';
	import FluentEmojiOnion from '~icons/fluent-emoji/onion';
	import FluentEmojiLeafyGreen from '~icons/fluent-emoji/leafy-green';
	import FluentEmojiBottleWithPoppingCork from '~icons/fluent-emoji/bottle-with-popping-cork';
	import BackButton from '$lib/components/BackButton.svelte';
	import LocationPicker from '$lib/components/maps/LocationPicker.svelte';

	let { data } = $props();

	const { form, errors, message, enhance, submitting, delayed } = superForm(data.form, {
		validators: valibotClient(createDoenerSchema),
		multipleSubmits: 'prevent',
		clearOnSubmit: 'none',
		taintedMessage: null
	});

	let previewUrl = $state<string | null>(null);
	let dragActive = $state(false);
	let fileInput: HTMLInputElement;

	function handleLocationChange(lat: number, lon: number, address?: string) {
		$form.latitude = lat;
		$form.longitude = lon;
	}

	// Cropper states
	let showCropModal = $state(false);
	let cropperImage = $state<string | null>(null);
	let cropCanvas: HTMLCanvasElement;
	let cropContext: CanvasRenderingContext2D | null = null;
	let img: HTMLImageElement | null = null;
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let cropArea = $state({ x: 0, y: 0, size: 0 });
	let scale = $state(1);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			openCropper(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		const file = event.dataTransfer?.files[0];
		if (file) {
			openCropper(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	function openCropper(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			cropperImage = e.target?.result as string;
			showCropModal = true;
			// Wait for DOM to update before initializing
			setTimeout(initializeCropper, 50);
		};
		reader.readAsDataURL(file);
	}

	function initializeCropper() {
		if (!cropCanvas || !cropperImage) return;

		cropContext = cropCanvas.getContext('2d');
		if (!cropContext) return;

		img = new Image();
		img.onload = () => {
			if (!img || !cropCanvas) return;

			// Set canvas size to contain the image
			const maxSize = 600;
			const aspectRatio = img.width / img.height;

			if (img.width > img.height) {
				cropCanvas.width = maxSize;
				cropCanvas.height = maxSize / aspectRatio;
			} else {
				cropCanvas.height = maxSize;
				cropCanvas.width = maxSize * aspectRatio;
			}

			// Initialize crop area (square in center)
			const minDimension = Math.min(cropCanvas.width, cropCanvas.height);
			cropArea = {
				x: (cropCanvas.width - minDimension) / 2,
				y: (cropCanvas.height - minDimension) / 2,
				size: minDimension
			};

			scale = cropCanvas.width / img.width;
			drawCropper();
		};
		img.src = cropperImage;
	}

	function drawCropper() {
		if (!cropContext || !img || !cropCanvas) return;

		// Clear canvas
		cropContext.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

		// Draw image
		cropContext.drawImage(img, 0, 0, cropCanvas.width, cropCanvas.height);

		// Draw overlay (darken everything outside crop area)
		cropContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
		cropContext.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

		// Clear the crop area (make it bright)
		cropContext.clearRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
		cropContext.drawImage(
			img,
			cropArea.x / scale,
			cropArea.y / scale,
			cropArea.size / scale,
			cropArea.size / scale,
			cropArea.x,
			cropArea.y,
			cropArea.size,
			cropArea.size
		);

		// Draw crop border
		cropContext.strokeStyle = '#fb923c';
		cropContext.lineWidth = 3;
		cropContext.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);

		// Draw corner handles
		const handleSize = 20;
		cropContext.fillStyle = '#fb923c';
		const corners = [
			{ x: cropArea.x, y: cropArea.y },
			{ x: cropArea.x + cropArea.size, y: cropArea.y },
			{ x: cropArea.x, y: cropArea.y + cropArea.size },
			{ x: cropArea.x + cropArea.size, y: cropArea.y + cropArea.size }
		];

		corners.forEach((corner) => {
			cropContext!.fillRect(
				corner.x - handleSize / 2,
				corner.y - handleSize / 2,
				handleSize,
				handleSize
			);
		});

		// Draw center handle
		cropContext.fillStyle = '#fb923c';
		cropContext.fillRect(
			cropArea.x + cropArea.size / 2 - handleSize / 2,
			cropArea.y + cropArea.size / 2 - handleSize / 2,
			handleSize,
			handleSize
		);
	}

	function handleMouseDown(event: MouseEvent) {
		if (!cropCanvas) return;

		const rect = cropCanvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Check if clicking inside crop area for dragging
		if (
			x >= cropArea.x &&
			x <= cropArea.x + cropArea.size &&
			y >= cropArea.y &&
			y <= cropArea.y + cropArea.size
		) {
			isDragging = true;
			dragStart = { x: x - cropArea.x, y: y - cropArea.y };
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || !cropCanvas) return;

		const rect = cropCanvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Calculate new position
		let newX = x - dragStart.x;
		let newY = y - dragStart.y;

		// Constrain to canvas bounds
		newX = Math.max(0, Math.min(newX, cropCanvas.width - cropArea.size));
		newY = Math.max(0, Math.min(newY, cropCanvas.height - cropArea.size));

		cropArea = { ...cropArea, x: newX, y: newY };
		drawCropper();
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		if (!cropCanvas) return;

		const delta = event.deltaY > 0 ? -10 : 10;
		const newSize = Math.max(
			50,
			Math.min(cropArea.size + delta, Math.min(cropCanvas.width, cropCanvas.height))
		);

		// Adjust position to keep center stable
		const centerX = cropArea.x + cropArea.size / 2;
		const centerY = cropArea.y + cropArea.size / 2;

		let newX = centerX - newSize / 2;
		let newY = centerY - newSize / 2;

		// Constrain to canvas bounds
		newX = Math.max(0, Math.min(newX, cropCanvas.width - newSize));
		newY = Math.max(0, Math.min(newY, cropCanvas.height - newSize));

		cropArea = { x: newX, y: newY, size: newSize };
		drawCropper();
	}

	async function applyCrop() {
		if (!img || !cropCanvas) return;

		// Create a new canvas for the cropped image
		const outputCanvas = document.createElement('canvas');
		const outputSize = 800; // Output square size
		outputCanvas.width = outputSize;
		outputCanvas.height = outputSize;
		const outputContext = outputCanvas.getContext('2d');

		if (!outputContext) return;

		// Calculate source rectangle in original image coordinates
		const sourceX = cropArea.x / scale;
		const sourceY = cropArea.y / scale;
		const sourceSize = cropArea.size / scale;

		// Draw cropped portion to output canvas
		outputContext.drawImage(
			img,
			sourceX,
			sourceY,
			sourceSize,
			sourceSize,
			0,
			0,
			outputSize,
			outputSize
		);

		// Convert to blob and create file
		outputCanvas.toBlob(
			(blob) => {
				if (!blob) return;

				const file = new File([blob], 'cropped-doener.jpg', { type: 'image/jpeg' });
				$form.doenerImage = file;
				updatePreview(file);
				closeCropper();
			},
			'image/jpeg',
			0.9
		);
	}

	function closeCropper() {
		showCropModal = false;
		cropperImage = null;
		img = null;
		isDragging = false;
		if (fileInput) {
			fileInput.value = '';
		}
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

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			if (cropperImage) {
				cropperImage = null;
			}
		};
	});

	// Initialize form defaults
	$effect(() => {
		if ($form.breadShape === undefined) {
			$form.breadShape = 'triangular';
		}
		if ($form.breadHasSesame === undefined) {
			$form.breadHasSesame = false;
		}
		if ($form.breadFluffyInside === undefined) {
			$form.breadFluffyInside = false;
		}
		if ($form.breadCrispyOutside === undefined) {
			$form.breadCrispyOutside = false;
		}
		if ($form.hasYoghurtSauce === undefined) {
			$form.hasYoghurtSauce = false;
		}
		if ($form.hasGarlicSauce === undefined) {
			$form.hasGarlicSauce = false;
		}
	});
</script>

<svelte:head>
	<title>Add a Döner - Döner Finder</title>
</svelte:head>

<BackButton href="/" />

<!-- Image Cropper Modal -->
{#if showCropModal}
	<div class="modal modal-open">
		<div class="modal-box max-w-2xl bg-black">
			<h3 class="mb-2 text-xl font-bold text-orange-300">Crop Your Döner Photo</h3>

			<div class="flex justify-center">
				<canvas
					bind:this={cropCanvas}
					onmousedown={handleMouseDown}
					onmousemove={handleMouseMove}
					onmouseup={handleMouseUp}
					onmouseleave={handleMouseUp}
					onwheel={handleWheel}
					class="cursor-move rounded-lg border-2 border-orange-500/40"
					style="max-width: 100%; height: auto; touch-action: none;"
				></canvas>
			</div>

			<div class="modal-action mt-2">
				<button
					type="button"
					onclick={closeCropper}
					class="btn rounded-xl border-2 border-slate-600/30 bg-slate-700/50 text-gray-300 hover:bg-slate-600/50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={applyCrop}
					class="btn rounded-xl border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
				>
					<FluentCheckmark20Filled class="size-5" />
					Apply Crop
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="mx-auto max-w-3xl space-y-6 px-4 py-6">
	<!-- Header -->
	<header class="mb-10 text-center">
		<div class="mb-4 flex justify-center">
			<div
				class="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
			>
				<FluentEmojiStuffedFlatbread class="size-12" />
			</div>
		</div>
		<h1 class="text-4xl font-bold text-white">Add a Döner Restaurant</h1>
		<p class="mt-2 text-lg text-orange-200/90">Share a new döner spot with the community</p>
	</header>

	<!-- Error Message -->
	{#if $message}
		<div
			class="card border border-red-500/30 bg-gradient-to-br from-red-900/30 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body p-4">
				<p class="text-sm font-medium text-red-300">{$message}</p>
			</div>
		</div>
	{/if}

	<!-- Form -->
	<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-6">
		<!-- Restaurant Details -->
		<div
			class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body space-y-4 p-4 md:p-6">
				<div class="flex items-center gap-2">
					<FluentLocation20Filled class="size-5 text-orange-400" />
					<h2 class="text-lg font-semibold text-orange-200">Restaurant Location</h2>
				</div>

				<div>
					<label for="restaurantName" class="mb-2 block text-sm font-medium text-orange-200/90">
						Restaurant Name <span class="text-red-400">*</span>
					</label>
					<input
						type="text"
						id="restaurantName"
						name="restaurantName"
						bind:value={$form.restaurantName}
						placeholder="e.g., Mustafa's Gemüse Döner"
						maxlength="50"
						class="input w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white placeholder-orange-300/50 backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
						class:input-error={$errors.restaurantName}
						disabled={$submitting}
					/>
					{#if $errors.restaurantName}
						<p class="mt-1 text-xs text-red-400">{$errors.restaurantName}</p>
					{/if}
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium text-orange-200/90">
						Location <span class="text-red-400">*</span>
					</label>
					<LocationPicker
						bind:latitude={$form.latitude}
						bind:longitude={$form.longitude}
						onLocationChange={handleLocationChange}
					/>
					{#if $errors.latitude || $errors.longitude}
						<p class="mt-2 text-xs text-red-400">
							{$errors.latitude || $errors.longitude}
						</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Döner Image -->
		<div
			class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body space-y-4 p-4 md:p-6">
				<div class="flex items-center gap-2">
					<FluentImage20Filled class="size-5 text-orange-400" />
					<h2 class="text-lg font-semibold text-orange-200">Döner Photo (Optional)</h2>
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
						class="group relative w-full overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 active:scale-[0.98]"
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
										<p class="mt-1 text-sm text-orange-200/70">
											Images only • 10MB max • Will be cropped to square
										</p>
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
		</div>

		<!-- Bread Characteristics -->
		<div
			class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body space-y-4 p-4 md:p-6">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
					<FluentEmojiBread class="size-5" />
					Bread Characteristics
				</h2>

				<div>
					<label for="breadShape" class="mb-2 block text-sm font-medium text-orange-200/90">
						Bread Shape <span class="text-red-400">*</span>
					</label>
					<select
						id="breadShape"
						name="breadShape"
						bind:value={$form.breadShape}
						class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
						class:input-error={$errors.breadShape}
						disabled={$submitting}
					>
						<option value="triangular">Triangular</option>
						<option value="circular">Circular</option>
						<option value="long">Long</option>
					</select>
					{#if $errors.breadShape}
						<p class="mt-1 text-xs text-red-400">{$errors.breadShape}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							bind:checked={$form.breadHasSesame}
							class="checkbox checkbox-warning"
							disabled={$submitting}
						/>
						<span class="text-white">Has sesame seeds</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							bind:checked={$form.breadFluffyInside}
							class="checkbox checkbox-warning"
							disabled={$submitting}
						/>
						<span class="text-white">Fluffy inside</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
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
		</div>

		<!-- Meat Details -->
		<div
			class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body space-y-4 p-4 md:p-6">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
					<FluentEmojiPoultryLeg class="size-5" />
					Meat Details
				</h2>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label for="meatType" class="mb-2 block text-sm font-medium text-orange-200/90">
							Meat Type <span class="text-red-400">*</span>
						</label>
						<select
							id="meatType"
							name="meatType"
							bind:value={$form.meatType}
							class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
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
						<label for="meatProtein" class="mb-2 block text-sm font-medium text-orange-200/90">
							Protein <span class="text-red-400">*</span>
						</label>
						<select
							id="meatProtein"
							name="meatProtein"
							bind:value={$form.meatProtein}
							class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
							class:input-error={$errors.meatProtein}
							disabled={$submitting}
						>
							<option value="">Select...</option>
							<option value="chicken">Chicken</option>
							<option value="beef">Beef</option>
							<option value="lamb">Lamb</option>
							<option value="mixed">Mixed</option>
						</select>
						{#if $errors.meatProtein}
							<p class="mt-1 text-xs text-red-400">{$errors.meatProtein}</p>
						{/if}
					</div>

					<div>
						<label for="meatSeasoning" class="mb-2 block text-sm font-medium text-orange-200/90">
							Seasoning <span class="text-red-400">*</span>
						</label>
						<select
							id="meatSeasoning"
							name="meatSeasoning"
							bind:value={$form.meatSeasoning}
							class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
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
		</div>

		<!-- Toppings & Sauces -->
		<div
			class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
		>
			<div class="card-body space-y-4 p-4 md:p-6">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-orange-200">
					<FluentEmojiOnion class="size-5" />
					Toppings & Sauces
				</h2>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="onionLevel" class="mb-2 block text-sm font-medium text-orange-200/90">
							Onion Level (Optional)
						</label>
						<select
							id="onionLevel"
							name="onionLevel"
							bind:value={$form.onionLevel}
							class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
							class:input-error={$errors.onionLevel}
							disabled={$submitting}
						>
							<option value={null}>None</option>
							<option value="mild">Mild</option>
							<option value="spicy">Spicy 🌶️</option>
						</select>
						{#if $errors.onionLevel}
							<p class="mt-1 text-xs text-red-400">{$errors.onionLevel}</p>
						{/if}
					</div>

					<div>
						<label for="krautLevel" class="mb-2 block text-sm font-medium text-orange-200/90">
							Kraut Level (Optional)
						</label>
						<select
							id="krautLevel"
							name="krautLevel"
							bind:value={$form.krautLevel}
							class="select w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 text-white backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
							class:input-error={$errors.krautLevel}
							disabled={$submitting}
						>
							<option value={null}>None</option>
							<option value="mild">Mild</option>
							<option value="sour">Sour</option>
						</select>
						{#if $errors.krautLevel}
							<p class="mt-1 text-xs text-red-400">{$errors.krautLevel}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2 pt-2">
					<p class="text-sm font-medium text-orange-200/90">Sauces:</p>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
						<input
							type="checkbox"
							bind:checked={$form.hasYoghurtSauce}
							class="checkbox checkbox-warning"
							disabled={$submitting}
						/>
						<span class="text-white">Yoghurt sauce</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-700/30 p-3 transition-colors hover:bg-slate-700/50"
					>
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
		</div>

		<!-- Submit -->
		<div class="flex gap-3">
			<a
				href="/"
				class="btn flex-1 rounded-xl border-2 border-slate-600/30 bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white"
				class:btn-disabled={$submitting}
			>
				Cancel
			</a>
			<button
				type="submit"
				disabled={$submitting}
				class="btn flex-1 gap-2 rounded-xl border-0 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
			>
				{#if $delayed}
					<span class="loading loading-spinner loading-sm"></span>
					Submitting...
				{:else}
					<FluentCheckmark20Filled class="size-5" />
					Add Restaurant
				{/if}
			</button>
		</div>
	</form>
</div>
