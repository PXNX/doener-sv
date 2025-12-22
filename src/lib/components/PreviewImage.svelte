<!-- src/lib/components/PreviewImage.svelte -->
<script lang="ts">
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';

	interface Props {
		src: string | null | undefined;
		alt: string;
		class?: string;
	}

	let { src, alt, class: className = '' }: Props = $props();

	let loaded = $state(false);
	let error = $state(false);
	let img: HTMLImageElement | undefined = $state();

	// Single effect for cache check - runs once when img is bound
	$effect(() => {
		if (img?.complete && img.naturalHeight > 0) {
			loaded = true;
		}
	});

	// Reset on src change
	$effect(() => {
		void src;
		loaded = false;
		error = false;
	});

	const shouldShow = $derived(!!src && !error);
</script>

<div class="relative overflow-hidden rounded-2xl {className}">
	{#if shouldShow}
		<img
			bind:this={img}
			{src}
			{alt}
			loading="lazy"
			decoding="async"
			class="size-full object-cover transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={() => (loaded = true)}
			onerror={() => (error = true)}
		/>
		{#if !loaded}
			<div
				class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-500/20 to-teal-500/20 backdrop-blur-sm"
			>
				<FluentImage24Regular class="size-12 animate-pulse" />
			</div>
		{/if}
	{:else}
		<div
			class="flex size-full items-center justify-center bg-linear-to-br from-blue-400 to-teal-500"
		>
			<FluentEmojiStation class="size-10" />
		</div>
	{/if}
</div>
