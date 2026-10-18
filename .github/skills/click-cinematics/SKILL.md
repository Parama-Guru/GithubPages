---
name: click-cinematics
description: "Use when objects in a 3D website must react to hover and click with cinematic results (doors that open and walk you inside, cabinets that open, frames that fly to a page), while staying consistent with scroll-driven state and fully usable by keyboard. Covers raycast picking with three-mesh-bvh, UI-vs-world pointer filtering, hover labels, click-to-scroll consistency, tweened interaction state, accessible equivalents and optional sound."
---

# Click Cinematics

A click should never put the world into a state that scrolling cannot explain.

## Picking

- Register only intentional targets: `{ object, id, label }` per zone (`doors`, `panel`, `route:projects`).
- Use three-mesh-bvh: patch `BufferGeometry.prototype.computeBoundsTree` and `Mesh.prototype.raycast = acceleratedRaycast`, and build bounds trees only for pickable meshes.
- The canvas sits behind the HTML. Listen on `window` and ignore events whose target is UI: `target.closest("a, button, input, textarea, select, label, dialog, header, footer, .panel")`. Ignore touch for hover.
- Hover: raycast on the render loop (not on every pointer event), show a small HTML label near the cursor and set a `cursor: pointer` class.

## Three kinds of click

1. **Navigational cinematic (door → inside):** do not animate the camera separately. Programmatically scroll (Lenis `scrollTo(y, { duration: 3.4, easing })`) to the target chapter's hold. The doors open from the camera-position cue as the camera passes, so click and scroll produce the same frames, and scrolling back closes them.
2. **Object interaction (open a cabinet, rack out a breaker):** a separate 0–1 state tweened with GSAP (`setPanel`), mapped to transforms in the zone's update (door rotation first, breaker translation after 0.4, energy glow after 0.55). Toggling reverses it. Expose it in the DOM (`aria-pressed`) and in a data attribute for tests.
3. **Route cinematic (frame → page):** call the router; the router flies the camera to the page's pose and swaps content.

## Accessibility

- Every 3D action has an HTML equivalent: an "Enter" button, a toggle with `aria-pressed`, links to the pages.
- Never require hover. Keep focus visible. Reduced motion: no flights; the same states are applied instantly.

## Sound (optional)

- Off by default, one toggle, remembered. Synthesize short sounds with Web Audio (noise sweep for a door, low thump for a breaker, quiet 50/100/150 Hz hum) — no audio downloads.

## Tests

- Project a known world point (`vector.project(camera)`) to screen coordinates, move the mouse there, assert the hover label, click, and assert the resulting zone/state.
- Click the HTML equivalent and assert identical results.
