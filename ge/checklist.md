# 3D website — research, plan and checklist

Status: built, verified and published at https://parama-guru.github.io/GithubPages/ge/ (source in `ge/source/`).

This document is company-neutral: it describes how to build a full 3D,
scroll-and-click-driven website for an electrical contracting company. Company
content is plugged in later from the approved content source; nothing here is
company content.

How to read the checklist: every `[ ]` item has a description of exactly what
"done" means. An item is ticked only after it is shown working on localhost in
the integrated browser. Items are never reworded to make them pass.

---

## Part A — Research findings

Both sites were opened live in the integrated browser (Playwright), scrolled
through, clicked, and checked at desktop (1440×900) and phone (390×844) sizes,
with reduced motion on. Their shipped JavaScript, models and assets were
inspected to identify the real technology, not just the Awwwards tags.

### A1. fighterready.com — "walk into the building" (primary reference)

What you experience:

1. A branded preloader ("LACING UP 3% … 100%") counts real asset progress.
2. You land outside a gym at night: dark street, wall, a lit sign above two
   glass doors, warm light spilling out. Text sits on the left: chapter label
   ("ROUND 00 — OVERVIEW"), huge condensed headline, one-line summary.
   A "SCROLL TO ENTER" cue is centred at the bottom.
3. Scrolling moves the **camera forward**. It dollies towards the doors, the
   doors open, and the camera passes through into a lit corridor
   ("ROUND 01 — THE PROBLEM").
4. The corridor leads into the ring room, then sparring floor, bag area,
   a wall of fighter portraits, the arena, and the corner. Each zone is a
   chapter with its own headline. The camera never cuts: it is **one
   continuous walk through one building**.
5. Each chapter has a "+ READ MORE" button. Clicking opens an accessible
   dialog (`role=dialog`) with the long-form content, an app screenshot and
   sub-headings. Escape or ✕ closes it and the 3D world stays where it was.
   Long text never sits on top of the 3D.
6. The header on desktop lists every chapter (Overview, The problem,
   Matchmaking …) as jump links. "Questions" opens an FAQ drawer.
7. The final chapter turns into a signup form over a dimmed scene; then a
   normal footer.
8. Phone: same camera path, scene in the upper half, text stacked below;
   doors visibly swing open as you pass.

How it is built (from the shipped files):

| Layer | Technology found |
|---|---|
| Build | Vite (hashed `assets/*.js`), code-split per zone |
| Language | TypeScript compiled to vanilla JS; **no React** for the world (React tag on Awwwards refers to small UI only) |
| 3D | Three.js r170, one WebGL2 canvas, `MeshStandardMaterial` / `MeshPhysicalMaterial` (glass doors with transmission), point and spot lights, real shadows, fog, AgX tone mapping, PMREM environment |
| World layout | A single straight world along the Z axis: `street 46→0.5, corridor 0→-16, ring -16→-40, sparring -40→-52, bags -52→-70, wall -70→-86, arena -86→-116, corner -116→-128`. Each zone is its own module (`doors.js`, `corridor.js`, `ring.js` …) built on demand |
| Geometry | Mostly **procedural** (boxes, rounded boxes, cylinders) built in code; textures (wood grain, concrete mottle, chain-link, glow) generated in code with `<canvas>`, so almost no texture downloads |
| Models | 7 `.glb` files with Draco compression for detailed objects (boxers, gloves, bags, phone) ≈ 1.8 MB |
| Scroll | **Lenis** smooth scroll (respects reduced motion); scroll position → one progress value → camera Z and look-at, with lerp/smoothstep easing |
| Motion libs | No GSAP found in the bundles (despite the tag); a small custom easing/timeline |
| Text | HTML over the canvas, Barlow Condensed + Inter |
| Weight | ≈ 3 MB first visit (≈ 300 KB JS gz, ≈ 1.8 MB models, ≈ 0.7 MB WebP posters) |
| Weak points | Draco decoder fetched from a Google CDN (external dependency); text overlaps the scene on small laptop windows; reduced motion still runs the full renderer |

### A2. kinoria.studio — "cinematic product film"

What you experience:

1. A camera-lens preloader ("f 2.0 · 1/60 · 0 %").
2. Hero: a photograph-quality still life (camera on a wooden desk, prints,
   tools) with a big wordmark and a short intro.
3. Scrolling does **not** move the page. The page is exactly one screen tall;
   wheel and touch drive a virtual timeline. The hero photo shrinks into a
   framed print, the camera "falls" into the frame and the scene becomes a
   dark studio with warm light leaks — a **focus pull into the hero**.
