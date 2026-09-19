---
name: create-webpage
description: "Use when creating or redesigning a website, web presentation, interactive story, or educational experience. Establish the user's brief, inspect multiple live reference websites with Playwright, select a distinct visual direction, and build and verify a responsive static experience. Avoid repeated palettes, layouts, and presentation shells. For full-3D websites or cinematic Three.js presentations, also load the threejs-cinematic skill."
---

# Create Webpage

This is a design and implementation workflow, not a website template. The subject, audience, user preferences, and reference research determine the experience. A previous project's palette, slide shell, speaker-notes dialog, or animation is not the default for the next project.

## Scope

Work only in the directory authorized by the user. Keep source code, dependency caches, generated assets, test artifacts, and static output within that boundary. Never inspect sibling projects or change repository-wide settings to complete a local webpage.

Use explicit project and package-cache paths after interruptions; do not assume the terminal retained its working directory. A reset working directory must not redirect commands toward a sibling project.

This skill lives at the repository root's `.github/skills/create-webpage/SKILL.md`, the standard project skill location, so every website in this workspace can use it. Choose the task's authorized project folder and read its local instructions. Root navigation, shared documentation, and deployment configuration may be changed only when the user authorizes those shared surfaces. Do not alter global skill-discovery settings.

For an immersive 3D website, WebGL-led experience, cinematic presentation, or a request to make the whole presentation a 3D video-like journey, also read [Three.js Cinematic](../threejs-cinematic/SKILL.md). This skill owns the brief and reference selection; that skill owns the scene, camera, timeline, and 3D implementation. Research once and share the same design brief.

## User Brief First

1. Capture the audience, subject, purpose, primary action or story, tone, content, supplied assets, and known references. For a presentation, capture duration, delivery style, and speaker handovers.
2. Record explicit likes, dislikes, colour preferences, motion expectations, accessibility needs, and device or projector constraints. Use prior feedback already in the conversation; do not ask the user to repeat it.
3. Ask concise questions only where an unanswered choice materially changes the result. When the user delegates decisions, make and state reasonable assumptions. Never invent names, dates, achievements, or approved activities.
4. Distinguish a new visual identity from a refinement of an existing site. Preserve an existing design unless redesign is requested. Do not retrofit this workflow's new aesthetic preferences into completed projects without permission.
5. Respect planning versus implementation authorization. Research and recommend during planning; implement when authorized. Do not turn a request for a usable experience into a marketing landing page by default.

User requirements and usability outrank reference aesthetics. A professional result can be expressive, cinematic, editorial, technical, or restrained; "professional" does not prescribe a beige, teal, gold, dark, or card-based theme.

## Live Reference Research

For a new website, presentation identity, or substantial visual redesign, complete this step before choosing the composition. A small bug fix or local content edit does not require a new design research round.

1. Use web search, user-provided links, design directories, or relevant organisations to find 4-6 distinct candidate websites. Include subject-relevant sites and different approaches to composition and motion. A gallery screenshot is a lead, not evidence of how the original site behaves.
2. Open the actual sites with Playwright browser tools. Inspect at least three accessible candidates at desktop and mobile sizes. Scroll through the experience and exercise a representative menu, chapter change, or interaction. For animation references, observe at least two meaningful states and the transition between them.
3. Record the URL, inspected viewport, screenshots or observed states, layout, typography, colour roles, navigation, motion behaviour, and one useful idea or limitation. Keep the evidence in an existing project brief or a concise project-local design note; avoid creating a report collection. Keep screenshots local and ignored.
4. Compare the candidates against the user's brief: content fit, tone, legibility, interaction model, mobile behaviour, motion ambition, and feasibility with available assets and the static/offline delivery requirements.
5. Choose one primary reference direction and explain why it fits this user and subject. Use other references only for specific supporting ideas. Select principles, not another site's brand, exact layout, proprietary source, or unlicensed assets.
6. Show the user a short recommendation with reference links and the key visual and interaction decisions before substantial implementation. Ask for a choice if materially different directions remain unresolved or approval was requested; otherwise proceed under the user's existing authorization and stated assumptions.

