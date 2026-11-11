---
name: static-multipage-3d-site
description: "Use when a full 3D/WebGL website must also be a proper multi-page, SEO-friendly static site (e.g. GitHub Pages under a sub-path): Vite build plus build-time prerendering of every route, clean folder URLs, a client router that swaps content while the 3D canvas persists and the camera flies between pages, metadata and structured data, posters for no-WebGL visitors, quality tiers and honest transfer budgets."
---

# Static Multi-page 3D Site

Every page is real HTML at a clean URL; the 3D world is a progressive enhancement that survives navigation.

## Build

- Vite + TypeScript, `base` set to the published sub-path (e.g. `/GithubPages/ge/`).
- Write page templates as **pure functions returning HTML strings** (`renderMain(routeId)`, `renderHead(route)`, header/menu/footer). Use them in two places:
  1. a Vite SSR build of `src/prerender.ts` plus a small Node script that fills `<!--app-head-->`, `<!--app-main-->` … in `dist/index.html` and writes `dist/<route>/index.html`, `404.html` and `sitemap.xml`;
  2. the client router after navigation.
- Keep the world (Three.js, post-processing) behind a dynamic `import()` so first paint only loads the site bundle (~70 KB gzip).
- A tiny inline head script adds `has-3d` before first paint when motion/data settings allow it, so the layout does not jump and hidden fallback posters are not downloaded.
- TypeScript: use the newest version that `typescript-eslint` supports (check its peer range) rather than the absolute latest.

## Routes

- Production URLs are folders: `/about/`, `/projects/2013-2014/` — never `.html`. Match with and without the trailing slash, and `index.html`.
- One table holds id, path, zone, label, title, description and parent (for breadcrumbs). Tests check unique titles and descriptions of 70–170 characters.

## Navigation that keeps the world

- Intercept same-origin links under the base path. On click: `pushState`, start the camera flight to the new route's pose, fade `<main>`, destroy the old page controller, render the new main, replace managed head tags (title, description, canonical, OG/Twitter, JSON-LD), re-render header/menu active states, reset scroll, mount the new controller, focus `<main>`.
- Handle `popstate`. In tests, mark the canvas with a data attribute to prove it is the same element after navigation.

## SEO

- Per page: title, description, canonical, Open Graph and Twitter tags, OG image rendered from the real 3D scene (1200×630), Organization and BreadcrumbList JSON-LD, one `h1`.
- `sitemap.xml` in the site folder. On a project sub-path, `robots.txt` and a custom 404 only work at the domain/repository root — document this instead of pretending.

## Fallbacks and quality

- Reduced motion, Data Saver, no WebGL, a "3D off" setting or a load timeout → static mode: the same chapters with posters rendered from the 3D scene (a poster mode `?poster=…` renders one pose and flags `data-poster="ready"` for a capture script).
- Quality tiers: low (DPR 1, no post-processing, MSAA), medium (bloom + SMAA), high (adds depth-of-field focus pulls). Detect software renderers and coarse pointers; downgrade automatically if the average frame time stays above ~24 ms.

## Budgets (measure honestly)

- Serve locally **with gzip** like GitHub Pages, then sum CDP `Network.loadingFinished.encodedDataLength`. Without compression the measurement is 2–3× too high.
- Example achieved: 712 KiB first visit with the full 3D hero, desktop and phone.

## Publishing into a shared static repo

- Build to `dist/`, then copy into the site folder with a manifest of generated entries, so re-publishing deletes stale files without touching source, notes or checklists. Never commit `node_modules`, caches or test output.
