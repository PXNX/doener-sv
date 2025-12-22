<!-- src/lib/components/BackButton.svelte -->
<script lang="ts">
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';

	interface Props {
		href: string;
		label?: string;
		class?: string;
	}

	let { href = '/', label = 'Back', class: className = '' }: Props = $props();
</script>

<a
	{href}
	class="group inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white {className}"
>
	<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
	<span>{label}</span>
</a>
