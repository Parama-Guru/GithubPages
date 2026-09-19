---
name: threejs-cinematic
description: "Use when building a full-3D website, immersive WebGL experience, Three.js scene, cinematic web presentation, spatial story, or an entire presentation as a 3D video-like journey. Covers reference-led art direction, storyboards, camera choreography, deterministic timelines, models, lighting, interaction, accessibility, performance, and Playwright canvas verification. Use with create-webpage, not as a reusable slide-shell template."
---

# Three.js Cinematic

Build the experience around a meaningful 3D world and its story, not a conventional slide layout with a rotating object added beside the text. The user may want the entire presentation to unfold as one continuous cinematic journey. Treat that as an architectural choice, not a decorative effect.

## Scope And Brief

- First load [Create Webpage](../create-webpage/SKILL.md) for user preferences, Playwright reference research, project boundaries, static delivery, and publication rules. Reuse its research and approved direction; do not restart the interview or impose another generic visual system.
- Do not modify existing presentations, install global tooling, commit, or push without the relevant authorization.
- Before implementing renderer or timeline code, read [Scene Runtime Guide](./references/scene-runtime.md). It supplies implementation contracts and tests, not a default model or visual template.
- Choose the interaction model from the brief: a presenter-controlled cinematic sequence, scroll-driven spatial story, free exploration, or a deliberate hybrid. Do not force scroll-jacking or autoplay.
- Clarify whether "3D video" means a real-time interactive experience or an actual encoded video deliverable. Default to the former for a website and state that assumption; do not claim a recorded video without generating and inspecting one.

## Research Spatial Experiences

Extend the general skill's 4-6-reference research with actual 3D or motion-led websites. Inspect at least three accessible candidates with Playwright, including mobile behaviour and meaningful transitions. Choose one primary direction suited to this project rather than defaulting to a globe, chip, floating cards, tunnel, or particle cloud.

Record the reference's spatial composition, camera movement, materials, lighting, chapter transitions, input model, loading behaviour, and reduced-motion or fallback treatment. Observe it in motion; an awards-page thumbnail cannot establish any of these behaviours. Extract principles without copying assets, code, or branded scenes.

Recommend a distinct world and visual language. Explain how it serves the subject and the user's stated preferences. Carry the user's corrections into the storyboard before developing the entire sequence.

## Storyboard Before Scene Construction

For each narrative beat, specify:

| Field | Decision |
|---|---|
| Purpose | What the audience should understand or do |
| Spatial subject | Actual object, environment, data, or process shown |
| Start and end | Meaningful visual states, not merely opacity values |
| Camera | Position, target, framing, lens, and movement motivation |
| Choreography | Object transforms, connections, cuts, lighting, and material changes |
| Time and control | Duration, hold point, next/back, seek, or exploration behaviour |
| Content | Short visible text, accessible equivalent, and narration/script when relevant |
| Assets | Model/texture provenance, realism level, rights, and loading needs |
| Fallback | Reduced-motion state and non-WebGL representation |

Use a small number of coherent environments. A whole presentation can move through these as continuous shots with chapter hold points, close-ups, scene changes, and spatial explanations. Avoid making every chapter the same camera orbit with different text.

For presenter-led talks, separate animation duration from speaking duration. A 12-second transformation can finish at a hold point while a speaker continues. Next/back must reach deterministic chapter states, and the audience must never miss content because a timer advanced unexpectedly.

## Build A Vertical Slice

Implement one representative scene, one substantial transition, and its mobile and reduced-motion alternatives before building the full world. Validate that:

- The 3D content is the primary experience, full-bleed or unframed, not an ornamental preview card.
- The scene communicates a domain-specific idea and remains legible at the actual display size.
- Camera choreography and object transformations work together; movement has a clear beginning and destination.
- Text is readable, navigation is accessible, and critical subjects remain inside the safe frame.
- The renderer meets a provisional performance budget with the intended assets.

Show a working preview or captured states when the slice establishes the direction. If the user requests a different treatment, revise this slice before multiplying scenes.

## Implementation Contracts

