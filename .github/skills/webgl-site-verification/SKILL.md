---
name: webgl-site-verification
description: "Use when verifying a 3D/WebGL website before calling it done: Playwright checks that read renderer metrics from the canvas, walk every scene zone, prove exact reverse scrolling, click 3D objects via projected coordinates, check pause/stillness, fallbacks (reduced motion, no WebGL, Data Saver, no JavaScript), overflow from 320 to 2560 px, axe accessibility and transfer budgets, plus screenshot contact sheets and an independent reviewer pass."
---

# WebGL Site Verification

A nonblank canvas proves nothing. Expose state, test behaviour, and look at the frames.

## Instrument the runtime

After each rendered frame write to the canvas dataset: `zone`, `calls`, `triangles`, `frames`, `camera` (rounded x,y,z), interaction state (`panel`), `motion`. Expose a debug handle (`window.__app = { world(), route(), caps }`) for projecting points. With post-processing set `renderer.info.autoReset = false` and reset once per frame.

## Playwright suite (copy and adapt)

- **Pages:** every route returns 200, has one `h1`, the right `<title>`, description, canonical, an OG image that exists, and appears in the sitemap.
- **Journey:** scroll to each chapter hold and poll until `dataset.zone` equals the expected zone; assert draw-call and triangle budgets there; record any request that is not to localhost.
- **Determinism:** scroll to A, read `camera`; scroll to B, C and back to A; the camera string must match exactly.
- **Clicks:** project a world point to the screen (`point.project(camera)`), hover, assert the hover label, click, assert the new zone. Also click the HTML equivalent.
- **Interaction state:** toggle, poll the dataset to 1.00, toggle back to 0.00.
- **Pause:** enable pause, wait, frame count must not change.
- **Navigation:** mark the canvas, click a header link, assert URL, `h1`, title, canonical, the mark is still there, and the zone changed; then browser Back.
- **Fallbacks:** reduced motion → `data-world="static"`, posters decoded and the world chunk never requested; stub `getContext("webgl2")` → static; `navigator.connection.saveData = true` → static; JavaScript disabled → content and navigation present.
- **Layout:** for 320/390/768/1024/1280/1920/2560 widths and every route, `scrollWidth ≤ innerWidth`.
- **Accessibility:** axe (`wcag2a/aa`, `wcag21aa`) on every route with no serious/critical issues (this catches colour contrast in brand colours, e.g. white on a light blue).
- **Budget:** first visit via CDP `encodedDataLength`, served with gzip.

## Visual review

- Script screenshots at each chapter hold and mid-travel (desktop and phone) and every dedicated page; merge them into contact sheets with sharp and actually look: subject framing, text over subject, black faces, clipped subjects, objects blocking paths, empty-looking rooms, colour casts (e.g. an over-red sky glow).
- Hidden tabs report `visibilityState: "hidden"` and correctly stop rendering; capture review screenshots from a visible or headless page.
- Run an independent reviewer agent acting as client and public against a running local server; log every finding in the checklist and fix it before ticking items.

## Tick rule

An item in the project checklist is ticked only after the corresponding test or screenshot proves it. Never reword an item to make it pass; log limitations explicitly.
