<!-- src/lib/components/maps/InteractiveMap.svelte -->
<script lang="ts">
	import { Map, TileLayer, Marker } from 'sveaflet';
	import { browser } from '$app/environment';

	interface InteractiveMapProps {
		latitude: number;
		longitude: number;
		onLocationChange: (lat: number, lon: number) => void;
	}

	let { latitude, longitude, onLocationChange }: InteractiveMapProps = $props();

	// Custom marker using Tailwind classes
	const customMarkerHtml = `
		<div class="relative size-10">
			<div class="absolute top-1/2 left-1/2 size-10 bg-orange-500 rounded-full -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] border-[3px] border-white shadow-lg" style="border-radius: 50% 50% 50% 0;"></div>
			<div class="absolute top-1/2 left-1/2 size-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
		</div>
	`;

	function handleMapClick(event: CustomEvent) {
		const { latlng } = event.detail;
		if (latlng) {
			onLocationChange(latlng.lat, latlng.lng);
		}
	}

	function handleMarkerDragEnd(event: CustomEvent) {
		const { latlng } = event.detail;
		if (latlng) {
			onLocationChange(latlng.lat, latlng.lng);
		}
	}
</script>

{#if browser}
	<Map
		options={{
			center: [latitude, longitude],
			zoom: 13,
			minZoom: 1,
			maxZoom: 19,
			zoomControl: true
		}}
		class="h-full w-full"
		on:click={handleMapClick}
	>
		<TileLayer
			url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
			options={{
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}}
		/>
		<Marker
			latLng={[latitude, longitude]}
			width={40}
			height={40}
			html={customMarkerHtml}
			options={{ draggable: true }}
			on:dragend={handleMarkerDragEnd}
		/>
	</Map>
{/if}

<style>
	:global(.leaflet-container) {
		background: #1e293b;
	}

	:global(.leaflet-control-zoom) {
		border: 2px solid rgba(251, 146, 60, 0.4) !important;
		border-radius: 0.75rem !important;
		overflow: hidden;
	}

	:global(.leaflet-control-zoom a) {
		background: rgba(30, 41, 59, 0.9) !important;
		color: rgb(251, 146, 60) !important;
		border: none !important;
		backdrop-filter: blur(8px);
	}

	:global(.leaflet-control-zoom a:hover) {
		background: rgba(251, 146, 60, 0.2) !important;
		color: rgb(251, 146, 60) !important;
	}

	:global(.leaflet-control-attribution) {
		background: rgba(30, 41, 59, 0.9) !important;
		color: rgba(251, 146, 60, 0.7) !important;
		font-size: 10px !important;
	}

	:global(.leaflet-control-attribution a) {
		color: rgb(251, 146, 60) !important;
	}

	:global(.leaflet-marker-icon) {
		background: transparent !important;
		border: none !important;
	}
</style>
