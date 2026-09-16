---
name: create-webpage
description: "Build or refine a polished static website, interactive presentation, or animated educational webpage with React, TypeScript, Tailwind CSS, and Three.js. Use for webpage creation, cinematic slides, light and dark themes, animated explainers, responsive layouts, and overlap-free visualizations. Includes content planning, implementation, accessibility, and browser verification."
---

# Create Webpage

## Scope

Work only in the directory authorized by the user. Keep source code, dependency caches, generated assets, test artifacts, and static output within that boundary. Never inspect sibling projects or change repository-wide settings to complete a local webpage.

Use explicit project and package-cache paths after interruptions; do not assume the terminal retained its working directory. A reset working directory must not redirect commands toward a sibling project.

This skill lives at the repository root's `.github/skills/create-webpage/SKILL.md`, the standard project skill location, so every website in this workspace can use it. Choose the task's authorized project folder and read its local instructions. Root navigation, shared documentation, and deployment configuration may be changed only when the user authorizes those shared surfaces. Do not alter global skill-discovery settings.

## Content Before Composition

1. Read the nearest existing content and identify the audience, topic, and real user workflow.
2. Separate verified facts, reported research results, and schematic examples. Preserve source links and important caveats.
3. For presentations, write the speaking script and chapter timings alongside the slide data. Check that the duration totals the requested time. Do not put an entire speech on the audience slide.
4. Select visual explanations that show mechanisms: before/after retrieval, evidence selection, semantic relationships, drift, and evaluation. Avoid generic decorative particles that teach nothing.

## Static Architecture

- Viewer setup must be zero: no backend, Node.js, npm, package installation, build command, or local server is required to view a shared presentation.
- Prefer a single ready-to-open HTML distribution file with bundled JavaScript, CSS, Three.js, and local fonts. It must work offline through `file://` as well as ordinary static hosting.
- Keep any optional Node-based development tooling separate from the shareable output. Sharing raw TSX source alone does not satisfy the delivery requirement.
- This is a static publishing repository: keep local development workspaces, dependency directories, package caches, and browser/test artifacts ignored and out of commits. Retain editable source locally unless its deletion is explicitly requested.
- For GitHub Pages, publish the verified standalone artifact as the presentation folder's `index.html`, use case-correct relative links from the root index, and retain `.nojekyll` for unprocessed static publishing. Do not introduce a Node-based Pages build for an already bundled file.
- Favor the simplest architecture that supports the requested visuals. Do not add services, databases, authentication, recording systems, or other unrelated complexity.
- Prefer one TypeScript toolchain: React and Vite, Tailwind CSS, Three.js, and the existing icon library or Lucide.
- Verify stable package versions before installing. Do not trust an environment's `latest` tag without checking for prereleases.
- Use a relative Vite base for subdirectory hosting. Generate ordinary static assets without runtime API keys, server rendering, or a required backend.
- Keep a small HTML bootstrap; implement the experience in components and typed data rather than a monolithic HTML slideshow.
- Bundle fonts locally and use a deliberate display/body pairing. Avoid remote font dependencies during a presentation.
- Reuse a single lifecycle-managed WebGL scene when practical. Dispose resources and listeners on unmount.

## Art Direction

- Choose a purposeful, domain-specific visual system. Use real hierarchy, strong composition, restrained surfaces, and two or three contrasting accents.
- Supply complete light and dark themes through semantic CSS variables. Test text, charts, focus rings, controls, captions, and the canvas in both themes.
- Use expressive fonts without negative letter spacing or viewport-scaled type. Change fixed type sizes at responsive breakpoints when needed.
- Keep the primary 3D scene unframed. Do not put the experience inside a decorative card or nest cards inside cards.
- Use motion for a reason: entrance hierarchy, state changes, or a time-based explanation. Respect reduced-motion preferences and expose pause/replay controls.
- Use icons for tools, segmented controls for modes, sliders for continuous parameters, and text buttons for clear commands. Name icon buttons accessibly and provide tooltips.

## No-Overlap Contract

1. Use grid/flex layouts with reserved header/footer tracks and explicit minimum sizes. Let text wrap; use `min-width: 0` on shrinking grid children.
2. Use container queries or breakpoints for stacked composition. Small screens may scroll vertically; never hide essential content to force a desktop slide into a phone.
3. Reserve separate space for scene labels, legends, captions, controls, and source notes. Avoid projecting unbounded labels over body text.
4. Keep fixed-format controls stable when text, icons, loading states, or hover states change.
5. Test every chapter at desktop, compact laptop, mobile portrait, and mobile landscape sizes in both themes. Inspect screenshots and bounding boxes, not only build output.
6. Do not declare "no overlap" without testing long titles, open dialogs, speaker notes, and control states. Fix the owning layout rather than applying arbitrary negative offsets.

## Three.js and Explainers

- Use Three.js for actual geometry, perspective, camera interaction, and animation. Label synthetic semantic coordinates as schematic, not as computed model embeddings.
- Keep scientific values available in accessible HTML even when the diagram is in WebGL.
- An explainer needs a deterministic timeline, captions, play/pause, replay, seeking, and a meaningful final frame. Do not call a moving background an explanatory video.
- Cap device pixel ratio and document counts; suspend unnecessary work when hidden. Handle a missing WebGL context with a readable fallback.
- If offering recording/export, feature-detect support, clean up streams, and test the resulting artifact. Do not imply that a real-time animation is a prerecorded video.

## Verification Gates

- Typecheck and production build pass.
- Tests verify duration, source references, real calculations, and navigation boundaries.
- Browser tests cover navigation, themes, overview, notes, fullscreen where supported, explainer controls, and interactive figures.
- Verify local fonts load, console errors are absent, and canvas pixels are nonblank and change when animation runs.
- Check screenshots across viewport sizes and both themes. Verify horizontal overflow and content/toolbar intersections.
- Test reduced motion and WebGL fallback. Source content must remain usable without animation.
- Open the distribution directly from the filesystem with networking disabled and verify the full experience. Test static subdirectory hosting too. A development-server-only success is insufficient.
- When a standalone file works, open that file for the user and provide its link; do not make a Node server part of the viewing workflow.
- Document the start/build commands, deployment path, speaking script, controls, and verified limitations. Do not commit or push without authorization.
- Before an authorized push, inspect the staged file list for dependency/cache paths and unrelated work. After pushing, verify the live root entry, deck response, and browser behavior. Report the public URL and commit, without claiming deployment from a push exit code alone.

## Maintain This Skill

After a future revision, update the relevant rule with a verified lesson rather than adding project-specific hacks. Keep requirements actionable and avoid duplicate instructions. Retain the access boundary and verification gates.