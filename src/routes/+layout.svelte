<script lang="ts">
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Train Station Search</title>
	<meta
		name="description"
		content="Search for train stations in Germany. Find sleeping spots, outlets, toilets & station info"
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="flex min-h-dvh w-dvw items-center justify-center p-4">
	<div class="flex w-full flex-col sm:w-3xl">
		{@render children()}
	</div>
</div>

<CookieBanner />
