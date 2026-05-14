# T01 — Rspack / rsbuild Spike

## Result: ❌ Not Feasible — Staying with Vite

## Investigation

SvelteKit is architecturally coupled to Vite:

- `@sveltejs/kit` depends on `@sveltejs/kit/vite` plugin
- `@sveltejs/vite-plugin-svelte` handles `.svelte` file compilation, HMR, SSR
- SvelteKit's dev server, build pipeline, and adapter system all assume Vite

### Blockers

1. **No official Rspack/rsbuild support** — The SvelteKit team has stated Vite is the only supported bundler
2. **`@sveltejs/vite-plugin-svelte`** — Core preprocessing plugin is Vite-specific; no Rspack equivalent exists
3. **SSR pipeline** — SvelteKit's SSR relies on Vite's `ssrLoadModule`, `transformRequest`, and module graph APIs
4. **Adapter system** — All adapters (`adapter-vercel`, `adapter-node`, etc.) consume Vite build output
5. **PWA plugin** — `@vite-pwa/sveltekit` is Vite-specific

### Alternatives Considered

- **`unplugin-svelte`** — Does not exist
- **`svelte-loader` (webpack)** — Only supports webpack, not Rspack; no SvelteKit integration
- **Community Rspack plugins** — None mature enough for production SvelteKit

### Conclusion

Migrating SvelteKit to Rspack/rsbuild would require re-implementing most of SvelteKit's build system. The project continues with **Vite 8.x** which is already fast and well-integrated.
