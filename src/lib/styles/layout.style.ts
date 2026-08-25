import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
	viewport: {
		display: 'flex',
		minHeight: '100dvh',
		width: '100dvw',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '1rem'
	},
	content: {
		display: 'flex',
		width: '100%',
		flexDirection: 'column',
		'@media (min-width: 40rem)': {
			width: '48rem'
		}
	}
});