If a site is blocked, use another candidate. If Playwright or external access is unavailable, disclose the limitation and use available user references or static evidence provisionally. Never claim to have inspected live behaviour from a screenshot or fetched text. Hidden browser tabs can stall animation; use a visible tab or an independent headless browser. Forced clicks do not prove usable interaction.

## Project-Specific Direction

Write a compact design brief containing:

- The user's requirements and the selected reference direction with URLs.
- The overall composition and information hierarchy, chosen for this subject.
- A typography pairing and semantic colour roles for surfaces, text, emphasis, and data.
- The asset approach and how visitors will see the real subject, object, place, or concept.
- A motion storyboard: what changes, why it matters, and how the user controls it.
- Responsive behaviour, accessibility, performance limits, and verification criteria.
- At least three intentional differences from prior work visible in the conversation or explicitly authorized references. Do not inspect sibling projects merely to make this comparison.

Meaningful differences include composition, typography, visual assets, colour relationships, navigation, spatial structure, and motion language. Changing an accent colour or background photograph on the same shell is not a new direction. Do not force novelty that contradicts an established brand or the user's wishes.

Choose the format deliberately: an editorial story, a practical tool, a spatial exhibition, a guided 3D journey, a conventional deck, or another suitable form. Do not automatically add a masthead, chapter strip, footer toolbar, repeated three-column sections, cards, slide counter, notes modal, or light/dark toggle. Include only controls needed by the chosen workflow, with familiar semantics and keyboard access.

## Content Before Composition

1. Read the nearest existing content and identify the audience, topic, and real user workflow.
2. Separate verified facts, reported research results, and schematic examples. Preserve source links and important caveats.
3. For timed presentations, write the speaking script and chapter timings alongside the content. Check that the duration totals the requested time. Keep scripts outside the audience view; choose a notes document, presenter view, or requested notes interface instead of always generating the same notes dialog.
4. Select visuals that explain this domain's mechanisms, changes, relationships, or evidence. Do not reuse retrieval diagrams, globes, generic particles, or an AI chip merely because an earlier project had them.
5. Source real subject imagery and record licences and attribution. Search-engine screenshots do not grant rights to the images shown. For historical reconstructions or schematic 3D models, label what is illustrative rather than presenting invented details as evidence.

## Static Architecture

- Viewer setup must be zero: no backend, Node.js, npm, package installation, build command, or local server is required to view a shared presentation.
- Prefer a single ready-to-open HTML distribution file with bundled JavaScript, CSS, Three.js, and local fonts. It must work offline through `file://` as well as ordinary static hosting.
- Keep any optional Node-based development tooling separate from the shareable output. Sharing raw TSX source alone does not satisfy the delivery requirement.
- This is a static publishing repository: keep local development workspaces, dependency directories, package caches, and browser/test artifacts ignored and out of commits. Retain editable source locally unless its deletion is explicitly requested.
- For GitHub Pages, publish the verified standalone artifact as the presentation folder's `index.html`, use case-correct relative links from the root index, and retain `.nojekyll` for unprocessed static publishing. Do not introduce a Node-based Pages build for an already bundled file.
- Favor the simplest architecture that supports the requested visuals. Do not add services, databases, authentication, recording systems, or other unrelated complexity.
- Reuse the project's suitable tooling. For a new interactive build, prefer one TypeScript toolchain with React and Vite; use Tailwind CSS, Three.js, and other dependencies when they serve the chosen experience. Tooling reuse does not require visual-shell reuse.
- Verify stable package versions before installing. Do not trust an environment's `latest` tag without checking for prereleases.
- Use a relative Vite base for subdirectory hosting. Generate ordinary static assets without runtime API keys, server rendering, or a required backend.
- Keep a small HTML bootstrap; implement the experience in components and typed data rather than a monolithic HTML slideshow.
- Bundle fonts locally and use a deliberate display/body pairing. Avoid remote font dependencies during a presentation.
- Reuse a single lifecycle-managed WebGL scene when practical. Dispose resources and listeners on unmount.

## Art Direction

