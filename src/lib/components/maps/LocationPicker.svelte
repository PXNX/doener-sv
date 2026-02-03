<!-- src/lib/components/maps/LocationPicker.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import FluentLocation20Filled from '~icons/fluent/location-20-filled';
	import FluentSearch20Regular from '~icons/fluent/search-20-regular';
	import FluentDismiss20Regular from '~icons/fluent/dismiss-20-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';

	interface LocationPickerProps {
		latitude: number | undefined;
		longitude: number | undefined;
		onLocationChange: (lat: number, lon: number, address?: string) => void;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		onLocationChange
	}: LocationPickerProps = $props();

	let searchQuery = $state('');
	let searchResults = $state<any[]>([]);
	let isSearching = $state(false);
	let showResults = $state(false);
	let isGettingLocation = $state(false);
	let selectedAddress = $state('');

	// Default to Berlin if no location provided
	const BERLIN_LAT = 52.52;
	const BERLIN_LON = 13.405;

	// Initialize coordinates to Berlin if not provided
	$effect(() => {
		if (latitude === undefined || longitude === undefined) {
			latitude = BERLIN_LAT;
			longitude = BERLIN_LON;
		}
	});

	async function reverseGeocode(lat: number, lon: number) {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
				{ headers: { 'Accept-Language': 'en' } }
			);
			const data = await response.json();
			if (data.display_name) {
				selectedAddress = data.display_name;
			}
		} catch (error) {
			console.error('Reverse geocoding failed:', error);
		}
	}

	async function searchLocation() {
		if (!searchQuery.trim()) return;

		isSearching = true;
		showResults = true;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`,
				{ headers: { 'Accept-Language': 'en' } }
			);
			searchResults = await response.json();
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function selectResult(result: any) {
		const lat = parseFloat(result.lat);
		const lon = parseFloat(result.lon);

		latitude = lat;
		longitude = lon;
		selectedAddress = result.display_name;

		onLocationChange(lat, lon, result.display_name);
		searchQuery = '';
		showResults = false;
		searchResults = [];

		// Reverse geocode to ensure we have the address
		reverseGeocode(lat, lon);
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

			latitude = position.coords.latitude;
			longitude = position.coords.longitude;

			onLocationChange(latitude, longitude);
			await reverseGeocode(latitude, longitude);
		} catch (error) {
			alert('Unable to get your location. Please search or click on the map.');
		} finally {
			isGettingLocation = false;
		}
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			searchLocation();
		}
	}

	function clearSearch() {
		searchQuery = '';
		showResults = false;
		searchResults = [];
	}
</script>

<div class="space-y-4">
	<!-- Search Bar -->
	<div class="relative">
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				onkeydown={handleSearchKeydown}
				placeholder="Search for address or place..."
				class="input w-full rounded-xl border-2 border-orange-500/40 bg-slate-900/50 pr-12 pl-12 text-white placeholder-orange-300/50 backdrop-blur-sm transition-all duration-200 focus:border-orange-500 focus:bg-slate-900/70 focus:ring-2 focus:ring-orange-500/50"
			/>
			<FluentSearch20Regular
				class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-orange-400"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={clearSearch}
					class="absolute top-1/2 right-4 -translate-y-1/2 text-orange-400 hover:text-orange-300"
				>
					<FluentDismiss20Regular class="size-5" />
				</button>
			{/if}
		</div>

		<div class="mt-2 flex gap-2">
			<button
				type="button"
				onclick={searchLocation}
				disabled={!searchQuery.trim() || isSearching}
				class="btn btn-sm flex-1 rounded-lg border-2 border-orange-500/40 bg-orange-600/20 text-orange-300 transition-all hover:bg-orange-600/30 disabled:opacity-50"
			>
				{#if isSearching}
					<span class="loading loading-spinner loading-xs"></span>
					Searching...
				{:else}
					<FluentSearch20Regular class="size-4" />
					Search
				{/if}
			</button>

			<button
				type="button"
				onclick={getCurrentLocation}
				disabled={isGettingLocation}
				class="btn btn-sm flex-1 rounded-lg border-2 border-blue-500/40 bg-blue-600/20 text-blue-300 transition-all hover:bg-blue-600/30 disabled:opacity-50"
			>
				{#if isGettingLocation}
					<span class="loading loading-spinner loading-xs"></span>
					Getting...
				{:else}
					<FluentLocation20Filled class="size-4" />
					Use My Location
				{/if}
			</button>
		</div>

		<!-- Search Results -->
		{#if showResults && searchResults.length > 0}
			<div
				class="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border-2 border-orange-500/40 bg-slate-900/95 shadow-xl backdrop-blur-md"
			>
				<div class="max-h-64 overflow-y-auto">
					{#each searchResults as result}
						<button
							type="button"
							onclick={() => selectResult(result)}
							class="w-full border-b border-orange-500/20 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-orange-600/20"
						>
							<div class="flex items-start gap-3">
								<FluentLocation20Filled class="mt-1 size-5 flex-shrink-0 text-orange-400" />
								<div class="flex-1">
									<p class="text-sm font-medium text-white">{result.display_name}</p>
									{#if result.address}
										<p class="mt-1 text-xs text-orange-200/70">
											{#if result.address.road}{result.address.road},
											{/if}
											{#if result.address.city}{result.address
													.city}{:else if result.address.town}{result.address
													.town}{:else if result.address.village}{result.address.village}{/if}
										</p>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if showResults && searchResults.length === 0 && !isSearching}
			<div
				class="mt-2 rounded-xl border-2 border-orange-500/40 bg-slate-900/95 p-4 text-center backdrop-blur-md"
			>
				<p class="text-sm text-orange-200/70">No results found. Try a different search.</p>
			</div>
		{/if}
	</div>

	<!-- Selected Address Display -->
	{#if selectedAddress}
		<div class="rounded-xl bg-orange-900/20 px-4 py-3 backdrop-blur-sm">
			<p class="flex items-start gap-2 text-sm text-orange-200">
				<FluentLocation20Filled class="mt-0.5 size-4 flex-shrink-0" />
				<span>{selectedAddress}</span>
			</p>
		</div>
	{/if}

	<!-- Map Container -->
	<div class="overflow-hidden rounded-xl border-2 border-orange-500/40 bg-slate-900/50 shadow-xl">
		<div class="h-100 w-full">
			{#await import('$lib/components/maps/InteractiveMap.svelte')}
				<div class="flex h-full items-center justify-center">
					<FluentMap24Regular class="size-12 animate-pulse text-orange-400/50" />
				</div>
			{:then { default: InteractiveMap }}
				<InteractiveMap
					{latitude}
					{longitude}
					onLocationChange={async (lat, lon) => {
						latitude = lat;
						longitude = lon;
						onLocationChange(lat, lon);
						await reverseGeocode(lat, lon);
					}}
				/>
			{/await}
		</div>
	</div>
</div>
