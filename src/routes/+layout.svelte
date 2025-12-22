<script lang="ts">
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Doener Rating</title>
	<meta
		name="description"
		content="Search for Döner in Europe. Find the best döner spots near you."
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="flex min-h-dvh w-dvw items-center justify-center p-4">
	<div class="flex w-full flex-col sm:w-3xl">
		{@render children()}
	</div>
</div>

<CookieBanner />
