<!-- src/routes/station/[id]/edit/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentEmojiDownArrow from '~icons/fluent-emoji/down-arrow';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiThreeOClock from '~icons/fluent-emoji/three-oclock';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiWarning from '~icons/fluent-emoji/warning';
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import type { Station } from '$lib/types';

	interface Props {
		data: {
			station: Station;
			isAdmin: boolean;
			hasPendingEdit: boolean;
		};
	}

	let { data }: Props = $props();
	let isSubmitting = $state(false);
	let hasSubmitted = $state(false);
	let showUnsavedDialog = $state(false);
	let showConfirmSaveDialog = $state(false);
	let pendingNavigationUrl: string | null = null;
	let allowNavigation = $state(false);
	let formElement: HTMLFormElement;

	// Helper function to normalize values (null/undefined to empty string)
	function normalize(value: any): string | boolean {
		if (typeof value === 'boolean') return value;
		return value ?? '';
	}

	// Store original values for comparison (from the station data which already includes pending edits)
	const originalValues = {
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: normalize(data.station.sleep_notes),
		has_outlets: data.station.has_outlets,
		outlet_notes: normalize(data.station.outlet_notes),
		has_toilets: data.station.has_toilets,
		toilet_notes: normalize(data.station.toilet_notes),
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: normalize(data.station.opening_hours),
		has_wifi: data.station.has_wifi,
		wifi_has_limit: data.station.wifi_has_limit,
		wifi_notes: normalize(data.station.wifi_notes),
		additional_info: normalize(data.station.additional_info)
	};

	// Form state
	let formState = $state({
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: normalize(data.station.sleep_notes),
		has_outlets: data.station.has_outlets,
		outlet_notes: normalize(data.station.outlet_notes),
		has_toilets: data.station.has_toilets,
		toilet_notes: normalize(data.station.toilet_notes),
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: normalize(data.station.opening_hours),
		has_wifi: data.station.has_wifi,
		wifi_has_limit: data.station.wifi_has_limit,
		wifi_notes: normalize(data.station.wifi_notes),
		additional_info: normalize(data.station.additional_info)
	});

	// Check if form has been modified
	const hasChanges = $derived(
		Object.keys(formState).some((key) => formState[key] !== originalValues[key])
	);

	const buttonText = $derived(
		data.isAdmin ? 'Save Changes' : data.hasPendingEdit ? 'Update Pending Change' : 'Submit Changes'
	);

	const dialogTitle = $derived(
		data.isAdmin
			? 'Confirm Changes'
			: data.hasPendingEdit
				? 'Update Pending Changes'
				: 'Submit for Review'
	);

	const dialogMessage = $derived(
		data.isAdmin
			? 'Are you sure you want to save these changes? They will be applied immediately.'
			: data.hasPendingEdit
				? 'Are you sure you want to update your pending changes? Your previous submission will be replaced with these new values.'
				: 'Are you sure you want to submit these changes? An administrator will review them before they are applied.'
	);

	function goBack() {
		console.log('goBack');

		if (hasChanges && !hasSubmitted) {
			pendingNavigationUrl = `/station/${data.station.eva}`;
			showUnsavedDialog = true;
		} else {
			goto(`/station/${data.station.eva}`);
		}
	}

	function confirmLeave() {
		console.log('confirmLeave', pendingNavigationUrl);
		showUnsavedDialog = false;
		allowNavigation = true;

		if (pendingNavigationUrl) {
			const url = pendingNavigationUrl;
			pendingNavigationUrl = null;
			goto(url);
		}
	}

	function cancelLeave() {
		console.log('cancelLeave');
		showUnsavedDialog = false;
		pendingNavigationUrl = null;
	}

	beforeNavigate(({ cancel, to }) => {
		// Allow navigation if we've submitted or explicitly allowed it
		if (hasSubmitted || allowNavigation || isSubmitting) {
			allowNavigation = false; // Reset for next navigation
			return;
		}

		// If there are changes, block and show dialog
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
		isSubmitting = true;
		allowNavigation = true; // Allow navigation after submit
		return async ({ result, update }: any) => {
			await update();
			hasSubmitted = true;
			isSubmitting = false;

			if (result.type === 'success' || result.type === 'redirect') {
				goto(`/station/${data.station.eva}`);
			} else if (result.location) {
				goto(result.location);
			}
		};
	}

	// Reusable form field component props
	const fieldClass =
		'w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none';
	const checkboxClass =
		'size-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400';
	const sectionClass = 'rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm';
</script>

<svelte:head>
	<title>Edit {data.station.name || 'Station'} - Station Details</title>
	<meta name="description" content="Edit details for {data.station.name || 'station'}" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Button -->
	<button
		onclick={goBack}
		type="button"
		class="group mb-6 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
		<span>Back to Station</span>
	</button>

	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-white">Edit Station Details</h1>
		<p class="text-lg text-white/70">{data.station.name}</p>
		<p class="text-sm text-white/50">
			#{data.station.eva}
			{#if data.station.city}
				· {data.station.city}, {data.station.country}{/if}
		</p>
		{#if !data.isAdmin}
			<div
				class="mt-4 rounded-lg border p-3 {data.hasPendingEdit
					? 'border-yellow-400/30 bg-yellow-500/10'
					: 'border-blue-400/30 bg-blue-500/10'}"
			>
				<p class="text-sm {data.hasPendingEdit ? 'text-yellow-300' : 'text-blue-300'}">
					{#if data.hasPendingEdit}
						<FluentEmojiWarning class="inlinesize-4" />
						You are editing your pending changes. The form has been pre-filled with your previously submitted
						values.
					{:else}
						<FluentEmojiInformation class="inlinesize-4" />
						Your changes will be reviewed by administrators before being applied to the station.
					{/if}
				</p>
			</div>
		{/if}
	</div>

	<!-- Edit Form -->
	<form bind:this={formElement} method="POST" use:enhance={handleSubmit} class="space-y-6">
		<!-- Sleeping Section -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiBed class="size-6" />
				<span>Sleeping Facilities</span>
			</h2>
			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_warm_sleep"
					bind:checked={formState.has_warm_sleep}
					class={checkboxClass}
				/>
				<span class="text-white">Warm sleeping area available</span>
			</label>
			<label for="sleep_notes" class="mb-2 block text-sm font-medium text-white/80"
				>Sleep Notes</label
			>
			<textarea
				id="sleep_notes"
				name="sleep_notes"
				rows="3"
				bind:value={formState.sleep_notes}
				class={fieldClass}
				placeholder="Describe sleeping conditions, bench locations, comfort level..."
			></textarea>
		</div>

		<!-- Outlets Section -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiHighVoltage class="size-6" />
				<span>Power Outlets</span>
			</h2>
			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_outlets"
					bind:checked={formState.has_outlets}
					class={checkboxClass}
				/>
				<span class="text-white">Outlets available</span>
			</label>
			<label for="outlet_notes" class="mb-2 block text-sm font-medium text-white/80"
				>Outlet Notes</label
			>
			<textarea
				id="outlet_notes"
				name="outlet_notes"
				rows="3"
				bind:value={formState.outlet_notes}
				class={fieldClass}
				placeholder="Describe outlet locations, accessibility, charging conditions..."
			></textarea>
		</div>

		<!-- WiFi Section -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiSatelliteAntenna class="size-6" />
				<span>WiFi Hotspot</span>
			</h2>
			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_wifi"
					bind:checked={formState.has_wifi}
					class={checkboxClass}
				/>
				<span class="text-white">WiFi available</span>
			</label>
			{#if formState.has_wifi}
				<label class="mb-4 flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						name="wifi_has_limit"
						bind:checked={formState.wifi_has_limit}
						class={checkboxClass}
					/>
					<span class="text-white">WiFi has data usage limit</span>
				</label>
			{/if}

			<div>
				<label for="wifi_notes" class="mb-2 block text-sm font-medium text-white/80">
					WiFi Notes
				</label>
			</div>
			<textarea
				id="wifi_notes"
				name="wifi_notes"
				rows="3"
				bind:value={formState.wifi_notes}
				class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
				placeholder="Describe WiFi network name, data limits (e.g., 100MB per day), speed, reliability..."
			></textarea>
		</div>

		<!-- Toilets Section -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiToilet class="size-6" />
				<span>Toilet Facilities</span>
			</h2>
			<label class="mb-3 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_toilets"
					bind:checked={formState.has_toilets}
					class={checkboxClass}
				/>
				<span class="text-white">Toilets available</span>
			</label>
			{#if formState.has_toilets}
				<label class="mb-4 flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						name="toilets_open_at_night"
						bind:checked={formState.toilets_open_at_night}
						class={checkboxClass}
					/>
					<span class="text-white">Toilets open at night</span>
				</label>
			{/if}
			<label for="toilet_notes" class="mb-2 block text-sm font-medium text-white/80"
				>Toilet Notes</label
			>
			<textarea
				id="toilet_notes"
				name="toilet_notes"
				rows="3"
				bind:value={formState.toilet_notes}
				class={fieldClass}
				placeholder="Describe cleanliness, fees, location, accessibility..."
			></textarea>
		</div>

		<!-- Opening Hours Section -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiThreeOClock class="size-6" />
				<span>Opening Hours</span>
			</h2>
			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="is_open_24h"
					bind:checked={formState.is_open_24h}
					class={checkboxClass}
				/>
				<span class="text-white">Open 24/7</span>
			</label>
			<label for="opening_hours" class="mb-2 block text-sm font-medium text-white/80"
				>Opening Hours</label
			>
			<input
				type="text"
				id="opening_hours"
				name="opening_hours"
				bind:value={formState.opening_hours}
				class={fieldClass}
				placeholder="e.g., 04:00 - 01:00 or Open 24 hours"
			/>
		</div>

		<!-- Additional Information -->
		<div class={sectionClass}>
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiInformation class="size-6" />
				<span>Additional Information</span>
			</h2>
			<label for="additional_info" class="mb-2 block text-sm font-medium text-white/80"
				>Additional Notes</label
			>
			<textarea
				id="additional_info"
				name="additional_info"
				rows="4"
				bind:value={formState.additional_info}
				class={fieldClass}
				placeholder="Any other useful information about the station..."
			></textarea>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
			<button
				type="button"
				onclick={initiateSubmit}
				class="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isSubmitting || !hasChanges || hasSubmitted}
				title={!hasChanges ? 'No changes to save' : hasSubmitted ? 'Already submitted' : ''}
			>
				{#if isSubmitting}
					<span
						class="inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></span>
					<span>Saving...</span>
				{:else}
					<FluentEmojiDownArrow class="size-5" />
					<span>{buttonText}</span>
				{/if}
			</button>
		</div>
	</form>
</div>
<!-- Unsaved Changes Dialog -->
{#if showUnsavedDialog}
	<dialog class="modal modal-open" open>
		<div class="modal-box bg-gray-800 text-white">
			<h3 class="text-lg font-bold">Unsaved Changes</h3>
			<p class="py-4">You have unsaved changes. Are you sure you want to leave?</p>
			<div class="modal-action">
				<button onclick={cancelLeave} type="button" class="btn btn-ghost">Cancel</button>
				<button onclick={confirmLeave} type="button" class="btn btn-error"
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
		<div class="modal-box bg-gray-800 text-white">
			<h3 class="text-lg font-bold">
				{data.isAdmin
					? 'Confirm Changes'
					: data.hasPendingEdit
						? 'Update Pending Changes'
						: 'Submit for Review'}
			</h3>
			<p class="py-4">
				{#if data.isAdmin}
					Are you sure you want to save these changes? They will be applied immediately.
				{:else if data.hasPendingEdit}
					Are you sure you want to update your pending changes? Your previous submission will be
					replaced with these new values.
				{:else}
					Are you sure you want to submit these changes? An administrator will review them before
					they are applied.
				{/if}
			</p>
			<div class="modal-action">
				<button onclick={cancelLeave} type="button" class="btn btn-ghost">Cancel</button>
				<button onclick={confirmSave} type="button" class="btn btn-primary">
					{data.isAdmin
						? 'Save Changes'
						: data.hasPendingEdit
							? 'Update Pending Changes'
							: 'Submit for Review'}
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={cancelLeave} type="button">close</button>
		</form>
	</dialog>
{/if}
