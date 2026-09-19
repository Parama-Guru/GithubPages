# Scene Runtime Guide

Read before implementing a cinematic Three.js runtime. These are architectural patterns and verification recipes, not a reusable visual scene. Adapt them to the approved storyboard and existing codebase; do not add abstractions without a concrete need.

## Ownership

Use one renderer and canvas when practical. In React, create the runtime in an effect or scene owner, attach it to a stable container, and dispose it on cleanup. Do not recreate geometry or textures during component renders or send every animation frame through React state.

An existing project's equivalent interfaces take precedence. For a new runtime, a small contract can make ownership explicit:

```ts
type SceneFrame = {
  storyTime: number
  chapterId: string
  chapterProgress: number
  reducedMotion: boolean
}

type Viewport = {
  width: number
  height: number
  pixelRatio: number
}

type StoryScene = {
  update(frame: SceneFrame): void
  resize(viewport: Viewport): void
  dispose(): void
}
```

Keep chapter data independent of renderer state. Store camera cues, captions, hold points, source references, and asset IDs with typed chapter definitions. Generate controls from those IDs, not numeric offsets that break when a chapter is inserted.

## One Clock, Reversible State

Model playback explicitly: loading, ready, playing, paused, holding, complete, or failed as needed. Distinguish a presenter's hold point from a paused animation. Seeking should update the full scene immediately even when playback is paused.

Use a clamped time value and derive the scene state rather than accumulating transforms:

```ts
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export function phaseAt(time: number, start: number, duration: number) {
  if (duration <= 0) return time >= start ? 1 : 0
  return clamp01((time - start) / duration)
}

export function easeInOut(progress: number) {
  const bounded = clamp01(progress)
  return bounded * bounded * (3 - 2 * bounded)
}
```

For each beat, interpolate from fixed authored values. Use vector interpolation, `Quaternion.slerp`, authored curves, and a chosen timeline library when it reduces complexity. Seed procedural randomness. Do not depend on how many previous frames ran.

Avoid `position.x += ...` for authored sequences, chains of `setTimeout`, and several independent animation clocks. A sequence evaluated at 8 seconds must produce the same pose whether reached by playback, direct seek, replay, or backward navigation.

Account for hidden tabs by rebasing the previous timestamp when visibility changes. Do not consume a long hidden interval on resume unless elapsed wall-clock time is explicitly the intended behaviour. Stop requesting frames at a hold or completed state; redraw on input, resize, asset completion, or theme change.

Keep progress controls, captions, and DOM indicators on the same timeline. Update React only when the chapter or visible caption changes, or at a deliberate UI refresh rate. Reset scripted and manual camera offsets consistently on replay.

## Camera And Framing

Choose camera position, target, and field of view per beat. Test both the transition path and endpoints; a correct final pose can still pass through an object or clip a subject mid-transition.

For an approximately camera-aligned subject of width W and height H, vertical field of view V and aspect A, a starting fit distance is the larger of:

- `H / (2 * tan(V / 2))`
- `W / (2 * tan(V / 2) * A)`

Use radians. Add depth allowance and a storyboard-specific margin. This is an estimate, not a final guarantee for tilted or moving objects. Project the subject's bounding-box corners through the actual camera to validate the safe frame at representative timeline positions.

Reserve the DOM text area before fitting the camera. On mobile, recompose the shot, text, and interaction zones rather than shrinking the whole desktop layout. Update renderer size with the real container dimensions, cap DPR, update camera projection, and redraw without resetting story time.

Scripted camera motion and orbit controls must not both own the camera. At a deliberate exploration point, suspend the scripted camera or apply a bounded user offset. Provide a reset action. Release pointer capture on cancellation and preserve page scrolling when a drag is not needed.

## Scene Construction

