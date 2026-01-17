<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentBranchFork24Regular from '~icons/fluent/branch-fork-24-regular';
	import FluentOpenRegular from '~icons/fluent/open-24-regular';
	import FluentIcons24Regular from '~icons/fluent/icons-24-regular';
</script>

<!-- Header -->
<header class="mb-10 text-center">
	<div class="mb-4 flex justify-center">
		<div
			class="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600"
		>
			<FluentFood20Filled class="size-12 text-white" />
		</div>
	</div>
	<h1 class="text-3xl font-bold text-white">About Döner Ratings</h1>
	<p class="mt-2 text-sm text-orange-200/90">The real truth about döner</p>
</header>

<!-- Back Button -->
<div class="mb-6">
	<BackButton href="/" />
</div>

<!-- Main Content -->
<div class="space-y-6">
	<!-- Project Overview -->
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<span class="text-6xl">🥙</span>
				<h2 class="text-2xl font-bold text-white">What is this?</h2>
			</div>
			<div class="space-y-4 leading-relaxed text-orange-100/90">
				<p>
					This platform helps you find authentic döner spots based on real experiences from real
					people. We're here to document what matters: the bread, the meat, the spice, the sauces.
					No bullshit, no fake reviews, just honest döner feedback.
				</p>
				<p>
					Whether you're looking for that perfect crispy bread, properly layered meat, or the right
					balance of yoghurt and garlic sauce, our community has you covered. Rate, review, and help
					others find genuine döner experiences.
				</p>
			</div>
		</div>
	</div>

	<!-- Important Distinction -->
	<div
		class="card border border-red-500/40 bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-md"
	>
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<span class="text-6xl">⚠️</span>
				<h2 class="text-2xl font-bold text-white">Important Distinction</h2>
			</div>
			<div class="space-y-4 leading-relaxed text-orange-100/90">
				<p class="font-semibold text-orange-200">
					Let's be clear: Döner is NOT to be confused with Persian Kebap.
				</p>
				<p>
					Persian Kebap is superior to Döner anyway. It's a different league. Proper charcoal
					grilling, better spices, real technique. If you want the best, go Persian. But we're not
					here for that.
				</p>
				<p>
					This site is about <strong class="text-white">genuine döner</strong>. Not some hipster
					"gourmet döner experience" with truffle oil and artisan bullshit. Not some fancy place
					trying to be something it shouldn't be. Just real döner. The kind you get at 2am. The kind
					that hits right after a long night. The kind that costs what it should cost.
				</p>
				<p class="font-medium text-orange-200">
					Döner should taste genuine. No hishi. No pretending. Just proper bread, proper meat,
					proper sauce.
				</p>
			</div>
		</div>
	</div>

	<!-- Döner Rules -->
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<span class="text-6xl">📜</span>
				<h2 class="text-2xl font-bold text-white">Rules for Döner adventures</h2>
			</div>

			<div class="space-y-2 leading-relaxed text-orange-100/90">
				<p>
					<strong class="text-orange-200">1.</strong> The bread must be fresh. Sesame seeds are a must.
					Fluffy on the inside, crispy on the outside, and stable despite the sauce and fat. And please,
					in a shape that isn't annoying when eating.
				</p>

				<p>
					<strong class="text-orange-200">2.</strong> Layered meat is better than minced meat. As long
					as it's not a phosphate bomb, either is fine.
				</p>

				<p>
					<strong class="text-orange-200">3.</strong> Mixed meat (chicken + beef) is fine. Pure chicken
					is fine. Pure beef is fine. Preferably grilled until very crispy.
				</p>

				<p>
					<strong class="text-orange-200">4.</strong> The balance of sauces is important. Yogurt + garlic
					is classic. Not too garlicky, not too runny. Cocktail sauce is rubbish.
				</p>

				<p>
					<strong class="text-orange-200">5.</strong> Onions and red cabbage belong in a Döner, but not
					too pungent in taste.
				</p>

				<p>
					<strong class="text-orange-200">6.</strong> Spicy or mild is a matter of taste. Both are fine.
					Order what you want.
				</p>

				<p>
					<strong class="text-orange-200">7.</strong> Price is important. If you pay more than €10 for
					a Döner, it had better be exceptional. €7-8 is the sweet spot. I know, it hurts.
				</p>

				<p>
					<strong class="text-orange-200">8.</strong> Don't trust Döner at train stations. Rule 10
					of <a class="link" href="https://station-sv.vercel.app">rail adventures</a> also applies here:
					“Don't buy a kebab at the train station; it's expensive and often inedible.”
				</p>

				<p>
					<strong class="text-orange-200">9.</strong> The best Döner stands often don't look fancy.
				</p>

				<p>
					<strong class="text-orange-200">10.</strong> If stands go overboard with “premium” ingredients
					and fancy presentation, it's no longer a real puristic Döner.
				</p>
			</div>
		</div>
	</div>

	<!-- Data Sources -->
	<div
		class="card border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md"
	>
		<div class="card-body p-6">
			<h2 class="mb-4 text-2xl font-bold text-white">Project Info</h2>
			<div class="space-y-4">
				<!-- GitHub -->
				<div
					class="flex items-start gap-4 rounded-lg border border-orange-500/20 bg-slate-800/30 p-4"
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
					>
						<FluentBranchFork24Regular class="size-6 text-white" />
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Source Code</h3>
						<p class="mb-2 text-sm text-orange-200/80">
							This project is open source and available on GitHub. Contributions, bug reports, and
							feature requests are welcome. Help us build the best döner database.
						</p>
						<a
							href="https://github.com/YOUR_USERNAME/doener-finder"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-orange-300 transition-colors hover:text-orange-200"
						>
							<span>View on GitHub</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>

				<!-- Iconify -->
				<div
					class="flex items-start gap-4 rounded-lg border border-orange-500/20 bg-slate-800/30 p-4"
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500"
					>
						<FluentIcons24Regular class="size-6 text-white" />
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Icons & Design</h3>
						<p class="mb-2 text-sm text-orange-200/80">
							All icons used in this project are provided by Iconify, offering access to thousands
							of open source icon sets including Fluent and Fluent Emoji. Making döner search look
							good.
						</p>
						<a
							href="https://icon-sets.iconify.design/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-orange-300 transition-colors hover:text-orange-200"
						>
							<span>Visit Iconify</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>

				<!-- Geocoding -->
				<div
					class="flex items-start gap-4 rounded-lg border border-orange-500/20 bg-slate-800/30 p-4"
				>
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500"
					>
						<span class="text-2xl">🗺️</span>
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Location Services</h3>
						<p class="mb-2 text-sm text-orange-200/80">
							City names are automatically determined from GPS coordinates using OpenStreetMap's
							Nominatim reverse geocoding service. Free and open source.
						</p>
						<a
							href="https://nominatim.openstreetmap.org/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-orange-300 transition-colors hover:text-orange-200"
						>
							<span>Learn about Nominatim</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Community Note -->
	<div
		class="card border border-yellow-500/40 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-md"
	>
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<span class="text-6xl">🤝</span>
				<h2 class="text-2xl font-bold text-white">Community Project</h2>
			</div>
			<div class="space-y-3 leading-relaxed text-orange-100/90">
				<p>
					This is a community-driven project. Every review matters. Every photo helps. Every honest
					rating guides someone to better döner.
				</p>
				<p class="font-medium text-yellow-200">
					Keep it real. Keep it honest. Help others find genuine döner.
				</p>
			</div>
		</div>
	</div>
</div>