4. Kinetic typography: words count up ("SIX → TWENTY → THIRTY-FOUR
   EXPOSURES"), blur in and out of focus like a lens, and swap places around
   the product, which turns slowly in the centre.
5. Numbered feature list (01 – 07) with a spec card per feature.
6. Real routes (`/details`, `/shot`, `/archive`, `/about`). Changing route
   plays a themed loader (film strip with a counter) then the new scene.
7. Sound design: about 40 short sounds (shutter, film advance, paper, room
   tone). **Sound is off by default** behind a "Sound" toggle.

How it is built:

| Layer | Technology found |
|---|---|
| Build | Vite, code-split modules (`intro`, `hero_baked`, `sound`, `touch_axis`) |
| 3D | Three.js r185, several canvases (one fixed overlay for effects) |
| Hero technique | **Pre-rendered frames**: 73 WebP frames (`hero/bake/obj_000 … 072`) rendered offline in a 3D tool (Blender-class) and played back on scroll, on top of a 3344 px photographic plate, plus layered parallax images |
| Scroll | Custom virtual scroll (wheel/touch axis), not native scrolling |
| Effects | Depth-of-field blur on text and image layers, light-leak overlays |
| UI | React (per Awwwards), Archivo variable font |
| Weight | ≈ 16 MB first visit (frames, plate, ~4 MB of WAV/MP3) |
| Weak points | Very heavy; no native scroll (keyboard/assistive users and trackpads suffer); text is split into single-word elements |

### A3. What we take, and what we avoid

| Take (and why) | Avoid (and why) |
|---|---|
| FR: one continuous world along a path; the camera **travels** through it | Separate objects placed beside text (what the previous build did) |
| FR: "scroll to enter" through real doors — the building *is* the website | Kinoria's virtual scroll — breaks keyboard, trackpad, accessibility |
| FR: zones as code-split modules loaded just before they are needed | Kinoria's 16 MB first visit and 73-frame image sequences |
| FR: procedural geometry + canvas textures → tiny downloads | External decoder CDNs (FR loads Draco from Google) |
| FR: long text in dialogs, never over the 3D | Text over busy 3D on small screens (FR's laptop overlap) |
| Kinoria: focus-pull hero (sharp → blurred → sharp) between chapters | Splitting text into one element per word |
| Kinoria: themed, honest preloader with real progress | Fake percentage loaders |
| Kinoria: optional sound, off by default, one toggle | Autoplaying audio |
| Kinoria: real routes with a short, branded transition | Full page reloads that restart the 3D world |
| Both: dark, warm, high-contrast art direction with one accent colour | Neon, generic particles, spinning globes |

---

## Part B — Recommended technology stack

All versions are current stable releases checked on npm (2026-10-18). Pre-release
tags (e.g. Lenis 2.0 dev, Playwright alpha) are deliberately not used.

| Purpose | Choice | Why |
|---|---|---|
| Language | **TypeScript 7.0** (strict) | Type-safe scene, timeline and content data |
| Build | **Vite 8.3** | Same tool as both references; fast, code-splitting, static output |
| Styling | **Tailwind CSS 4.3** with `@tailwindcss/vite` | Utility CSS compiled at build time, no runtime cost |
| 3D engine | **Three.js 0.186** (imperative, no React Three Fiber) | One renderer, one clock, no React re-renders per frame; matches FR's proven architecture |
| Scroll smoothing | **Lenis 1.3.26** | Smooth native scroll, keeps keyboard/trackpad/screen readers working, respects reduced motion |
| Timeline | **GSAP 3.15 + ScrollTrigger** | One authoritative scroll timeline (scrub) and click-triggered cinematic timelines (door entry); all GSAP plugins are free |
| Post-processing | **postprocessing 6.39** (pmndrs) | Depth-of-field focus pull, selective bloom for energised parts, SMAA — merged into few passes |
| Picking | **three-mesh-bvh 0.9** | Fast raycasting for clickable doors, panels and equipment |
| Shaders | **vite-plugin-glsl 1.6** | Custom GLSL for energy flow along cables, door glass, focus pull |
| 3D authoring | **Blender 4.x** (latest LTS) | Model the building, rooms and equipment; author camera path; bake lighting/AO into textures |
| Asset pipeline | **glTF / GLB** + **@gltf-transform/cli 4.5** with **meshopt 1.3** and **KTX2** textures | Smallest models and GPU-compressed textures; decoders self-hosted (no CDN) |
| UI framework | None for the world; small TypeScript modules for menu, dialogs, forms | Lowest JS weight; no second framework |
| Unit tests | **Vitest 5.0** | Timeline maths, camera keyframes, route table |
| Browser tests | **@playwright/test 1.64** (stable) | Routes, scroll, clicks, frames, framing, fallbacks |
| Optional | Web Audio API (no library) | Optional sound design, off by default |

Rejected and why: React Three Fiber (extra layer between scroll and camera,
re-render risk); Theatre.js (extra runtime; GSAP covers it); Spline (exports
heavy, closed runtime); Next.js (server/SSR features unused on static Pages);
pre-rendered frame sequences for the whole site (too heavy — allowed only for
one short hero shot if it beats real-time quality within budget).

---

## Part C — The experience (company-neutral storyboard)

Concept: **"Enter the facility."** The website is one electrical facility you
walk into and through. Power is the thread: you follow it from the grid to the
place it is used. Each chapter is a real place in the building.

| # | Place (zone) | What the visitor does | Camera | Signature animation |
|---|---|---|---|---|
| 0 | **Approach** — exterior at dusk: facility façade, company sign, glass entrance doors, overhead lines | Lands on the hero; reads name and one-line promise | Wide, low, slow push-in | Sign lights up stroke by stroke (logo reveal); light spills through door glass |
| 1 | **Entrance** — the doors | **Clicks the doors** *or* scrolls | Dolly to doors, doors swing open, camera passes the threshold | Door click plays a 2–3 s cinematic: handles turn, doors open on hinges, camera enters, exposure adapts from dusk to interior |
| 2 | **Lobby** — reception wall with timeline | Reads who the company is | Glides along the wall | Timeline milestones light up in sequence as the camera passes |
| 3 | **Control room** — screens, single-line diagram | Reads why choose us / statistics | Turns to face the console | Numbers count up on the screens; the single-line diagram draws itself |
| 4 | **Switchgear hall** — rows of panels | Reads services; **clicks a panel** | Tracks along the row | Clicked panel door opens, breaker racks out, energy flow shader runs along busbars; a dialog shows details |
| 5 | **Transformer yard / substation** — outside again through a roller door | Reads EHV / MV / LV capability | Rises over the yard | Insulators, conductors and busbars energise in order |
| 6 | **Projects gallery** — corridor of lit project frames | Browses projects; **clicks a frame** | Walks the gallery | Frame flies forward into a full project view (route change) |
| 7 | **Clients wall** — illuminated logo wall | Sees clients and testimonials | Pans across | Logos switch on panel by panel like a lighting board |
| 8 | **Safety bay** — PPE station, signage | Reads quality & safety policy | Slow orbit | Lock-out/tag-out sequence: isolator turns, tag clips on |
| 9 | **Team / organisation** — office with org board | Reads leadership and the org chart | Stops in front of the board | Org chart draws itself node by node (HTML/SVG, accessible) |
| 10 | **Exit to contact** — doors open back to the street | Gets address, phone, email, enquiry | Pulls back outside | Doors close behind, sign stays lit; contact panel slides in |

Rules for every chapter:

- Text lives in HTML in a reserved safe area (left on desktop, below on phone),
  never over the subject; long text opens in a dialog like FR's "Read more".
- Scrolling backwards plays everything in reverse exactly (one timeline).
- Clicking is always optional: every clickable 3D object also has a visible,
  keyboard-focusable HTML button that does the same thing.
- Between chapters a short focus pull (Kinoria) hides zone loading.

---

## Part D — Checklist

### D0. Approval gates

- [x] **Research accepted.** Owner confirms Part A matches what they wanted
      from fighterready.com and kinoria.studio.
- [x] **Stack accepted.** Owner confirms Part B (TypeScript, Vite, Tailwind,
      Three.js, GSAP, Lenis, Blender, glTF pipeline).
- [x] **Concept accepted.** Owner approves the "Enter the facility" storyboard
      in Part C or gives changes; changes are written into Part C first.
- [x] **Source location agreed.** Where the editable source lives (e.g. the
      `Ge` repository, replacing the old Next.js `src`) and that the built
      static files are copied into `GithubPages/ge/`. The old `src` is deleted
      only after this approval.
- [x] **Delivery agreed.** Portable static folder (HTML + JS + models) under
      `/GithubPages/ge/`, because a 3D world with models cannot be a single
      self-contained HTML file within budget.

### D1. Project setup

- [x] **Vite + TypeScript project** created from scratch with strict mode,
      path aliases, ESLint + Prettier, and `base` set for
      `/GithubPages/ge/`. Done = `npm run dev` shows an empty page and
      `npm run build` outputs static files.
- [x] **Tailwind 4** wired through `@tailwindcss/vite`, with design tokens
      (colours, type scale, spacing) as CSS variables. Done = tokens used by a
      test heading and visible in the browser.
- [x] **Dependencies pinned** to the stable versions in Part B; no
      pre-release tags. Done = `package.json` reviewed.
- [x] **Local fonts** (display + body, Latin subset, `font-display: swap`).
      Done = no request leaves the site for fonts.
- [x] **Folder layout**: `src/world/` (renderer, zones, materials, shaders),
      `src/timeline/` (scroll + click timelines), `src/ui/` (header, menu,
      dialogs, forms), `src/content/` (typed content), `src/routes/`,
      `assets/models/`, `assets/textures/`, `blender/` (source `.blend`
      files). Done = folders exist with one file each.
- [x] **`.gitignore`** excludes `node_modules`, build output, test reports,
      Blender autosaves (`*.blend1`). Done = `git status` clean after build.

### D2. Blender asset pipeline

- [x] **Blender scene file** with one collection per zone, real-world scale
      (1 unit = 1 m), named objects for everything that animates or is
      clickable (`door_left`, `door_right`, `panel_03_door` …).
- [x] **Camera path authored in Blender** as a curve with keyframed target
      empties per chapter; exported as JSON (points, targets, FOV per
      chapter). Done = path imported and drawn as a debug line in the browser.
      _Done: `blender/camera_path.blend` holds the keys and targets as empties; `npm run camera` exports `src/world/camera-path.json` (lossless round trip verified)._
- [ ] **Light baking**: ambient occlusion and static lighting baked to
      texture atlases per zone, so the browser needs few real-time lights.
      _Partly: ambient occlusion is baked in Blender (Cycles) for the switchgear, transformer and insulator; rooms get code-generated corner occlusion and light pools. Full static lighting of the rooms is not baked because the rooms are built in code._
- [ ] **Export to glTF/GLB** per zone, with animations for doors and panels.
      _Partly: equipment and doors are glTF with authored animations (switchgear door + breaker, entrance doors) driven by the scroll/click state; rooms are procedural in code, not glTF._
- [x] **Optimise** with `gltf-transform`: meshopt geometry compression, KTX2
      (UASTC for normal maps, ETC1S for colour), texture sizes ≤ 1024 px
      (2048 only for hero surfaces). Done = each zone file ≤ 600 KB.
      _Done with a measured change: KTX2 was implemented, but its transcoder (≈570 KB) cost more than the ≈180 KB of textures it compressed, so model textures are WebP (EXT_texture_webp) + meshopt. Models 15–246 KB._
- [x] **Self-hosted decoders** (meshopt, Basis/KTX2) copied into the build;
      no CDN request. Done = Network panel shows no external hosts.
- [x] **Procedural fallback assets**: simple equipment built in code
      (conductors, busbars, insulators, cable trays) and canvas-generated
      textures (concrete, steel, enamel) like FR, for zero-download detail.
- [x] **Asset register** listing every model/texture, who made it, and the
      licence (own work only, or properly licensed).

### D3. World runtime (Three.js)

- [x] **One renderer, one canvas**, WebGL2, fixed full-screen behind the
      HTML; colour space sRGB, AgX tone mapping, DPR capped (1 on phones,
      1.5 desktop). Done = canvas visible, stats overlay in dev only.
- [x] **Zone manager**: each zone is a module with `build()`, `update(frame)`,
      `resize()`, `dispose()`; zones are dynamic-imported one zone ahead of
      the camera and disposed two zones behind. Done = memory stays flat
      while scrolling the whole site twice.
      _Done: tested — geometry and texture counts stay flat over three full journeys._
- [x] **World laid out along the camera path** (FR-style), so neighbouring
      zones are physically connected — doors, corridors, openings — and the
      camera never cuts.
- [x] **Materials library** shared by all zones: copper, aluminium, galvanised
      steel, painted enamel panels, porcelain/glass insulators, concrete,
      safety-yellow, glass with transmission. Done = material sheet page in
      dev shows all of them.
- [x] **Lighting** per zone: baked base + at most 2–3 real-time lights; warm
      exterior dusk vs neutral interior; shadows only where they ground the
      subject.
- [x] **Energy-flow shader**: animated pulses along cables and busbars driven
      by the timeline (not by time alone), used when equipment "powers on".
- [x] **Focus pull**: depth-of-field pass animated between chapters
      (sharp → soft → sharp) to mark transitions and hide zone loading.
      _Done: depth-of-field pull while travelling between rooms and on page flights; sharp at every hold (tested)._
- [x] **Selective bloom** only on emissive parts (signs, indicator lamps,
      energised conductors). No global glow.
- [x] **Context-loss handling**: on WebGL loss show the chapter's poster image
      and keep content usable; restore the same chapter on recovery.
      _Done: falls back to posters, then rebuilds the 3D world on the same page (tested)._

### D4. Scroll timeline (the "4th dimension")

- [x] **Lenis** smooth scroll on the real document (native scrollbar,
      keyboard, trackpad and screen readers keep working). Disabled for
      reduced motion.
- [x] **One GSAP ScrollTrigger master timeline** with `scrub`. Its progress is
      the only clock for: camera position, camera target, FOV, object
      animations, light changes, shader uniforms, and which HTML chapter is
      shown. Done = scrolling to the same position always gives the same frame.
- [x] **Chapter map**: typed list of chapters with start/end progress, camera
      keyframes, hold points (camera rests while text is read), and the HTML
      section id. Generated jump links come from this list, never from
      hard-coded numbers.
- [x] **Hold points**: the camera pauses at each chapter for ~40 % of that
      chapter's scroll length so text can be read without the scene moving.
- [x] **Reverse play** is exact: scrolling up rewinds doors, panels and
      lights. Done = Playwright compares frames going forward and backward.
- [x] **Jump navigation**: header/menu links scroll smoothly to a chapter;
      deep links (`/#chapter` or route) open at that chapter directly.
      _Done: hash links on load and after navigation fly to the right room (tested; fixed a stale scroll-height bug)._
- [x] **Scroll cue** ("Scroll to enter") on the hero only, hidden after
      first scroll.

### D5. Click interactions (cinematic)

- [x] **Raycast picking** with three-mesh-bvh on named clickable objects;
      hover shows a subtle outline + cursor change + small HTML label.
- [x] **Door entry**: clicking the entrance doors plays a GSAP timeline —
      handles turn, both doors swing on hinges, camera dollies through,
      exposure adapts — and lands exactly on the scroll position of chapter 2,
      so scroll and click never disagree.
      _Done: Blender door animation, walk-through, exposure adapts from dusk to interior (tested)._
- [x] **Panel open**: clicking a switchgear panel opens its door, racks out a
      breaker, energises the busbar, and opens the details dialog. Closing
      the dialog reverses it.
      _Done: Blender door/breaker animation, busbar glow, details dialog; closing the dialog closes the panel (tested)._
- [x] **Project frame**: clicking a frame flies it forward and changes the
      route to that project page (route transition, see D6).
      _Done: clicked frames/lightboxes fly toward the camera, then the page changes (tested with a client lightbox)._
- [x] **Accessible equivalents**: every clickable object has a matching HTML
      button (visible on focus or in the chapter panel) that runs the same
      timeline. Done = whole site usable with keyboard only.
- [x] **No competing camera writers**: while a click timeline runs, scroll
      input is queued; the camera is owned by one controller at a time.
      _Done: scrolling during a page flight leaves no residue (tested)._

### D6. Pages, routes and transitions

- [x] **Clean URLs** (production style, no `.html`): `/ge/`, `/ge/about/`,
      `/ge/services/`, `/ge/projects/`, `/ge/projects/<slug>/`,
      `/ge/clients/`, `/ge/quality-safety/`, `/ge/team/`, `/ge/contact/`
      (final list follows the approved content). Each is a real folder with
      its own `index.html`.
- [x] **Pre-rendered HTML per route** at build time with full content, title,
      description and canonical, so search engines and no-JS visitors get
      the page without WebGL.
- [x] **Client-side route changes** (History API) keep the same canvas: the
      camera flies to the route's zone instead of reloading the page.
- [x] **Route transition**: short focus pull + branded loader only if the
      next zone is not ready yet (Kinoria idea, kept under 1 s when cached).
      _Done: focus pull + camera flight; branded loader appears only if the next room is still loading (tested on a throttled network)._
- [x] **Back/forward buttons** fly the camera back correctly.
- [x] **404 page** inside the world (e.g. a dark corridor with a lit exit
      sign) linking to every route.

### D7. Interface (HTML + Tailwind)

- [x] **Preloader** with real progress (bytes of the first zone), logo
      reveal, finishes in < 2.5 s on fast 4G for the first zone.
      _Done: real progress; 3D ready in ≈1.7 s on emulated fast 4G (tested ≤ 2.5 s).
      Since the slow-network pass the preloader no longer covers the page: a 2 px progress line shows real progress
      while the prerendered content and the scene's rendered posters stay usable._
- [x] **Header**: logo, chapter links (desktop), Contact button, Menu button.
- [x] **Menu overlay**: all routes, sound toggle, motion toggle, contact
      details; opaque, focus-trapped, Escape closes.
- [x] **Chapter panels**: label, headline, one-line summary, "Read more"
      button; safe-area layout per breakpoint.
- [x] **Read-more dialogs** (`<dialog>`), FR-style, for long content.
      _Done: About, Why choose us, Projects, Clients, Quality & Safety and Leadership chapters (tested)._
- [x] **Organisation chart component**: top-down tree drawn in HTML/SVG,
      rounded blue boxes with white text, grey elbow connector lines, root
      at the top; supports multiple charts; scrolls horizontally on phones;
      readable by screen readers as a nested list.
- [x] **Forms**: enquiry form with validation; prepares an email (no fake
      sending) unless a real endpoint is provided.
- [x] **Footer**: contact, links, copyright.
- [x] **Sound (optional)**: hum, door, breaker clunk, switch click; off by
      default; one toggle; respects the user's choice across pages.
      _Done: off by default, remembered, door/breaker/hum (tested)._

### D8. Responsive design

- [x] **Breakpoints**: 320, 390, 768, 1024, 1280, 1440, 1920, 2560 px and
      phone landscape.
- [x] **Camera recomposition** per aspect ratio: phones get a wider FOV and
      adjusted targets so the subject stays inside the safe frame — not a
      shrunk desktop shot.
- [x] **Layout per breakpoint**: text left on desktop, below the subject on
      phones, never overlapping the subject. Checked with bounding boxes.
      _Done: projected subject position checked against text boxes at 1440 and 390 px for every chapter (tested)._
- [x] **Touch**: native touch scrolling; tap = click on 3D objects; no
      hover-only features.
      _Done: tap on the 3D doors enters the facility (tested; fixed the loader catching taps and touch pointer clearing before click)._

### D9. Performance and loading

- [ ] **Budgets**: first visit ≤ 2.5 MB total on desktop and ≤ 1.5 MB on
      phones before the first chapter is interactive; JS ≤ 250 KB gzip for
      the first zone; ≤ 120 draw calls and ≤ 300k triangles desktop,
      ≤ 60 calls / 120k triangles phones; 60 fps desktop, ≥ 30 fps mid-range
      phones.
      _Measured: first visit 832 KB (desktop and phone, gzip), ≤ 99 draw calls, frame time ≈ 6 ms average in a desktop browser. Not measured on physical phones._
- [x] **Quality tiers**: high / medium / low chosen from device capability
      and measured frame time; lower tiers drop post-processing, shadows and
      DPR before content.
- [x] **Lazy zones**: only the current and next zone are loaded.
- [x] **Instancing** for repeated equipment (panels, insulators, lights).
- [x] **Render on demand** when idle; pause when the tab is hidden.
- [x] **Data Saver / reduced motion / no WebGL**: static poster per chapter
      (rendered from the real scene) with all content; no Three.js download.
- [x] **Slow connections**: content is usable before the 3D arrives — the
      page, menu and dialogs work at once, each chapter's rendered poster
      stands in, and the live scene cross-fades in when ready. Fonts, models,
      zone code and post-processing load in parallel; phones never download
      post-processing; picking acceleration loads after the first frame;
      later posters wait for a scroll; route changes wait at most 1.6 s for
      the next room. 2G connections get the poster site unless 3D is switched
      on in the menu.
      _Measured on emulated networks (desktop, cache off, old → new): 3G usable 16.4 s → 3.5 s, 3D 16.2 s → 11.6 s;
      Slow 4G usable 11.1 s → 1.9 s, 3D 10.8 s → 6.0 s; Slow 3G (phone tier) usable 28.9 s → 6.3 s, 3D 28.4 s → 23.4 s._
- [x] **Measured**, not assumed: Playwright records transfer size and
      `renderer.info`; a visible-browser frame-time sample is recorded.
      _Done: transfer, renderer.info and a frame-time sample are recorded by the tests._

### D10. SEO and sharing

- [x] Unique title, meta description and canonical per route.
- [x] Open Graph / Twitter images rendered from the 3D world per route.
- [x] Organization and BreadcrumbList structured data.
- [x] One `<h1>` per route, logical headings, descriptive `alt` text.
- [ ] `sitemap.xml` and `robots.txt` for `/GithubPages/ge/`.
      _Open: sitemap.xml is generated; robots.txt only works at the GithubPages repository root, which must not be changed._
- [x] Content is in the HTML, not only in the canvas.

### D11. Accessibility

- [x] Keyboard: every link, chapter, clickable object and dialog reachable;
      visible focus.
- [x] Screen readers: canvas `aria-hidden`; all meaning in HTML.
- [x] Reduced motion: no camera flights; chapters change as discrete states.
- [x] Pause control for continuous motion and sound.
- [x] Contrast WCAG AA for all text over the scene.

### D12. Build order (vertical slice first)

- [ ] **Slice 1 — Approach + door entry**: exterior zone, logo sign reveal,
      scroll dolly, clickable doors, camera passes into the lobby; desktop,
      phone and reduced-motion versions. **Owner review on localhost before
      anything else is built.**
      _Built; owner review on localhost still pending (the whole site was built in one pass as requested)._
- [x] **Slice 2 — Lobby → control room**: timeline wall, counting screens,
      focus-pull transition.
- [x] **Slice 3 — Switchgear hall** with clickable panel + dialog.
- [x] **Slice 4 — Yard, projects gallery, clients wall.**
- [x] **Slice 5 — Safety bay, team/org chart, exit to contact.**
- [x] **Slice 6 — Routes, 404, SEO, sound, posters, fallbacks.**

### D13. Verification (every slice)

- [x] `tsc --noEmit`, ESLint and `vite build` pass.
- [x] Vitest: timeline maths (`phaseAt`, easing, chapter boundaries, random
      seek forward/backward gives identical state).
- [x] Playwright: every route loads; scroll forward and backward through every
      chapter; click doors/panels/frames; keyboard-only run; reduced motion;
      WebGL disabled; Data Saver; no console errors; no external requests.
- [x] Canvas checks: frames change while scrolling, stay still when idle, the
      subject's projected bounding box stays inside the safe frame, and HTML
      text never intersects the subject.
      _Done: frames, stillness, subject on screen and not under text are all tested._
- [x] Screenshots of each chapter's start, hold and end at desktop, laptop,
      phone portrait and phone landscape — reviewed by eye.
- [x] Client/public review agent pass; findings logged below and fixed.
- [ ] Owner sign-off in the integrated browser on localhost.
      _Pending._

### D14. Publishing (only on the owner's command)

- [x] Build copied into `GithubPages/ge/`; root `index.html` card links to it.
- [x] Staged files checked: no `node_modules`, caches or test artifacts.
- [x] Commit with a short message; push; check the live site and every route.
      _Done: pushed to Parama-Guru/GithubPages and verified live._

---

## Findings

Add review findings here as `- [ ] description (chapter/route, location)`.

Build notes
- [x] TypeScript 6.0.3 is used instead of 7.0 because typescript-eslint 8.71 supports TypeScript < 6.1.
- [x] `@gltf-transform/cli` replaced by its libraries (the CLI pulled in vulnerable micromatch/braces); npm audit is clean.
- [x] Unit test found `/GithubPages/ge` (no trailing slash) resolving to "not found"; fixed in the route matcher.
- [x] First draw-call check failed (132 > 120); static batching per zone fixed it (now 51–99).
- [x] Phone transfer measured 1.75 MB without compression; measured with gzip like GitHub Pages: 713 KiB. Loading only the models each zone needs.
- [x] axe found white text on the light-blue org boxes failed contrast; boxes darkened to #2f77b3 (same format as the reference).

Client/public review (agent) findings
- [x] Org chart clipped on phones and desktop → vertical indented tree under 700 px; scaled to fit on desktop.
- [x] Lobby timeline plaque behind the About headline → plaques moved, camera re-aimed, stronger left veil.
- [x] Org board glare behind Leadership text → board dimmed, camera re-framed.
- [x] Phone frames showing mostly floor → camera raised and aimed higher on portrait screens.
- [x] Empty bordered sheet visible before reveal on inner pages → sheet and contents reveal together earlier.
- [x] Switchgear blown out behind the Projects headline → panels darkened, key light reduced.
- [x] Plain white console monitors → dark dashboard texture.
- [x] 3D wall numbers showing through the statistics sheet → sheets 94% opaque.
- [x] Over-bright client logo lightboxes → glow reduced.
- [x] Yard looked like a stage backdrop → fog colour, larger ground, distant lights.
- [x] Thick neon conductor tubes → thinner glow, drop links removed.
- [x] Safety bay block cut at frame edge and floating helmets → block moved, helmet rail added.
- [x] Hero sign revealed too slowly and touched its plate → 1.2 s reveal, wider plate.
- [x] Lobby timeline still crossed the About text → timeline moved to the right-hand wall, desk and benches mirrored.
- [x] Testimonials (one repeated quote, "Michael Holz, Seo Analyst") checked: they are exactly as published on the original site, so they are kept unchanged.

Colour themes (owner request, 18 Oct 2026)
- [x] Header colour-theme switch with three choices; the same choice is in the Menu with text labels.
      Light is the default (first visit and without JavaScript), the choice is remembered (`ge-theme`)
      and applied before first paint, and switching is live without reloading the 3D world.
- [x] Light: white with the original website's blue `#004A99` (measured on ganeshelectricals.in);
      the white logo stays on blue header, menu, footer and loader bands as on the original site.
      The 3D scene becomes daylight: blue sky, light haze, brighter fill.
- [x] Copper: the original 3D design (night and copper), unchanged values.
- [x] Signal (new palette, researched): petrol teal of industrial switchgear branding (Siemens petrol
      `#009999`) with ISO 7010 warning yellow (RAL 1003) as the accent — dark petrol surfaces, `#F5C400` accent.
- [x] Tests: theme default, live switch, keyboard, menu sync, persistence across navigation and reload;
      axe on every route in all three themes; overflow 320–2560 px; full suite green.
- [x] Fallback posters (reduced motion / no WebGL) are rendered per theme (3 × 8 WebP, 422 KB total, only the
      active theme's images load); social images are rendered from the Light scene.
- [x] Whole-scene themes (owner correction, 29 Oct 2026): the switch now recolours everything, not only the sky
      and lighting. One file, `source/src/world/themes.json`, defines per theme: room surfaces and their texture
      tone, trims (copper → brand blue in Light, safety yellow in Signal), light strips and floor light pools,
      point-light tints, energy flow, every sign / plaque / screen drawn on canvas, and all Blender model materials.
- [x] Blender reads the same `themes.json` (`GE_THEME` selects the theme); `npm run assets:themes` builds and
      renders the switchgear and transformer in all three themes as a check. The site loads one set of models
      and recolours their named materials live, so the download size does not triple.
- [x] Tests: every theme defines every token and every Blender material (unit); a live switch changes the
      model colours, the scene's average colour and the look signature; posters follow the theme (browser).
- [ ] Owner review of the three themes in the browser.

Company profile update (owner request, 2 Nov 2026 — `Ganesh electricals-Profile.pptx` is the authoritative content)
- [x] Deck read in VS Code (Office Viewer extension) and in full: 79 slides rendered, text, tables and media extracted;
      findings and decisions in `content-brief.md`.
- [x] All deck content curated into `source/src/content/profile.json`; every page reads from it.
- [x] Statistics, milestones, contact emails and address replaced with the deck's (decisions 1, 3, 7).
- [x] Organisation chart replaced with the slide 6 chart in the same core team / project team layout (43 positions),
      on the page and on the 3D office board; vertical tree on phones.
- [x] About: introduction, purpose, capability, credentials, achievements with the slide 78 photos.
- [x] How we serve (six statements) and the new How we work page (local issues, TNEB 211 days, manpower 95, equipment).
- [x] Projects: featured substation projects (text only) and four lists — On-going 10 · 2023–2026 36 · 2019–2022 26 ·
      2012–2018 60 (122 executed). Old project addresses redirect; 3D hall signs show the new groups.
- [x] Clients by voltage level, German clients, sectors and industrial areas (logos kept).
- [x] Quality & Safety: policy, standards, supplier evaluation, site reports, 13 electrical inspections, EHS policy and
      24 EHS standards groups, signed by the Proprietor.
- [x] Leadership: founder, key personnel table (role emails, no mobiles), roles, responsibilities and authorities.
- [x] Testimonials removed (decision 6); unused portraits and old social images deleted.
- [x] Control-room screens show the deck figures and the six "how we serve" lines; camera key for the new page added
      in Blender (`camera_path.blend` reseeded).
- [x] Posters (3 themes × 8) and 15 social images re-rendered.
- [x] Three colour themes re-checked: `npm run assets:themes` renders the Blender models distinctly in Light, Copper
      and Signal; the site recolours the whole scene (rooms, signs, screens, lights and models) live.
- [x] Tests: 23 unit (incl. 122/10 project rows, 43-position chart, no mobile numbers or retired email) and 52 browser
      tests green (axe in all three themes, overflow 320–2560 px, framing, themes, no-JS, redirects).

Colour palette (owner request, 15 Nov 2026 — "remove the three colour … finalise a new pallete … bright elegant and proffesional")
- [x] *(Superseded by the second round below — the owner rejected the result.)* Research: live sites opened with Playwright (headless Edge) at 1440×900 and 390×844, scrolled top to footer
      (5 states each), menu opened where offered; colours read with getComputedStyle (24 px grid of the painted
      background under every point, text colour weighted by text length, borders, filled controls).
      Screenshots in `source/.cache/research` (not published).
  - hitachienergy.com — white and #F4F4F4 surfaces, #222222 text, red #CC0000 used only for small controls,
    black footer. Takeaway: one saturated colour, used sparingly, reads as confident.
  - siemens-energy.com — deep purple #1B1534 bands with purple #8A00E5 accent, white text. Takeaway: a deep band
    carries a white logo well, but dark-led pages are not "bright".
  - se.com — light grey #F0F1F2 and white surfaces, #626469/#000 text, #0075A3 links. Takeaway: an off-white page
    with white cards keeps long technical pages calm.
  - gevernova.com — white with deep teal #005E60 text and links, pale #E4F1F1/#F5FBFB panels, lime #C8FF08 as a tiny
    accent, #212121 footer. Takeaway: tinted near-whites plus one deep brand hue look premium.
  - eaton.com — white with slate text #333F48, blue #005EB8 utility bar and links, slate #5B6770 footer.
    Takeaway: an electrical blue on white is the trustworthy convention of the sector.
  - abb.com — white and near-black #1F1F1F, red #EE0000 buttons. Takeaway: restraint, one accent.
  - larsentoubro.com — white with deep blue #024D87 links and borders, #ECF0E8 tinted band, #181818 footer.
    Takeaway: the Indian EPC benchmark pairs a deep blue with generous white.
  - ramboll.com (design-led) — white and stone #E7EEEC, slate #273943 text, blue #0098EB accent, light footer.
    Takeaway: warm stone neutrals make engineering feel refined. buro-happold.com — white/black with taupe #958B82.
    arup.com loaded blank in headless and visible browsers (render timed out) and was replaced by ramboll.com;
    mottmac.com and fosterandpartners.com answered 403.
- [x] *(Superseded — rejected by the owner, see the second round below.)* Chosen palette (one palette for the whole site and 3D world; the Light, Copper and Signal themes, the header and
      Menu theme switches, `ge-theme` storage and the per-theme posters were removed at the owner's request):
      porcelain #F6F4EF page, white #FFFFFF sheets and header/menu bands, ink #142135, muted #46546A, dim #556172,
      sapphire #1A4F91 brand (the original website's #004A99, deepened and warmed), deep sapphire #123C70 for data
      and hover, brass #A8792B as the sparing accent (rules, underlines, 3D trims), midnight #0F2139 footer with
      champagne #E6C987 links, ISO 7010 safety yellow #F5B21A in 3D. Why: bright like Ramboll/GE Vernova (light,
      warm neutrals), professional like Eaton/L&T (an electrical blue on white), elegant through one restrained
      metallic accent instead of a second saturated colour; clearly different from the old white + #004A99 Light,
      dark Copper and petrol Signal themes. Details and token names in `source/README.md` ("Colour palette").
- [x] *(Superseded.)* Logo kept legible everywhere without redrawing it: a sapphire copy cut from the white logo's alpha mask (identical
      shapes) on the white header and menu, the route-change emblem, favicon and touch icon; the white original stays on
      the midnight footer and on the 3D façade and lobby signs (sapphire plates).
- [x] *(Superseded.)* Whole 3D world in the palette (`source/src/world/look.json`, `palette.ts`): daylight sky (separate values for
      AgX on desktop/posters and ACES on phones), warm porcelain rooms with deeper stone floors, sapphire sign plates and
      frames, brass door frames, rails and conductors, light porcelain control-room screens with sapphire figures, org
      board and plaques in sapphire on porcelain, blue/brass energy flow, Blender materials recoloured at load
      (`blender/build_assets.py` reads the same file; `npm run assets:preview` renders a check).
- [x] *(Superseded; re-measured for the second round.)* Text over the scene: left veil sized to the text column on desktop; on phones and in page heroes a porcelain
      backdrop anchored to the first line of text. Measured with the text made transparent (2nd-percentile
      background under each text line): every chapter hold passes WCAG AA at 390, 1024, 1440 and 2560 px (worst 5.0:1),
      every page hero at 390 and 1440 px (worst 4.7:1), and the reduced-motion posters (worst 5.1:1).
- [x] *(Superseded; re-rendered in the second round.)* One poster set (8 × 1280×800 WebP, 170 KB) and 15 social images re-rendered from the new scene.
- [x] *(Superseded; updated in the second round.)* Tests: unit palette tests (every surface, ink and Blender material defined, valid colours, 3D text contrast
      ≥ 4.5:1, Blender reads `look.json`); browser palette tests (no theme switch or `data-theme`, look signature and
      model colours match the file, single poster set); theme-switch test removed, axe runs once on every route.
      typecheck, lint, 23 unit and 54 browser tests green; first visit 878 KiB; 3D ready in 1.5 s on fast 4G.
- [x] Superseded by this palette: the "Colour themes (owner request, 18 Oct 2026)" items above, including the open
      "Owner review of the three themes" item, and the theme items of the 2 Nov 2026 update (3 × 8 posters,
      `npm run assets:themes`, axe in three themes).
- [x] Owner review of the sapphire palette in the browser: rejected on 15 Nov 2026 (second round below).

Colour palette, second round (owner correction, 15 Nov 2026 — "you ahve giventhe whiete nad blue only which i told you to search
in web search to find differnet combination of colour pallete and choose one for our okay change that")
- [x] Why the first round failed: on screen it read as white and blue only (white header and menu, sapphire logo, blue
      buttons, links and figures, blue sign plates and sky), not as a combination of colours. Every item marked
      "superseded" above was replaced; the theme system stays removed (one palette, no switch).
- [x] Research with web search, web fetch and Playwright (headless Edge) of palette libraries, trend reports and brand
      palettes: Color Hunt's popular, gold and vintage collections (palettes and like counts read from the live pages),
      Hook Agency's luxury website palettes, Digisperse's Indian festival palettes, media.io's elegant palettes (mostly
      single-hue ramps), the Pantone 2026 "Cloud Dancer" pairings (thecolortools.com), the WGSN × Coloro 2026 key colours,
      Iberdrola's official palette (colorcodeguide.com) and the 2026 trend round-ups of colorarchive.org and
      colorsense.online. Coolors' trending page answered with a Cloudflare bot check and was not used. Mock-ups of every
      candidate (header band, title, button, chip, figure) in `source/.cache/palette/candidates.png` (not published).
  1. Racing Green & Marigold — Color Hunt, 11,169 likes (https://colorhunt.co/palette/004225f5f5dcffb000ffcf9d): racing
     green #004225, beige #F5F5DC, marigold #FFB000, apricot #FFCF9D. Bright and confident, the classic elegant green and
     gold; on its own only two hue families. Chosen as the core.
  2. Diya Lamp — Digisperse (https://digisperse.com/blogs/swatchbook/diwali-color-palettes-hex-codes): ghee cream #FFF6E4,
     flame gold #F5C24E, terracotta #CE7A44, burnt sienna #85401F, peacock teal #1B5F63, midnight #20202E. Warm, Indian,
     three hues on cream, but teal + gold repeats the removed Signal theme and the mood is festive. Terracotta borrowed.
  3. Garden — Pantone 2026 Cloud Dancer pairing (https://thecolortools.com/learn/pantone-color-of-the-year-2026): Cloud
     Dancer #F0EFEA, sage #9CAF88, olive #5E6B52, terracotta #C96A4B. On trend and calm, but muted rather than bright, and
     sage fails text contrast (2.1:1). Confirms terracotta with green.
  4. Midcentury Touch — Hook Agency / Davis Humphries Design (https://hookagency.com/blog/luxury-website-colors/): blush
     #D4BCC0, deep teal #043736, burnt copper #A25524, olive #7F8000. Sophisticated, but boutique interiors, led by a dark
     teal and not bright.
  5. Aubergine & Saffron — Color Hunt, 6,565 likes (https://colorhunt.co/palette/42032cd36b00e6d2aaf1efdc): aubergine
     #42032C, saffron #D36B00, sand #E6D2AA, ivory #F1EFDC. Distinctive and silk-like, but reads fashion and weddings
     rather than engineering.
  6. Iberdrola, an energy brand (https://colorcodeguide.com/official/iberdrola): green #5C871A, matcha #759F2F, marine blue
     #0C88CA, orange #F68C1B, yellow #FFC605. A real multi-colour utility identity, but five saturated hues read as a
     rainbow and include blue. (WGSN × Coloro 2026 — teal #0F6F6A, fuchsia #FF2BC2, blue aura #B7C4D6, amber #D9A441,
     mint #45CEA2 — rejected as neon fashion brights.)
- [x] Chosen: emerald, terracotta and marigold on ivory — candidate 1 completed with the terracotta of candidates 2 and 3
      and tuned for WCAG AA: ivory #FBF7EF page, paper #FFFDF8 sheets, ink #1B2A22, emerald #0F5C40 brand (deep #0B4632),
      forest #0C3A2B header, menu bar and footer bands, terracotta #A8492A figures (#96401F for small labels), marigold
      #E9A23B highlights; ISO 7010 yellow #F5B21A stays for safety in 3D. Why: green and gold is the established,
      trustworthy pairing ("a step above the typical blue-and-orange contractor site", Hook Agency); terracotta adds warmth
      and the copper of conductors, marigold the glow of light; together they echo Indian materials (banana leaf, temple
      terracotta, marigold garlands) without festival brights. Bright through the ivory base and luminous accents, elegant
      through a jewel-tone green with sparing warm accents, professional through deep brand bands and AA contrast. No role
      is blue, and the combination differs from sapphire/brass, Light (white + #004A99), Copper (night + copper) and
      Signal (petrol teal + safety yellow). Roles and hex values in `source/README.md` ("Colour palette").
- [x] Applied everywhere: CSS tokens `--ivory`, `--paper`, `--emerald`, `--emerald-deep`, `--forest`, `--terracotta`,
      `--terracotta-deep`, `--marigold` (old `--porcelain`, `--sapphire*`, `--midnight`, `--brass`, `--champagne` removed;
      new semantic `--eyebrow`, `--figure`, `--chip`): forest header with the white logo, marigold nav underline and gold
      hairline, marigold Contact button; terracotta labels and figures with marigold rules; marigold chips; emerald
      buttons, links, focus ring, selection, hover label, org chart, year tabs and table heads; ivory menu with a forest
      bar; forest footer with marigold links; ivory route curtain with the emerald emblem; `theme-color` #0C3A2B.
- [x] Logo: header, menu bar and footer show the original white logo on forest, so no tinted copy is needed
      (`logo-sapphire.webp` deleted); `npm run media` cuts an emerald emblem for the route curtain and makes an emerald
      favicon and touch icon (white emblem).
- [x] 3D world (`source/src/world/look.json`, `palette.ts`): emerald sign plates, canopy, bollards and frames; terracotta
      console desks, lockout box and binders (surface `navy` renamed `lacquer`); copper door frames, trims, rails and
      conductors; emerald benches; sage partitions and columns; warm-lit façade glass; control screens with terracotta
      figures and emerald lines; org board in emerald; plaques with emerald years and marigold borders; marigold sign bars,
      logo glow and warm energy; jade busbar energy; emerald switchgear trim on light grey enamel; warm daylight with a
      pale aqua zenith and ivory horizon (no blue sky).
- [x] Verified: typecheck, lint, 29 unit tests (new: brand roles stay emerald, figures terracotta, highlights marigold, and
      no colour of the 3D palette reads as blue), build, and the full browser suite — 67 tests green (palette spec checks
      the forest bands, white logos, marigold nav underline, emerald hero word and buttons, terracotta labels and figures,
      marigold footer links and the emerald emblem; org chart colour; axe on every route; overflow 320–2560 px); first
      visit 870 KiB; 3D ready in 1.6 s on fast 4G. Text over the live scene (text made transparent, 2nd-percentile
      background): no failing text box at any of the 8 chapter holds at 1440×900 and 390×844 (worst 4.61:1 on a large
      34 px figure; labels moved to deep terracotta after the first measurement gave 4.44:1), every page hero ≥ 5.1:1,
      reduced-motion posters without failures. One poster set (8 × 1280×800 WebP, 170 KB) and 15 social images
      re-rendered. Screenshots of the 8 holds, 8 pages, menu, footer, org chart and a project table at 1440×900 and
      390×844 reviewed (`source/.cache/palette/`).
- [ ] Owner review of the new palette in the browser.

Navigation (owner request, 15 Nov 2026 — "create a home button in the nav bar before about … home/about … can be removed
for all the pages … there must be back where they must leave from … the scroll animation")
- [x] Header nav: Home first, then About, How we serve, Projects, Clients, Quality & Safety, with Contact and Menu
      (`headerLinks`). Home is marked as the current page only on home. From any page Home flies the camera back to the
      entrance without reloading the 3D world; on home, Home, the logo and Menu → Home rewind the tour to the top
      (smooth, at most 2.4 s; instant with reduced motion). The header fits on one line without overlaps from 901 to
      2560 px (checked with and without JavaScript).
- [x] Breadcrumb trail ("Home / About") removed from every page; the BreadcrumbList JSON-LD stays in the head. Page
      heroes rebalanced (74svh, 60svh at ≤ 900 px), and long page titles wrap inside the veiled text column so they no
      longer run across the 3D subject (e.g. "How do we serve our clients?" over the control-room video wall).
- [x] Back: the first item of every page hero (all inner pages and the 404 page). `source/src/app/tour.ts` remembers the
      chapter in view when the tour is left by any link, 3D pick or browser history (memory, `sessionStorage` `ge-tour`,
      `history.state.chapter` on the home entry). Back and the browser's Back/Forward jump instantly to that chapter's
      hold (the section top in the static site) and the camera flies there in the same canvas; with nothing remembered,
      Back opens the tour at the start, and without JavaScript it links to the start. Its accessible name names the
      destination ("Back to the tour: Clients").
- [x] Browser history no longer jumps the outgoing page: scroll restoration is manual while a page is open and automatic
      on `pagehide`, so reloads and returns from other sites keep their position.
- [x] Built by three agents in parallel (palette, Home/breadcrumbs, Back) in separate worktrees and merged; after the
      merge: typecheck, lint, build, 28 unit and 67 browser tests green (`tests/e2e/nav.spec.ts` 5, `back.spec.ts` 8,
      `palette.spec.ts` 3, plus the existing suites); Back verified at 1440×900 and 390×844 (returns to "04 Clients").
- [ ] Owner review of Home, Back and the page heroes in the browser.

Round 3 (owner request, 15 Nov 2026 — "remove the readmore …", "in the menu have only 3d button …", "fonts must be changed add some cursive …", "too much white spaces only throughout the 3D …", "have that light fixed")
- [x] "Read more" buttons and the chapter detail dialogs removed from every page (markup, script and styles); each chapter links to its own page,
      and the switchgear panel simply opens and closes. Supersedes the earlier "Read-more dialogs" and dialog items above.
- [x] Menu has one preference, "3D experience with motion and sound" (`ge-3d`); Pause animation, Reduce motion and Sound were removed and
      their old stored values are ignored. With 3D on, ambient motion always runs and sound is on by default — the hum starts on the
      first click, tap or key press (browsers allow audio only after a gesture), with door and breaker sounds; switching 3D off gives the
      still, silent poster site (also used for OS reduced motion, Data Saver, no WebGL and 2G). Supersedes the earlier sound/motion menu items.
- [x] New typography: Fraunces (titles and figures, mixed case), Manrope (body), Parisienne (cursive accents only — the hero's
      "Electricals", chapter and section eyebrows, signatures, the footer's "Since 1997", 3D project-group signs) and IBM Plex Mono
      (small labels), self-hosted from Fontsource (about 99 KB woff2, 23 KB less than before); 3D canvas text uses the same faces.
- [x] Richer 3D tour instead of washed-out white: terracotta façade, clay walls over an emerald wainscot with a copper rail, dark
      polished floors, emerald switchgear with brass handles, dark control-room screens with orange figures, jade and amber light
      pools, a teal-to-gold daylight sky, less haze, neutral tone mapping on every tier; room shells merged (≤ 94 draw calls desktop,
      61 phones). Text sits on compact frosted ivory cards sized to the text instead of the large ivory veil (AA contrast measured at
      every chapter hold and page hero).
- [x] Ganesh Electricals façade sign painted once, fully and steadily lit (no light-up sweep); the flicker came from the lettering
      sitting exactly on the plate (z-fighting) and is gone.
- [x] Built by three agents in parallel (UI, fonts, scene) and merged; posters (8) and social images (15) re-rendered from the merged
      scene. typecheck, lint, build, 29 unit tests and the full browser suite green (66 tests; one browser-history timing test passed
      on re-run); every page checked at 1440×900 and 390×844 (titles, Back link, no overflow, no console errors).
- [ ] Owner review of the round-3 look in the browser.

Round 4 (owner request, 15 Nov 2026 — client review comments and approved content, "cursive is okay but the other fonts need to be changed", "remove the top" (hero eyebrow), "remove this button" (switchgear panel), "a new 2D animated separate website" when 3D is off, and the owner's Lighthouse report "optimise and resolve these for both 2D variant and the 3D variant")
- [x] Client-approved About Us: tagline "Powering Infrastructure. Engineering Reliability. Building Trust." under the hero name and as
      the About title (one sentence per line on desktop), the approved introduction (home, About, footer), the six expertise items
      and the closing brand statement. Hero text checked for readability and alignment at 1920×1080, 1440×900, 1280×720,
      768×1024 and 390×844 (the hero card now starts at the top of its hold position).
- [x] Contact: kumareson@ganeshelectricals.in and 044-22523330 with click-to-call (`tel:+914422523330`) in the menu, footer,
      Contact page, enquiry form and Organization JSON-LD; the old 044-4284 0227 and ganeshvar addresses never render (unit test).
- [x] Milestones: GST appreciation FY 2021–22, 2022–23, 2023–24 and 2024–25, incorporated / registered 06/05/1997; Udyam number
      withheld until the client supplies the certificate. Items needing the client are listed in `client-inputs.md`.
- [x] Removed: the hero eyebrow "230 KV · 110 KV · 33 KV · 11 KV" and the "Open a switchgear panel" button (the switchgear still
      opens when clicked in the 3D hall; its two browser tests click the projected 3D panel).
- [x] New fonts: Spectral (display) and Hanken Grotesk (body and tracked-uppercase labels) replace Fraunces, Manrope and IBM
      Plex Mono; Parisienne kept for the cursive accents. About 80 KB woff2 (was 114 KB), the first-screen faces preloaded, metric-
      matched fallbacks so the swap does not shift text; 3D canvas text uses the same faces.
- [x] 3D: the first frame renders under the poster while loading (the washed-out double exposure after "ready" is gone); lobby
      plaques show four milestones (the GST years combined); every chapter hold, travel point and page checked for blank areas.
- [x] New 2D website for visitors without 3D (menu switch, reduced motion, Data Saver, 2G, no WebGL, failed load, no JavaScript):
      editorial layout on the same palette and fonts, animated line drawings of the power network, a distinct layout per home
      chapter, page heroes with their own drawings; no 3D code, models or posters downloaded (`src/styles/flat.css`,
      `src/app/flat.ts`, `src/ui/art.ts`, `src/ui/flat.ts`, `tests/e2e/flat.spec.ts`).
- [x] Performance (Lighthouse 13.6, production build, home page): 3D desktop 67 → 82 (TBT 3.7 s → 0.40 s), 3D mobile 68 → 73
      (TBT 5.3 s → 1.45 s), 2D desktop 99 → 100, 2D mobile 95 → 96; accessibility and best practices 100. Shaders and the room
      environment compile off the main thread, no throwaway WebGL context, templates and content load on navigation, Lenis and
      SplitText only with 3D (start chunk 89 → 56 KB gzip), pointer and tour reflows removed, right-sized images via srcset.
- [x] Built by agents in parallel (3D + fonts, 2D site, then shared performance) in separate worktrees and merged by the lead with
      the 3D performance work; posters (8) and social images (15) re-rendered; typecheck, lint, build, unit and browser tests green.
- [ ] Owner review of the 2D site, the new fonts and the client content in the browser.
- [ ] Client to supply or confirm the items in `client-inputs.md` (Udyam certificate, GST certificates, statistics and awards).

Round 5 (owner request, 15 Nov 2026 — "improve the 2D website animation alignment even more", "except home all other pages can have the same … the pages in the 2D is the finalised one for the 3D also … remove those old code and have a unified one", "improve the Lighthouse score even more so the page does not lag … the 3D transitions must be very smooth", "modify the menu card also")
- [x] One implementation for every page except home, in both modes: the 2D page design and animations (`is-page`). In 3D mode
      the world fades out and stops drawing on these pages and resumes on the same canvas at the chapter left; opening a page
      directly never downloads the world. Removed: the 3D page heroes, frosted sheets and veils over the scene, the camera
      flights and per-page camera poses (world route API, `sampleRoute`, the `routes` block of `camera-path.json` and its
      Blender export), the SplitText page titles and the scroll link from pages to the world. Pages match within 2 px in
      both modes (`tests/e2e/pages.spec.ts`).
- [x] 2D polish: one left edge and equal section padding, no orphaned grid cells, tabular figures, even title wrapping;
      page-enter sequence (title word by word, drawing draws itself), section reveals, photo wipes, counters, About milestone
      line filling with scroll, hover motion — transform, opacity, clip-path and stroke-dashoffset only; reduced motion safe.
- [x] Menu redesigned: Company and Work groups, current page marked, forest brand card (tower drawing, "Since 1997",
      tagline, click-to-call, email, address), an accessible switch for the 3D experience; staggered open, Escape and focus
      return; on phones call, email and the switch are on the first screen.
- [x] Smooth 3D: no main-thread task over 50 ms while scrolling the whole tour on desktop (was up to 444 ms); at 4× CPU
      throttling the worst stall fell from 2.3 s to 0.16 s. Rooms are built, uploaded and compiled in short steps during idle
      time, every material variant is compiled before a room appears, photos decode off the main thread, models in workers.
- [x] Lighthouse (production build): 3D home desktop 97–99 (TBT 59–125 ms), mobile 79–83; 2D home 100 / 99; other pages 100
      in both modes (3D mode was 71–76); accessibility and best practices 100. Social images of the pages now show the page
      itself (1200×630); the home keeps the 3D façade.
- [x] Built by two agents in parallel (pages; 3D) and merged by the lead with the dead-code removal; posters and social
      images re-rendered; typecheck, lint, build, 28 unit and 78 browser tests green.
- [ ] Owner review of the unified pages, the menu and the 3D smoothness in the browser.

Round 6 (owner request, 16 Nov 2026 — "check the ge website 3d/2d support all desktop sizes and everything also there must be no inconsistency and do a verification and commit and push it")
- [x] Desktop audit at 14 viewports — 1024×768, 1280×640, 1280×800, 1366×657, 1440×789, 1536×730, 1600×789, 1680×939,
      1920×961, 1920×1080, 2560×961, 2560×1305, ultrawide 3440×1305 and 4K 3840×2000 (real browser viewports, with the
      Windows scrollbar): the 3D home at all 8 chapter holds (112 screenshots), the 2D home and all 15 other pages in 2D at every
      size and in 3D at 5 sizes (285 page measurements). Measured on each: sideways overflow, overlapping text, text cut at the
      screen edge, headline text over drawings or photos, broken or enlarged images, console errors and failed requests, header
      items, fonts and the left edge. Result: no overflow, overlap, cut-off text, errors or failed requests anywhere; the world
      loads and every chapter shows its own room at every size; the inner pages are identical in both modes (75 pairs within
      2 px); every page has one header, one left edge and its title at the same height.
- [x] Fixed: on short laptop screens the 3D hero card ran under the header and its buttons were cut (1280×640) and the 2D hero's
      buttons were below the first screen — the hero name now also scales with the height on desktops under 820 px and the 2D
      hero has less padding: both fit at 1280×600, 1280×640, 1366×657, 1280×720 and 1536×730 (2D at 1024×600 still scrolls).
- [x] Fixed: between 901 and 1280 px the footer columns were too narrow — "How we serve" and "Quality & Safety" wrapped and the
      email broke inside the domain; the brand now sits on its own row above three columns (checked 1024–1920 px).
- [x] Fixed: award photos (small originals, 137–318 px wide) are never enlarged (`object-fit: scale-down`).
- [x] Consistency: page names in title case everywhere (How We Serve, How We Work, On-going Projects, Organisation Chart) in the
      header, menu, footer, eyebrows, titles and social images; units always "230 kV" — also inside capitalised chips, labels
      and the 3D control-room screens (was KV); the client's data cleaned once without changing facts: kV spacing (49 values),
      Tamil Nadu (8), name initials and "Mr." spacing (Mr. B. Kumareson everywhere), "M/s.", "Pvt. Ltd", comma and full-stop
      spacing, "yrs", place-name capitals and clear typos (Electical, carryout, Danfos, Kensai, Industies, Implimentation,
      Liasioning, Sriperumbadhur, throughly, indepth); punctuation and stray capitals of the EHS policy text. The 2D and 3D
      homes show the same email, telephone, voltages and figures (230 / 122 / 10 / 95).
- [x] Posters of the control room and the office and all 14 page social images re-rendered; typecheck, lint, build, 28 unit
      tests and the browser suite green; `tests/e2e/desktop.spec.ts` added (hero fit in both modes at six desktop sizes, footer
      lines at five widths).
- [ ] Client to confirm the spelling of two names that differ between the personnel table and the organisation chart
      (P. Praveen Kumar / Mr. P. Pravinkumar; B. Muthu Kumar / Mr. B. Muthukumar) and "Horizon Paberbox" in the project list.
