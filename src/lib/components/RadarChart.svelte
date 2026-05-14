<script lang="ts">
	interface Axis {
		label: string;
		emoji: string;
		value: number | null;
		max?: number;
	}

	interface Props {
		axes: Axis[];
	}

	let { axes: rawAxes }: Props = $props();

	// Filter out axes with no rating
	const axes = $derived(rawAxes.filter((a) => a.value != null));

	// All coordinates in one viewBox — chart centered, labels placed with room
	const vb = 340;
	const cx = vb / 2;
	const cy = vb / 2;
	const chartR = 90;
	const rings = 4;
	const labelR = chartR + 40;
	const emojiSize = 16;

	const n = $derived(axes.length);
	const step = $derived(n > 0 ? (2 * Math.PI) / n : 0);

	function polar(i: number, radius: number): [number, number] {
		const angle = i * step - Math.PI / 2;
		return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
	}

	function polyPoints(radius: number) {
		return Array.from({ length: n }, (_, i) => polar(i, radius).join(',')).join(' ');
	}

	const dataPoints = $derived(
		axes.map((a, i) => {
			const v = a.value ?? 0;
			const m = a.max ?? 4;
			return polar(i, (v / m) * chartR);
		})
	);

	const dataPoly = $derived(dataPoints.map((p) => p.join(',')).join(' '));

	const labelData = $derived(
		axes.map((a, i) => {
			const [lx, ly] = polar(i, labelR);
			let anchor: 'middle' | 'start' | 'end' = 'middle';
			if (lx < cx - 8) anchor = 'end';
			else if (lx > cx + 8) anchor = 'start';
			return { x: lx, y: ly, anchor, label: a.label, value: a.value!, emoji: a.emoji };
		})
	);
</script>

{#if n >= 3}
	<svg viewBox="0 0 {vb} {vb}" class="mx-auto w-full max-w-xs">
		<!-- Grid rings -->
		{#each Array.from({ length: rings }, (_, i) => ((i + 1) / rings) * chartR) as ringR}
			<polygon points={polyPoints(ringR)} fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="1" />
		{/each}

		<!-- Spoke lines -->
		{#each axes as _, i}
			{@const [sx, sy] = polar(i, chartR)}
			<line x1={cx} y1={cy} x2={sx} y2={sy} stroke="rgba(148,163,184,0.12)" stroke-width="1" />
		{/each}

		<!-- Data polygon -->
		<polygon points={dataPoly} fill="rgba(251,146,60,0.18)" stroke="#fb923c" stroke-width="2.5" stroke-linejoin="round" />

		<!-- Category emojis at each data node -->
		{#each axes as a, i}
			{@const [ex, ey] = dataPoints[i]}
			<text
				x={ex}
				y={ey}
				text-anchor="middle"
				dominant-baseline="central"
				font-size={emojiSize}
			>{a.emoji}</text>
		{/each}

		<!-- Labels outside the chart -->
		{#each labelData as ld}
			<text
				x={ld.x}
				y={ld.y - 7}
				text-anchor={ld.anchor}
				dominant-baseline="central"
				font-size="12"
				class="fill-gray-300"
			>{ld.label}</text>
			<text
				x={ld.x}
				y={ld.y + 7}
				text-anchor={ld.anchor}
				dominant-baseline="central"
				font-size="11"
				class="fill-gray-500"
			>{ld.value.toFixed(1)}</text>
		{/each}
	</svg>
{/if}
