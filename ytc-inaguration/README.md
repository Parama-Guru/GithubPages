# Yuva Tourism Club Inauguration

PSG College of Technology | 29 September 2026 | F201

Open [index.html](index.html) directly in a modern browser. No installation, server, or internet connection is required. Images, fonts, scripts, styles, and licence notices are embedded in this file. External credit and social links require internet access.

## Programme

The 15-slide deck follows the updated agenda supplied on 24 September 2026. Date and venue are retained from the earlier confirmation. The times are interpreted as afternoon; confirm this with the organisers.

| Time | Segment |
|---|---|
| 4:30 - 4:35 PM | Prayer song |
| 4:35 - 4:45 PM | Welcome address |
| 4:45 - 4:50 PM | Club introduction |
| 4:50 - 5:00 PM | Introduction to the Chief Guest |
| 5:00 - 5:20 PM | Guest address |
| 5:20 - 5:30 PM | Introduction to office bearers |
| 5:30 - 5:35 PM | Annual plan 2026-27 |
| 5:35 - 5:40 PM | Vote of thanks |
| 5:40 - 5:45 PM | Photo session |

Total: 75 minutes. Cover and agenda are pre-event displays and add no time. The office-bearer slot includes acknowledgement of the two faculty advisors, followed by all 16 student office bearers. Paramaguru H precedes Rithika Sri R. Internal team-slide allocations are rehearsal suggestions within the ten-minute slot.

The two previous student topic talks and the separate faculty-address segment are removed. Their 3D scenes, interactive timelines, topic references, and speech handovers are not part of the distributed deck. Source assets remain local, but the event deck does not require WebGL.

The Chief Guest delivers their own address: the deck provides a quiet holding slide and host transition cues, not a prepared speech or topic outline. The introduction uses no invented biography. Prayer song and photo session also have quiet holding slides; no recording, lyrics, camera capture, or automatic playback is included.

[speaker-notes.md](speaker-notes.md) contains welcome, club-introduction, proposed annual-plan, and vote-of-thanks drafts, team cues, and the complete schedule. Rehearse these drafts against the allotted windows; timings include pauses, acknowledgements, transitions, and performances, not continuous scripted speech. The same notes are available from the book icon.

The opening, welcome, and closing retain their existing licensed destination photographs as ceremony imagery, not new topic talks or confirmed club trips.

## Controls

- Previous/next arrows, or Left/Right, Page Up/Page Down, and Space to navigate.
- Home/End to jump to the opening or closing slide.
- Chapter navigation and the grid icon to jump to a section or slide. O opens the overview.
- Book icon or N to open speaker notes. The notes' arrows change slides without closing the notes.
- Escape closes a dialog. Dialogs trap keyboard focus while open.
- Sun/moon icon changes theme; the preference is stored when browser storage is available.
- Fullscreen icon enters or exits fullscreen where supported.
- Motion toggle pauses/enables visual transitions. Reduced-motion preferences remove motion automatically.
- Prayer, guest introduction, guest address, and photo-session screens remain still regardless of the motion preference.

Native scrollbars are hidden. On smaller screens, the slide area still scrolls using touch, wheel, or the focused slide's Up/Down keys while navigation remains accessible. No slide advances automatically.

## Pending Event Confirmation

- Chief Guest's name, designation, pronunciation, and approved introduction. The address is allocated 20 minutes and is delivered by the guest.
- Both faculty advisors' names, departments, and portraits. The two profile slots deliberately say "to be confirmed" until supplied.
- Prayer-song performers and playback/live-performance arrangements, and the event's formal protocol.
- Hosts for each segment and photo-session arrangements.
- Final name spellings, designations, portrait permissions, and club social account.
- Expansion of ERM, retained as supplied without an invented expansion.
- The actual activity calendar. On-screen activity ideas are explicitly proposed and subject to faculty guidance, permissions, and planning.

The annual plan is an explicitly proposed direction, not an approved calendar. It covers learning discussions, carefully planned local exploration, and member participation. No specific dates, destinations, bookings, partnerships, or budgets are asserted.

## Verification

Verified in Microsoft Edge/Chromium on Windows:

- Content tests: all nine exact time slots, 75-minute total, per-slot allocation, ordering, unique slide IDs, script integrity, neutral guest cues, and navigation boundaries.
- TypeScript strict typecheck and production build.
- All 15 slides at 1920x1080, 1440x900, 1024x768, 390x844, 320x740, and 844x390, in light and dark themes.
- Offline direct-file loading with no HTTP asset requests; local font and image decoding.
- Horizontal overflow, hidden-scrollbar regression, preserved wheel/keyboard scrolling, content/tool intersections, and desktop slide fit.
- Exact agenda navigation, keyboard controls, overview, full paragraph-by-paragraph notes, focus containment, theme persistence, and fullscreen.
- Quiet holding states, no automatic guest-address advance after its slot, reduced motion, and no canvas/audio/video dependency.
- Two faculty slots, secretary ordering, proposed-plan status, and distinct opening/closing backgrounds without stale layers.
- Mobile agenda scrolling and long notes in both themes; removed topic deep links return safely to the opening.
- Static hosting beneath `/GithubPages/ytc-inaguration/`.

Safari, Firefox, and the actual projector have not been tested. The root index entry is covered by a browser test that checks event metadata and the presentation destination.

## Publication

Direct presentation URL: **https://parama-guru.github.io/GithubPages/ytc-inaguration/**

The root index links to this presentation. Publication uses the repository's existing static GitHub Pages deployment from `main`, with no viewer setup or server-side build. Verify the live root entry and direct URL after each deployment.

This agenda revision is a local review copy until an authorized commit and push. The existing public URL may still show the earlier programme.

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