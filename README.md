# GithubPages

Static sites published with GitHub Pages.

**https://parama-guru.github.io/GithubPages/**

| Path | What it is |
|---|---|
| `/GithubPages/` | landing page |
| `/GithubPages/ir/` | [Information Retrieval presentation](https://parama-guru.github.io/GithubPages/ir/) - Semester 8, 2027; Query Expansion Techniques |
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

The [IR presentation](ir/index.html) is a self-contained file with Three.js, styles, and fonts embedded.
It includes 16 chapters, a 15-minute speaking script, light/dark themes, and interactive explanations.
Download that one file for offline viewing. Development workspaces, `node_modules`, caches, and test artifacts
are local-only and excluded from GitHub. See [ir/README.md](ir/README.md) for content and compatibility notes.

The reusable [create-webpage skill](.github/skills/create-webpage/SKILL.md) is available at the repository root
for future website tasks, with shared requirements in [AGENTS.md](AGENTS.md).

The OriginZero deck source lives in the OriginZero repository under `pppt/`; this repository is the published
copy.
