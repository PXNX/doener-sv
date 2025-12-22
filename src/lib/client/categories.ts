export function getCategoryStyles(category: number) {
	switch (category) {
		case 1:
			return {
				label: 'Major Hub',
				badgeClass:
					'border-purple-400/50 bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-100',
				cardClass:
					'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/70'
			};
		case 2:
			return {
				label: 'Important',
				badgeClass:
					'border-blue-400/50 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-100',
				cardClass:
					'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/70'
			};
		case 3:
			return {
				label: 'Regional Hub',
				badgeClass:
					'border-green-400/50 bg-gradient-to-br from-green-500/30 to-teal-500/30 text-green-100',
				cardClass:
					'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400/50 hover:from-green-500/30 hover:to-teal-500/30 hover:border-green-400/70'
			};
		case 4:
			return {
				label: 'Medium',
				badgeClass:
					'border-orange-400/50 bg-gradient-to-br from-orange-500/30 to-amber-500/30 text-orange-100',
				cardClass:
					'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50 hover:from-orange-500/30 hover:to-amber-500/30 hover:border-orange-400/70'
			};
		default:
			return {
				label: 'Station',
				badgeClass:
					'border-gray-400/50 bg-gradient-to-br from-gray-500/30 to-slate-500/30 text-gray-100',
				cardClass:
					'bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-400/50 hover:from-gray-500/30 hover:to-slate-500/30 hover:border-gray-400/70'
			};
	}
}
