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
      _Done: real progress; 3D ready in ≈1.7 s on emulated fast 4G (tested ≤ 2.5 s)._
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
