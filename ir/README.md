# Query Expansion

## Open and Share

Open [index.html](index.html) in a modern browser. **That single file is the complete presentation.** It can be shared on its own and opened offline.

No backend, Node.js, npm, installation, build command, account, or local server is needed to view it. Three.js, the interface, Tailwind-generated styles, and fonts are embedded in the file. External research links require internet only when opened.

Bundled library and font license texts are preserved in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

GitHub Pages URL: **https://parama-guru.github.io/GithubPages/ir/**

The root site lists this deck as **Information Retrieval presentation / Semester 8 / 2027**. The same file works on any ordinary static host. No application server is involved.

## Presentation

- 16 chapters with a 900-second, 15-minute speaking schedule.
- Complete speaker notes, with a downloadable plain-text speaking script.
- Light and dark themes, remembered when browser storage is available.
- Three.js document networks, feedback flow, a word-sense diagram, a semantic-space plot, and a result chart.
- A 32-second captioned, real-time animated explainer with play, pause, seek, and replay. This is an explanatory animation, not a prerecorded video or generated voiceover.
- Interactive Boolean query expansion, original-query weighting, word senses, and benchmark-year comparison.
- Chapter overview, timed playback, fullscreen where supported, and 18 linked source records.

Open speaker notes with the book icon. Arrow keys or Page Up/Down navigate chapters; Home/End select the first/last chapter. Space starts or pauses timed presentation playback when an input or button is not focused. Desktop figures support bounded camera rotation. Small screens stack the content and scroll vertically rather than squeezing or clipping the slides.

Timings include the animated sequence and short demonstration pauses; actual speaking pace varies. Timed playback pauses while a dialog is open or the tab is hidden. Background motion can be paused independently.

## Evidence and Compatibility

The six-document demonstration and semantic coordinates are explicitly illustrative, not live model or search-engine output. The research chart contains author-reported Query2doc values from the specified March 2023 preprint, not independently reproduced measurements. See [query_expansion_research.md](query_expansion_research.md) for the research record and caveats.

Viewing requires a modern JavaScript-enabled browser. Three.js uses WebGL 2; a readable static fallback is provided when it is unavailable. Fullscreen and local-file opening depend on browser/platform permissions. A normal static-hosted link is an alternative on mobile file viewers that restrict HTML scripts. No claim is made that every legacy browser supports the complete visual experience.

Verified in Microsoft Edge on Windows:

- Direct file opening with networking disabled and no external runtime requests.
- Bundled font loading, nonblank canvas pixels, animation, and camera interaction.
- Every chapter in both themes at 1920x1080, 1440x900, 1024x768, 390x844, 320x568, and 844x390: 192 layout/diagram states.
- Navigation, references, speaker notes and script export, expansion controls, benchmark switching, and explainer controls.
- Reduced-motion preference and missing-WebGL fallback.
- Serving the identical file under a static subdirectory.

Other browser engines were not separately exercised in this environment.

## Future Work

The zero-install, no-backend requirements are recorded in [AGENTS.md](AGENTS.md) and the reusable [create-webpage skill](../.github/skills/create-webpage/SKILL.md). They apply to future work within `ir`.

The skill uses the standard location at the repository root, making it available to all website projects in this workspace. No global settings were changed.

The original [ir_ppt.html](ir_ppt.html) is preserved as a reference. The completed animated presentation is [index.html](index.html).

## Optional Development

Development tooling is not published in this repository. The original editing workspace is retained locally and ignored; installed dependencies and generated caches are disposable. They are not needed on GitHub or in Pages.

Future edits must preserve the single-file delivery contract and rerun offline, responsive, and static-host checks before replacing the published artifact. Do not substitute raw TypeScript source for the browser-ready file.