1. Use Three.js, typed content, and the existing project toolchain. React Three Fiber is an option only when justified by the project; do not introduce a second scene framework or several animation engines without need.
2. Keep renderer ownership, timeline logic, scene composition, asset loading, and accessible DOM content distinct. A scene exposes predictable update, resize, and disposal behaviour.
3. Use one authoritative timeline. Evaluate camera pose, object state, connections, captions, and active chapter from the same time or progress value. Seeking backwards must work as reliably as playback.
4. Use authored paths and explicit camera targets or quaternions, with eased transitions. Fit the scene to viewport aspect and subject bounds; do not solve small-screen cropping with arbitrary overflow hiding.
5. Use actual geometry, glTF models, textures, lights, and material changes where they help explain the subject. Use stylised geometry deliberately; label reconstructions and schematic arrangements. A primitive placeholder is not a finished domain asset.
6. Give each scene a clear composition. Ground objects through lighting, shadows, scale, and relationships where appropriate. Avoid generic neon, bloom, floating shapes, or particle effects as substitutes for subject matter.
7. Use raycasting, orbit controls, object inspection, or spatial navigation only when the interaction serves the task. Give interactive objects visible, DOM-accessible controls or equivalent actions. Prevent competing camera writers during scripted movement and manual exploration.
8. Keep important text and controls in semantic HTML, anchored or overlaid in reserved safe areas. Use 3D typography only when it stays readable and has a DOM equivalent. Keep labels from crossing each other or obscuring subjects.
9. Provide loading, retry, missing-asset, and context-loss states. Do not leave the audience with an empty canvas. A fallback should preserve the same chapter and message.
10. Dispose geometries, materials, textures, render targets, controls, and listeners. Stop unnecessary work when the document is hidden, the scene is offscreen, or a hold point is reached.

Consult current official Three.js documentation for version-sensitive APIs, colour management, shaders, renderer features, or loaders. Verify stable package versions before installation. Do not copy deprecated examples blindly.

## Motion Quality

- Build a motion score with deliberate reveals, continuity between shots, visual hierarchy, easing, and pauses. Use object assembly, sectional views, spatial comparisons, tracing, or transformation when these explain the subject.
- Choose camera moves sparingly: a dolly reveals depth, an orbit reveals shape, a close-up reveals detail, and a cut can preserve clarity. Avoid constant spinning, repeated swoops, excessive roll, and motion with no informational purpose.
- Preview transitions in both directions and under rapid repeated input. Cancel or supersede previous transitions rather than stacking them.
- For immersive requests, assess the whole sequence, not just whether one object moves. A rotating globe, a background pan, a fade, or staggered cards alone does not meet the brief.
- Respect reduced motion with stable viewpoints and discrete state changes. Preserve explanatory steps without vestibular camera movement. Do not autoplay audio; make any narration or sound optional and controllable.
- Offer pause, replay, seeking, and chapter navigation when relevant. Design these controls for the project rather than copying a standard presentation footer.

## Assets, Delivery And Performance

- Record each asset's source and licence and whether it was compressed, cropped, or adapted. Do not present an approximate model as an accurate heritage reconstruction, scientific measurement, or product geometry.
- Bundle fonts, models, textures, and decoder code locally. For standalone offline HTML, embed the required data and verify loaders, workers, WASM, and decoders through `file://` with networking disabled. Remote CDN dependencies are not offline support.
- Prefer a standalone distribution when feasible. If asset scale makes that unsuitable, explain the trade-off and obtain agreement on a portable static asset folder before changing the delivery contract. Do not quietly add a backend or viewer build step.
- Set project-specific budgets for initial download, decoded texture memory, draw calls, geometry, DPR, and frame time. Profile a representative complex beat; do not promise device performance from headless test timing alone.
- Prefer instancing, shared materials, compressed assets when compatible with delivery, appropriate texture sizes, and limited shadows/postprocessing. Lower cost before lowering legibility.
- Provide a quality fallback for constrained devices and a meaningful static state without WebGL. Keep viewport changes from restarting the story or losing progress.

## Verification Gates

- Typecheck and production build pass; timeline tests cover exact boundaries, total duration, random seeks, backward seeks, replay, and pause/resume.
- Playwright covers loading, retry/fallback, navigation, input conflicts, direct chapter entry, reduced motion, and keyboard access for implemented interactions.
- Inspect screenshots of every chapter's important start, middle, and final states at wide desktop, laptop, narrow phone portrait, and landscape sizes. Test every offered theme, not a mandatory pair of themes.
- Verify meaningful canvas pixels, changing frames during playback, a stable frame during pause, and distinct intended scene states. Check subject bounding boxes or an inset pixel mask to detect unintended clipping. Do not require an empty canvas edge when full-bleed geometry is intentional.
- Verify subject framing, loaded textures/models, occlusion, label placement, DOM/canvas intersections, and readable text. A screenshot byte count or a nonblank canvas alone is not enough.
- Resize during playback; navigate or seek repeatedly; test touch/drag and keyboard equivalents. Confirm the camera, captions, active chapter, and timeline remain synchronized.
- Capture frame-time and renderer-resource observations on a representative visible browser/device; disclose untested devices and any performance limits.
- Test the actual distribution offline through `file://` and under the static subdirectory host. If video export is requested, test the encoded output's duration, frames, audio, and playback separately.
- Follow the general skill's publication gates. Do not call a real-time 3D story an exported video or claim deployment from a push alone.

## Handover

Provide the working experience, editing/build instructions, asset credits, and a concise record of the chosen direction and verified limitations. For a presentation, include narration and cue notes in the agreed format. Do not automatically add a notes modal, overview grid, dual themes, or a permanent toolbar to every experience.