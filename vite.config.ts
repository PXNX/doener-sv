import { sveltekit } from '@sveltejs/kit/vite';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			...stylex.vite({ useCSSLayers: true }),
			enforce: undefined
		},
		Icons({
			compiler: 'svelte',
			autoInstall: true,
			iconCustomizer(collection, icon, props) {
				props.mode = 'url';
			}
		}),
		SvelteKitPWA()
	],
	server: {
		allowedHosts: true,
		port: 3021
	}
});
