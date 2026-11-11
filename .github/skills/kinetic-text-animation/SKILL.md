---
name: kinetic-text-animation
description: "Use when headings, labels and statistics must animate with a cinematic or scroll-driven experience: masked line/character reveals with GSAP SplitText, scrubbed in-hold-out timelines aligned to sticky chapter panels, load intros, count-up numbers, route-change title reveals, and accessible, reduced-motion-safe text. Works with any scroll journey or normal page."
---

# Kinetic Text Animation

Text is real HTML first. Animation only changes transform and opacity, never the content, and every animated state is reachable by scrolling backwards.

## Tools

- GSAP 3.13+ includes SplitText and ScrollTrigger for free: `gsap.registerPlugin(ScrollTrigger, SplitText)`.
- Split only display headings (`[data-split]`), never paragraphs: `SplitText.create(el, { type: "lines,chars", mask: "lines" })`. The mask makes characters rise out of an invisible line box — no clip-path hacks.
- SplitText adds an `aria-label` and hides the pieces from assistive tech. Make sure the source HTML has real spaces between visual lines (`<span>Ganesh</span> <span>Electricals</span>`), otherwise the accessible name becomes one word.
- Always `split.revert()` and kill timelines when a page/route is torn down.

## Patterns

1. **Scrubbed chapter timeline** (scroll journeys): one `gsap.timeline({ scrollTrigger: { trigger: chapter, start: "top top", end: "bottom bottom", scrub: 0.4 } })` per chapter.
   - In (0 → 0.2): chars `yPercent: 110 → 0` with a tiny stagger; label/lead/actions `y: 34, opacity: 0 → 1`. Use `fromTo(..., { immediateRender: true })` so hidden states exist before the trigger starts.
   - Hold: an empty `to({}, { duration: 0.62 })` keeps the text still while the camera holds.
   - Out (0.84 → 0.94): chars `yPercent: −110`, others fade up. Skip "out" on the last chapter.
   - Because it is scrubbed, reverse scrolling replays it exactly.
2. **First screen intro** is time-based (it is visible before any scroll): chars from `yPercent: 110` with `expo.out`, then the rest staggered. Its chapter timeline handles only the exit.
3. **Count-up statistics:** inside a scrubbed timeline tween a plain object and write formatted text in `onUpdate`, finishing early in the "in" phase (by ~0.2) so the hold shows final values. Keep the original string (`data-final="40,000"`) and restore it exactly at the end. On normal pages use a `once: true` trigger.
4. **Route changes:** after swapping `<main>`, split the new `h1` and run the intro; reveal sheets with `once: true` triggers (`top 88%`) and stagger their items.
5. **Labels in 3D** (plaques, screens, signs): draw text on a `<canvas>` (after `document.fonts.load`) and redraw only when the displayed value changes (e.g. rounded counter steps) — never every frame.

## Rules

- Never use viewport-scaled font sizes; set fixed sizes per breakpoint.
- Prefers-reduced-motion or a "Reduce motion" setting: no split, no movement, text fully visible.
- Do not animate long body copy character-by-character; line or block fades only.
- Test that every animated heading still has exactly one `h1` per page and an intact accessible name.
