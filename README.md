# GithubPages

Static sites published with GitHub Pages.

**https://parama-guru.github.io/GithubPages/**

| Path | What it is |
|---|---|
| `/GithubPages/` | landing page |
| `/GithubPages/ns/` | [Network Science presentation](https://parama-guru.github.io/GithubPages/ns/) - Semester 9, 2027; Signed Random Networks |
| `/GithubPages/ir/` | [Information Retrieval presentation](https://parama-guru.github.io/GithubPages/ir/) - Semester 8, 2027; Query Expansion Techniques |
| `/GithubPages/CCT/` | [CCT: Confusion-Calibrated Tutoring](https://parama-guru.github.io/GithubPages/CCT/) - NIT Hackathon, 2027 |
| `/GithubPages/originzero/` | [OriginZero approval deck](https://parama-guru.github.io/GithubPages/originzero/) — seven slides, presented as a website |

## OriginZero deck

A research collaboration portal for the Applied Mathematics & Computational Science department at
PSG College of Technology. The deck exists in two forms:

- `originzero/index.html` — the site version, loading `deck.css`, `deck.js` and fonts from Google Fonts
- `originzero/OriginZero-deck-offline.html` — the same deck as a single self-contained file with the
  fonts, images, CSS and JS embedded; works with no internet and no sibling files

Scroll or use the arrow keys to move between slides. Press F11 for fullscreen.

## Publishing

Served straight from the root of `main` by GitHub Pages, with `.nojekyll` disabling Jekyll processing.
No backend, Node.js, package installation, or build step is needed for hosting or viewing the published files.
The `.nojekyll` marker is retained intentionally: GitHub's branch-deployment workflow uses it to skip
Jekyll processing for these already prepared static files.

The [Network Science presentation](ns/index.html) covers Signed Random Networks for Semester 9, 2027.
Its 15 slides total 18 minutes, divided equally among three speakers, with interactive Three.js graphs,
structural balance experiments, and light/dark themes. The standalone file works offline and needs no
backend or runtime downloads. See [ns/README.md](ns/README.md) and the [speaker script](ns/speaker-notes.md).

The [IR presentation](ir/index.html) is a self-contained file with Three.js, styles, and fonts embedded.
It includes 16 chapters, a 15-minute speaking script, light/dark themes, and interactive explanations.
Download that one file for offline viewing. Development workspaces, `node_modules`, caches, and test artifacts
are local-only and excluded from GitHub. See [ir/README.md](ir/README.md) for content and compatibility notes.

The [CCT deck](CCT/index.html) contains nine slides and loads its adjacent CSS and JavaScript directly.
It needs no backend or installation. Share the complete `CCT` folder for local viewing; internet access
loads its Google Fonts, with fallback fonts available otherwise. See [CCT/README.md](CCT/README.md).

The reusable [create-webpage skill](.github/skills/create-webpage/SKILL.md) is available at the repository root
for future website tasks, with shared requirements in [AGENTS.md](AGENTS.md).

The OriginZero deck source lives in the OriginZero repository under `pppt/`; this repository is the published
copy.
