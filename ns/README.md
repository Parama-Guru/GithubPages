# Signed Random Networks

**Network Science | Semester 9 | 2027**

An 18-minute Network Science presentation for three speakers, with interactive Three.js diagrams and code-generated charts. No backend, runtime CDN, image downloads, or installation is required to view it.

## Open the Presentation

Open [index.html](index.html) directly in a modern browser. This is the complete standalone distribution with JavaScript, CSS, fonts, and Three.js bundled inside. It works offline. Source links require a connection when opened.

Public URL: **https://parama-guru.github.io/GithubPages/ns/**. The [main page](../index.html) lists it under Semester 9, 2027. Keep `index.html` and `THIRD-PARTY-NOTICES.txt` when distributing. No routing rules are needed: slide navigation uses hashes such as `#/8`.

## Speaking Plan

| Speaker | Slides | Section | Duration |
| --- | --- | --- | --- |
| 1 | 1-5 | Model the relationships | 06:00 |
| 2 | 6-10 | Find the balance | 06:00 |
| 3 | 11-15 | Challenge the model | 06:00 |

The full [speaker script](speaker-notes.md) includes handoffs, demonstrations, and citations. The notes icon also opens the current slide's script. Timings are rehearsal targets including demonstration pauses, not a guarantee of speaking speed. Slides advance manually. The final two minutes of a 20-minute slot can be used for questions.

## Controls

- Arrow Left / Right or Page Up / Down: navigate slides, including from navigation buttons and while notes are open. Notes stay synchronized with the slide.
- Tab: open speaker notes from the presentation. Escape: return to the slide.
- / or the keyboard icon: open the shortcut guide. Press / again or Escape to close it.
- Home / End: jump to first / last slide.
- Space: play or pause the current 12-second explainer.
- N: speaker notes. O: overview. Escape: close a dialog.
- The graph supports pointer rotation. Matrix cells and edge buttons provide keyboard-accessible experiment controls.
- Play, pause, replay, and seeking operate on the explainer, separately from the talk timer.
- The timer button starts or pauses the talk clock. Reset is in speaker notes.
- Theme, sources, overview, and fullscreen controls are in the top toolbar. Fullscreen availability depends on the browser. Narrow screens use normal page scrolling.
- Reduced motion follows the system preference and can also be selected in notes. Add `?webgl=off` before the slide hash to exercise the readable fallback.

Inside dialogs and form controls, Tab moves focus normally; Shift+Tab always moves focus backward. Turn off **Tab opens speaker notes** in the shortcut guide for normal Tab navigation everywhere. Sliders, text inputs, and editable content retain their native keys. The preference lasts for the current page session. The explainer pauses while a dialog is open; the separate talk timer keeps its own state.

## Scientific Scope

The main model is a simple undirected signed Erdos-Renyi graph. `p` is edge presence and `q` is positive sign probability conditional on presence. Pair outcomes have probabilities `pq`, `p(1-q)`, and `1-p`. Topology and sign draws are separate per pair and seeded for repeatable classroom comparisons.

Independent signs imply `P(balanced | triangle) = q^3 + 3q(1-q)^2`. An observed triangle fraction is undefined if the graph has no triangles. General strong balance is checked by propagating group labels across every connected component, not by triangles alone.

The randomization demo preserves topology and exact total sign counts, not individual signed degrees. This finite fixed-count null is not identical to independent signs. The original example is constructed, not empirical. Exact frustration is enumerated only for small graphs, with a 12-node safety limit. Node positions are schematic, never presented as measured embeddings or inferred communities.

Published Epinions percentages are rounded values from Leskovec et al. (2010), Table 3, using their undirected representation. They are not recalculated from the SNAP download. Direction, status, heterogeneity, and context are discussed in the script.

## Development

The editable `app/` workspace is retained locally and intentionally excluded from this static publishing repository, along with dependencies, caches, staging output, and test artifacts. A checkout contains the ready-to-open presentation, script, documentation, and license notices.

Where the local development workspace is present, Node 24 or newer is required only for development. From this `ns` directory:

```powershell
npm --prefix app --cache .npm-cache ci
npm --prefix app --cache .npm-cache test
npm --prefix app --cache .npm-cache run build
npm --prefix app --cache .npm-cache run lint
npm --prefix app --cache .npm-cache run test:e2e
```

The build stages in `dist/`, then publishes the standalone HTML, speaker script, and dependency notices at this directory's root. It never empties the root directory. Optional development preview: `npm --prefix app run dev -- --host 127.0.0.1`. A server is not needed to view the delivered HTML.

Source ownership: `app/src/content.ts` contains the lesson and script; `network.ts` contains the calculations; `Scene.tsx` manages WebGL resources; `Presentation.tsx` owns slide state and controls; `presentation.css` owns both themes and responsive layout.

## Verification

Tests cover the eight triangle assignments, random generation, global balance, shuffling invariants, exact frustration, equation rendering, sources, and the 18-minute split. Playwright tests the actual standalone file offline and under static subdirectory hosting, plus fonts, canvas pixels, animation changes, graph framing, navigation, themes, dialogs, controls, reduced motion, and the WebGL fallback.

All slides are checked at 1440x900, 1024x768, 390x844, and 844x390 in both themes. Rehearsal shortcuts and the shortcut guide are also checked down to 320x568, including native control keys and the normal-Tab preference. Screenshots and contact sheets are written under `artifacts/`, not committed. Browser tests use installed Microsoft Edge; change `channel` in `app/playwright.config.ts` for another installed Chromium browser. Safari and Firefox are not yet verified.

## Research and Design References

- [Li and Wang: random signed graph model](https://arxiv.org/html/1812.11865v1)
- [Easley and Kleinberg: Chapter 5, positive and negative relationships](https://www.cs.cornell.edu/home/kleinber/networks-book/)
- [Antal, Krapivsky, and Redner: balance dynamics](https://arxiv.org/html/physics/0605183v1)
- [Leskovec, Huttenlocher, and Kleinberg: Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1)
- [Stanford SNAP: signed Epinions](https://snap.stanford.edu/data/soc-sign-epinions.html)

Interaction research: Nicky Case's [Crowds](https://ncase.me/crowds/), Brown's [Seeing Theory](https://seeing-theory.brown.edu/basic-probability/index.html), and Bartosz Ciechanowski's [Curves and Surfaces](https://ciechanow.ski/curves-and-surfaces/). These informed mechanisms and explanatory pacing, not copied assets or layouts. Visuals are generated in code, with Bricolage Grotesque and Source Sans 3, neutral white/charcoal, cobalt positives, and vermilion negatives.