- Use glTF/GLB for authored models, procedural geometry for explanations, and instancing for repeated objects. Keep source models and attribution inside the project boundary.
- Use physically based or intentionally stylised materials and an appropriate lighting strategy. Configure colour space and tone mapping for the chosen Three.js version; validate texture appearance rather than compensating with arbitrary lights.
- Build transitions around meaningful geometry: assembling a mechanism, revealing a layer, comparing two states, or moving through a place. Use shaders and postprocessing only when they add a specific visual explanation and fit the performance budget.
- Label schematic or synthetic data. Do not use photorealistic rendering to imply historical, geographic, or scientific accuracy that the assets do not support.
- Keep essential content in HTML. Where labels follow objects, project anchors to screen space, hide genuinely occluded labels, and resolve collisions or move labels into a reserved legend. Always provide a stable accessible equivalent.

## Loading And Cleanup

Use explicit asset states. Count completed assets or known byte totals; do not manufacture a percentage when totals are unknown. An asset failure should offer retry or an understandable fallback without blocking navigation forever.

For bundled offline delivery, ensure no loader silently fetches a CDN decoder, font, environment map, or worker. Test compressed glTF and texture decoders with the actual distribution before committing to them.

On context loss, pause the clock and show equivalent content. On recovery, restore the selected chapter and progress when feasible. Handle renderer creation failure without an uncaught exception or a blank screen.

Dispose owned resources once. Shared materials, textures, geometry, and decoder instances need shared ownership rather than disposal by every consumer. Clean up animation frames, ResizeObserver, IntersectionObserver, pointer handlers, controls, and audio/video streams. Test mount/unmount or scene switching for resource growth.

## Performance Instrumentation

Record a short baseline for the most complex scene: viewport, browser/device, DPR, draw calls, triangles, texture count, and frame-time percentiles. `renderer.info` helps identify rendering cost; approximate texture memory from dimensions, formats, and mipmaps, not compressed download size.

Use a visible browser for representative playback measurements. Headless software rendering and emulated mobile viewports are functional tests, not evidence of mobile GPU performance. Do not sample while the document is hidden and call the result a frame-rate benchmark.

Investigate large textures, repeated materials, shadows, overdraw, transparent layers, postprocessing, and unnecessary frame loops before reducing content quality. Profile again after the targeted change.

## Verification Recipes

### Timeline Tests

Use the existing test framework. Verify `phaseAt` before start, at start, at midpoint, at end, and after end; also test zero-duration beats. Evaluate the same time after different navigation histories and compare poses and visible state within numerical tolerance.

For every chapter, test next/back boundaries, direct entry, replay, random seeking, pause/resume, visibility changes, and reduced-motion final state. Check total narration and chapter allocation independently from animation durations.

### Browser Tests

Load the real distribution with Playwright. Wait for fonts, model readiness, and image decoding instead of arbitrary sleeps. Inspect both page errors and failed asset requests. Use non-forced clicks for user-facing interaction checks.

Capture important states at deterministic timestamps. Compare canvas frames during playback and pause, but distinguish intentional changes from loading, unrelated controls, or screenshot noise. Read meaningful scene state from the runtime when appropriate, then corroborate it with pixels and screenshots.

WebGL pixels can be inspected through a testing-only readback path or canvas screenshots. Do not permanently enable `preserveDrawingBuffer` solely for test convenience without evaluating its runtime cost.

For an isolated object, test projected bounds or transparent edge margins. For an intentionally full-bleed environment, use a subject-specific safe-frame check instead of requiring blank canvas edges. Check the smallest supported portrait width; desktop and 390px success do not establish 320px framing.

Test DOM labels and controls against each other and against reserved scene areas. Resize while paused and while playing. On mobile, ensure touch scrolling, pointer cancellation, and navigation still work. Avoid hiding overflow as a substitute for reachable content.

Disable WebGL deliberately and assert the same message and chapter remain available. Set reduced-motion preference before load and change it during the session. Verify it changes motion without dropping essential narrative steps.

### Delivery Tests

Open the self-contained HTML or agreed portable folder through `file://` with networking disabled, then through the expected static subdirectory. Confirm local assets and any decoders work in both. Check normal loading, partial failure, direct chapter links, and reload.

For actual video export, verify MIME/container, rendered first and final frames, duration, frame dimensions, and audio when present. A live animation or a recording button alone is not an exported deliverable.