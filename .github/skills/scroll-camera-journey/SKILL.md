---
name: scroll-camera-journey
description: "Use when a website must feel like one continuous 3D walk or fly-through driven by scrolling (camera travels through rooms/zones, text chapters pin while the camera holds, exact reverse playback). Covers Lenis + GSAP ScrollTrigger wiring, chapter ranges measured from the DOM, camera keys with holds, Catmull-Rom paths, lens shift so the subject never sits behind text, portrait field of view, and position-based scene cues. Pair with threejs-cinematic for art direction and webgl-site-verification for tests."
---

# Scroll Camera Journey

The scroll position is the clock. One progress value (0–1) drives the camera, every scene change and every text animation, so scrolling back up rewinds everything exactly.

## Architecture

1. **One world, one axis.** Lay rooms/zones along a single path (e.g. −Z) and physically connect them with doorways. Keep a zone table `{ key: [zFar, zNear] }` with no gaps; `zoneAt(z)` maps the camera to a zone.
2. **HTML chapters drive scroll length.** Each chapter is a `<section>` (≈160–220svh tall) with a `position: sticky; top: 0; min-height: 100svh` panel. Without JS the same sections are normal stacked content with a poster image.
3. **Lenis on the real document**, never a fake scroll container: `new Lenis({ autoRaf: false })`, `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. Keyboard, trackpad and screen readers keep working.
4. **Chapter ranges from the DOM**, recomputed in `ScrollTrigger.onRefresh`: `start = (chapter.offsetTop - journey.offsetTop) / (journey.offsetHeight - innerHeight)`.
5. **Camera keys are authored in chapter-local time** `{ chapter, t, position, target, fov }` and converted to global progress with the measured ranges. Unit-test the conversion.

## Timing that reads well

- The sticky panel is pinned only while `chapter top ≤ viewport top` and `chapter bottom ≥ viewport bottom`, i.e. the first `(h − vh) / h` of the chapter range (≈0.5 for a 210svh chapter). **Put the camera hold inside that window** (e.g. local t 0.12–0.5) and do the travel in the remainder (0.5 → next chapter's 0.0), when the text has left. Getting this wrong makes text vanish while the camera is still holding.
- Add doorway waypoints (`t: 0` of the next chapter at the opening) so paths never clip walls.
- Duplicate a key (same pose at two times) to create a hold; ease every segment with smootherstep so motion starts and ends at rest.
- Sample positions with Catmull-Rom through neighbouring keys; interpolate targets linearly. Never accumulate (`position.z -= …`); always evaluate from fixed keys so any seek gives the same pose.

## Framing so text never covers the subject

- Aim each hold's target at the **subject's centre**, then shift the lens instead of fudging targets: `camera.setViewOffset(w, h, -0.17 * w, 0, w, h)` on wide screens (subject sits right of the text column), `setViewOffset(w, h, 0, 0.17 * h, w, h)` on narrow screens (subject sits above the bottom text). Raycasting keeps working because the projection matrix includes the offset.
- Portrait phones need a minimum horizontal FOV: `fov = max(poseFov, min(78, 2·atan(tan(40°/2)/aspect)))`, or wide subjects (signs, video walls) get cropped.
- Darken the text side with a gradient veil (left on desktop, bottom on phones) rather than solid panels.

## Scene cues

Drive reveals from the **camera position**, not from time or scroll events: `reveal = smoothstep(cameraDistanceIntoZone, from, to)`. Doors open as the camera approaches, plaques light in sequence, counters count, power flows. This keeps scroll, route flights and click-triggered scrolls consistent. Make sure each cue reaches 1 at **every** pose that shows it (journey holds and dedicated-page poses) — a common bug is a half-drawn board at a hold.

## Rendering cost

- Render on demand: when progress/pointer changed, during transitions, and at ~30 fps for ambient effects only while `motion` is on and the tab is visible.
- Stream zones: build current ±1, hide beyond 1, dispose beyond 2 (keep shared materials and GLB geometry).
- Keep a constant pool of point lights (e.g. 6) re-assigned to the nearest zone lights each frame; changing light counts recompiles every shader.

## Checklist

- [ ] Camera keys unit-tested: ordered, holds still, same pose after random forward/backward seeks.
- [ ] Every chapter's subject is right of the text (desktop) / above it (phone) in screenshots.
- [ ] Cues complete at every hold and dedicated-page pose.
- [ ] Scrolling to a position, away and back yields the identical camera (Playwright).
- [ ] Reduced motion / no WebGL: same chapters with rendered posters.