- Implement the selected project-specific direction, not a fixed house palette. Use clear hierarchy, purposeful composition, and enough tonal and colour contrast for the subject and audience.
- Use semantic CSS variables. Choose a primary theme from the brief; provide multiple themes only when requested or useful for the audience's workflow. Test every theme actually offered, including text, charts, controls, captions, and canvas content.
- Use expressive fonts without negative letter spacing or viewport-scaled type. Change fixed type sizes at responsive breakpoints when needed.
- Keep the primary 3D scene unframed. Do not put the experience inside a decorative card or nest cards inside cards.
- Design motion as sequences with setup, action, and resolution. Camera movement, object transformation, material changes, reveals, and temporal explanations should communicate meaning. A fade, staggered entrance, spinning globe, or background pan alone does not satisfy a request for ambitious animation.
- Scale motion to the brief. Full-3D requests use the cinematic skill; quiet operational interfaces may need minimal motion. Respect reduced motion and provide pause/replay/seek controls for time-based sequences without imposing a standard toolbar on every site.
- Use icons for tools, segmented controls for modes, sliders for continuous parameters, and text buttons for clear commands. Name icon buttons accessibly and provide tooltips.

## No-Overlap Contract

1. Use grid/flex layouts with reserved header/footer tracks and explicit minimum sizes. Let text wrap; use `min-width: 0` on shrinking grid children.
2. Use container queries or breakpoints for stacked composition. Small screens may scroll vertically; never hide essential content to force a desktop slide into a phone.
3. Reserve separate space for scene labels, legends, captions, controls, and source notes. Avoid projecting unbounded labels over body text.
4. Keep fixed-format controls stable when text, icons, loading states, or hover states change.
5. Test every chapter at desktop, compact laptop, mobile portrait, and mobile landscape sizes in every offered theme. Inspect screenshots and bounding boxes, not only build output.
6. Test long titles and all controls, dialogs, or presenter interfaces actually implemented. Fix the owning layout rather than applying arbitrary negative offsets. If scrollbars are hidden, preserve touch, wheel, keyboard, and focus-driven access; do not hide unreachable content.

## Implement And Review

1. Build a small representative slice of the chosen direction. For an ambitious presentation, this should include a real transition or explanation, not only a title screen.
2. Run the cheapest scoped check immediately after the edit. Resolve local failures before expanding to more chapters.
3. Compare screenshots and actual interaction with the design brief. Check content correctness and visual quality, not just successful rendering. Present a preview when the main direction is ready for feedback.
4. Apply feedback to the owning content, layout, camera, or motion model. Do not layer unrelated visual effects over an unresolved design problem.
5. Finish the remaining content using the established project-specific language, then complete the relevant verification gates.

## Verification Gates

- Typecheck and production build pass.
- Tests verify duration, source references, real calculations, and navigation boundaries.
- Browser tests cover the selected workflow and all implemented controls; do not add overview, notes, fullscreen, or theme switching just to match a standard test suite.
- Verify local fonts and assets load and console errors are absent. For WebGL, verify meaningful pixels, framing, and changing frames when animation runs; a nonblank canvas alone is insufficient.
- Compare the result with the brief and selected references. Confirm the requested differentiation is structural, not a palette swap on a repeated template.
- Check screenshots across viewport sizes and every offered theme. Verify horizontal overflow, long content, and control intersections.
- Test reduced motion, keyboard access, and WebGL fallback where applicable. Essential content must remain usable without animation.
- Open the distribution directly from the filesystem with networking disabled and verify the full experience. Test static subdirectory hosting too. A development-server-only success is insufficient.
- When a standalone file works, open that file for the user and provide its link; do not make a Node server part of the viewing workflow.
- Document the start/build commands, deployment path, speaking script, controls, and verified limitations. Do not commit or push without authorization.
- Before an authorized push, inspect the staged file list for dependency/cache paths and unrelated work. After pushing, verify the live root entry, deck response, and browser behavior. Report the public URL and commit, without claiming deployment from a push exit code alone.

## Maintain This Skill

After a future revision, update the relevant rule with a verified lesson rather than adding project-specific hacks. Keep requirements actionable and avoid duplicate instructions. Retain the access boundary and verification gates. Record reusable technical lessons, not a project's colours, slide shell, or aesthetic as a new universal default.