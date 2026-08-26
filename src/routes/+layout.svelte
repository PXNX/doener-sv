<script lang="ts">
	import { browser } from '$app/environment';
	import * as stylex from '@stylexjs/stylex';
	import { onMount, type Snippet } from 'svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { locale, setDeviceLocale, setLocale } from '$lib/i18n';
	import { translate } from '$lib/i18n/messages';
	import { styles } from '$lib/styles/layout.style';
	import type { LayoutData } from './$types';
	import '../app.css';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	if (browser) {
		setLocale(data.locale);
	}

	if (import.meta.env.DEV) {
		$effect(() => {
			void import('virtual:stylex:runtime');
		});
	}

	onMount(() => {
		setDeviceLocale();
		return locale.subscribe((activeLocale) => {
			document.documentElement.lang = activeLocale;
		});
	});
</script>

<svelte:head>
	{#if import.meta.env.DEV}
		<link rel="stylesheet" href="/virtual:stylex.css" />
	{/if}
	<title>{translate(data.locale, 'app.title')}</title>
	<meta name="description" content={translate(data.locale, 'app.description')} />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div {...stylex.attrs(styles.viewport)}>
	<div {...stylex.attrs(styles.content)}>
		{@render children()}
	</div>
</div>

<CookieBanner />
