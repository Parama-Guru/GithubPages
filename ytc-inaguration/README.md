# Yuva Tourism Club Inauguration

PSG College of Technology | 29 September 2026 | F201

Open [index.html](index.html) directly in a modern browser. No installation, server, or internet connection is required. Images, fonts, scripts, styles, Three.js, and licence notices are embedded in this file. External reference and social links require internet access.

## Programme

The 21-slide presentation contains the welcome address, faculty-address holding slide, club vision, all 16 supplied office bearers, Indian tourism, the influence of AI in tourism, conclusion, and vote of thanks.

Prepared material is allocated 17 minutes, plus the untimed faculty address. Indian tourism and AI in tourism are allocated exactly five minutes each. The slide timings guide rehearsal, not automatic advance. Team timings include pauses and audience acknowledgement.

[speaker-notes.md](speaker-notes.md) contains the full speaking script, timings, handover cues, and references. The same notes are available from the book icon in the presentation.

## Controls

- Previous/next arrows, or Left/Right, Page Up/Page Down, and Space to navigate.
- Home/End to jump to the opening or closing slide.
- Chapter navigation and the grid icon to jump to a section or slide. O opens the overview.
- Book icon or N to open speaker notes. The notes' arrows change slides without closing the notes.
- Escape closes a dialog. Dialogs trap keyboard focus while open.
- Sun/moon icon changes theme; the preference is stored when browser storage is available.
- Fullscreen icon enters or exits fullscreen where supported.
- Motion toggle pauses/enables motion. Globe and itinerary timelines also have play/pause, replay, and seeking controls.
- Drag the globe to adjust its view. Reduced-motion preferences show the final state by default. Missing WebGL uses a photograph fallback.

On smaller screens, the slide area scrolls vertically while navigation remains accessible. No slide advances automatically.

## Pending Event Confirmation

- Faculty speaker's name, designation, and speaking duration.
- Topic assignment for the Secretary and the second office-bearer presenter.
- Final name spellings, designations, portrait permissions, and club social account.
- Expansion of ERM, retained as supplied without an invented expansion.
- The actual activity calendar. On-screen activity ideas are explicitly proposed and subject to faculty guidance, permissions, and planning.

The itinerary demonstration is illustrative; it does not make bookings, call an AI service, or provide live travel information. Reference material includes Incredible India, UNESCO, OECD, and NIST. The OECD research is not presented as India-specific adoption evidence.

## Verification

Verified in Microsoft Edge/Chromium on Windows:

- Content tests: two five-minute topics, 17-minute total, unique slide IDs, speaking notes, reference IDs, and navigation boundaries.
- TypeScript strict typecheck and production build.
- All 21 slides at 1440x900, 1024x768, 390x844, and 844x390, in light and dark themes.
- Offline direct-file loading with no HTTP asset requests; local font and image decoding.
- Horizontal overflow, content/tool intersections, and desktop slide fit.
- Keyboard navigation, boundary controls, overview, notes, focus containment, source dialogs, theme persistence, and fullscreen.
- Nonblank globe pixels, changing frames, dragging, pause, replay, seeking, reduced motion, and WebGL fallback.
- Mobile globe playback and dialogs in both themes.
- Static hosting beneath `/GithubPages/ytc-inaguration/`.

Safari, Firefox, and the actual projector have not been tested. The root index entry is covered by a browser test that checks event metadata and the presentation destination.

## Publication

Direct presentation URL: **https://parama-guru.github.io/GithubPages/ytc-inaguration/**

The root index links to this presentation. Publication uses the repository's existing static GitHub Pages deployment from `main`, with no viewer setup or server-side build. Verify the live root entry and direct URL after each deployment.

## Local Development

Editable React/TypeScript/Vite source is retained in the ignored `app/` folder. Local tooling and test artifacts are deliberately excluded from the static publication. Node 24 or newer is used for the local scripts; viewers do not need Node.

From this project directory:

```powershell
npm install --prefix app --cache .cache/npm
npm run assets --prefix app
npm run test --prefix app
npm run build --prefix app
npm run verify --prefix app
node app/scripts/review.ts
```

The build publishes the standalone file, speaker notes, and third-party notices to this directory. The browser suite uses an installed Microsoft Edge browser. Screenshots and contact sheets are kept under ignored `artifacts/`.

Optional source-development server: `npm run dev --prefix app`. It is not needed to view the completed presentation.

Before an authorized publication, stage only this project's distribution and required assets/documentation. Root navigation needs separate authorization. After pushing, verify the actual deployed URL; a successful local test does not establish successful publication.

See [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) for asset credits and bundled licences.