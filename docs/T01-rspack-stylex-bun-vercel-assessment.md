# T01 — Build, Runtime, and Styling Migration Assessment

Date: 2026-08-25

## Repository findings

The project is a server-rendered SvelteKit application with Vercel adapter, SvelteKit form actions/endpoints, Drizzle ORM, Backblaze B2 uploads, and 22 Svelte components. It currently uses 920 utility-class attributes containing 517 unique tokens, with direct DaisyUI component classes in addition to Tailwind utilities. Its image pipeline uses Sharp to convert submitted image bytes to 256×256 WebP. The database layer uses `drizzle-orm/postgres-js` backed by `postgres`.

## Rspack compatibility

Rspack documents support for a standalone Svelte application through `svelte-loader` or Rsbuild. The documented configuration has a single `main` entry point and no SvelteKit adapter, SSR, endpoint, filesystem-router, or `@sveltejs/kit/vite` integration. The project’s current SvelteKit architecture therefore cannot be migrated to Rspack without replacing the SvelteKit application framework and reimplementing routing, SSR, server actions, endpoints, and Vercel output integration.

Source: https://rspack.rs/guide/tech/svelte

## StyleX compatibility

StyleX officially supports SvelteKit through `@stylexjs/unplugin` in the existing Vite configuration. It requires a CSS entrypoint and imports the development virtual StyleX stylesheet/runtime from the root SvelteKit layout. The same package separately provides Rspack support, but that does not create SvelteKit support in Rspack.

Source: https://stylexjs.com/docs/learn/installation/vite/sveltekit
Source: https://stylexjs.com/docs/learn/installation/rspack

## Bun runtime compatibility

Bun.Image offers native JPEG, PNG, WebP, HEIC, and AVIF input handling and can produce WebP from validated in-memory bytes. It can replace Sharp for the project’s currently required 256×256 WebP transform. It has an explicit pixel limit control appropriate for untrusted uploads.

Drizzle documents support for `drizzle-orm/bun-sql` using Bun’s native `SQL` client. It can replace the `postgres` driver while keeping the existing Drizzle schema and query layer.

Vercel documents Bun Functions support when `vercel.json` declares a supported `bunVersion`; Bun `1.4.x` is the current explicit version line. A Vercel Bun runtime is therefore suitable for server execution of Bun.Image and Bun SQL, subject to compatibility verification in this SvelteKit deployment.

Source: https://bun.com/docs/runtime/image
Source: https://orm.drizzle.team/docs/connect-bun-sql
Source: https://vercel.com/docs/functions/runtimes/bun

## Implementation decision

Retain Vite because it is the SvelteKit-required application build pipeline, but use Bun for package management, scripts, runtime-dependent image processing, and native SQL. Add StyleX through its documented SvelteKit/Vite integration and fully remove Tailwind/DaisyUI. Do not add a superficial Rspack configuration that is unused by the production deployment. If Rspack is mandatory, a separate framework migration is required and exceeds a safe build-tool change.

## Browser verification

The local `/about` page was served through the Bun development command and inspected in Chromium on 2026-08-25. The page retained its dark theme, centered responsive layout, typography, cards, gradients, icons, spacing, and interactive Back link. This verifies that the static compatibility stylesheet is delivered correctly alongside the new StyleX root layout.

## Native storage, session cryptography, and TypeScript 7

The Backblaze B2 integration now uses `Bun.S3Client` with B2’s S3-compatible path-style endpoint. Uploads use the native `write` API, while upload and download links use native `presign` with explicit PUT and GET methods. The AWS SDK packages are no longer required. The previous AWS-specific object metadata and response-cache-control parameters were unused by the application and are not represented in Bun’s S3 option surface.

Google OAuth continues to use Arctic because Bun does not provide a complete provider-level OAuth client. Session-token generation and SHA-256 session IDs now use the native `crypto.getRandomValues` and `Bun.CryptoHasher` APIs, replacing the Oslo cryptography dependency without changing the session-ID hash algorithm.

The TypeScript 7 native compiler is pinned through `@typescript/native@7.0.2`, and `typecheck:ts7` resolves to its `tsc` binary. `tsconfig.json` explicitly includes the `bun` type package, as required by TypeScript 6 and 7. TypeScript 6 remains installed only as the current `svelte-check` compatibility bridge; that tool requires it even when its `--tsgo` mode uses TypeScript 7.

Source: https://bun.com/docs/runtime/s3
Source: https://bun.com/docs/runtime/hashing
Source: https://bun.com/docs/typescript-6

## 1024px uploads and rating-first search

The image transform now produces fixed 1024×1024 WebP output. The local search UI was inspected in Chromium on 2026-08-25 and exposes a `Rank results by` selector with Overall, Meat, Bread, Veggie, Sauce, and Distance options. Review count is no longer available as a ranking choice or emphasized beside the result rating.
