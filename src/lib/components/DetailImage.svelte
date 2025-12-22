<!-- src/lib/components/DetailImage.svelte -->
<script lang="ts">
	import IconImageOff from '~icons/fluent/image-off-24-regular';
	import FluentImage24Regular from '~icons/fluent/image-24-regular';

	interface Props {
		src?: string;
		alt: string;

		class?: string;
	}

	let { src, alt, class: className = '' }: Props = $props();

	let loaded = $state(false);
	let error = $state(false);
	let img: HTMLImageElement | undefined = $state();

	// Single effect - check cache immediately when img binds
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
		if (src === null || src === undefined) {
			error = true;
		}
	});
</script>

<div class="relative {className}">
	{#if !error}
		<img
			bind:this={img}
			{src}
			{alt}
			loading="lazy"
			decoding="async"
			fetchpriority="auto"
			class="size-full object-cover transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={() => (loaded = true)}
			onerror={() => (error = true)}
		/>
		{#if !loaded}
			<div class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
				<FluentImage24Regular class="size-12 animate-pulse" />
			</div>
		{/if}
	{:else}
		<div
			class="flex size-full items-center justify-center bg-linear-to-br from-gray-700 to-gray-900"
		>
			<div class="flex flex-col items-center gap-3 text-white/40">
				<IconImageOff class="size-20" />
				<p class="text-sm">Image unavailable</p>
			</div>
		</div>
	{/if}
</div>
