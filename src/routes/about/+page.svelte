<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import FluentFood20Filled from '~icons/fluent/food-20-filled';
	import FluentEmojiInformationSource from '~icons/fluent-emoji/information';
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
					Persian Kebap is superior to döner anyway. It's a different league. Proper charcoal
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
				<h2 class="text-2xl font-bold text-white">The Rules of Good Döner</h2>
			</div>

			<div class="space-y-2 leading-relaxed text-orange-100/90">
				<p>
					<strong class="text-orange-200">1.</strong> The bread must be fresh. Sesame optional but appreciated.
					Fluffy inside, crispy outside is the goal.
				</p>

				<p>
					<strong class="text-orange-200">2.</strong> Layered meat > minced meat, but both have their
					place. No discussion about that phosphate wet mouth shit though.
				</p>

				<p>
					<strong class="text-orange-200">3.</strong> Mixed meat (chicken + beef) is valid. Pure chicken
					is valid. Pure beef is valid. Pick your fighter.
				</p>

				<p>
					<strong class="text-orange-200">4.</strong> Sauce balance matters. Yoghurt + garlic is classic.
					Too much of either kills it.
				</p>

				<p>
					<strong class="text-orange-200">5.</strong> Onions belong in döner. If you disagree, that's
					your problem.
				</p>

				<p>
					<strong class="text-orange-200">6.</strong> Spicy or mild is personal. Both are valid. Order
					what you want.
				</p>

				<p>
					<strong class="text-orange-200">7.</strong> Price matters. If you're paying €10+ for a döner,
					it better be exceptional. €7-8 is the sweet spot. I know that hurts.
				</p>

				<p>
					<strong class="text-orange-200">8.</strong> Don't trust train station döner. Rule #10 from the
					old station guide still applies: "Don't buy Döner at the station, just expensive and often garbage."
				</p>

				<p>
					<strong class="text-orange-200">9.</strong> The best döner spots are often the least fancy looking.
					Trust the locals.
				</p>

				<p>
					<strong class="text-orange-200">10.</strong> If they're trying too hard with "premium" ingredients
					and fancy presentation, it's not real döner anymore.
				</p>

				<p>
					<strong class="text-orange-200">11.</strong> Rate honestly. Help people find real spots, not
					Instagram-worthy garbage.
				</p>

				<p>
					<strong class="text-orange-200">12.</strong> Take a photo of your döner before you eat it. Document
					the experience. Share the knowledge.
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
