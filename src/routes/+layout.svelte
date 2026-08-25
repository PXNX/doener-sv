<script lang="ts">
	import * as stylex from '@stylexjs/stylex';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { styles } from '$lib/styles/layout.style';
	import '../app.css';

	if (import.meta.env.DEV) {
		$effect(() => {
			void import('virtual:stylex:runtime');
		});
	}

	let { children } = $props();
</script>

<svelte:head>
	{#if import.meta.env.DEV}
		<link rel="stylesheet" href="/virtual:stylex.css" />
	{/if}
	<title>Doener Rating</title>
	<meta
		name="description"
		content="Search for Döner in Europe. Find the best döner spots near you."
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div {...stylex.attrs(styles.viewport)}>
	<div {...stylex.attrs(styles.content)}>
		{@render children()}
	</div>
</div>

<CookieBanner />
