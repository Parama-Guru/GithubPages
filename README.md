# parama-guru.github.io

Static sites published with GitHub Pages.

**https://parama-guru.github.io/**

| Path | What it is |
|---|---|
| `/` | landing page |
| `/originzero/` | [OriginZero approval deck](https://parama-guru.github.io/originzero/) — seven slides, presented as a website |

## OriginZero deck

A research collaboration portal for the Applied Mathematics & Computational Science department at
PSG College of Technology. The deck exists in two forms:

- `originzero/index.html` — the site version, loading `deck.css`, `deck.js` and fonts from Google Fonts
- `originzero/OriginZero-deck-offline.html` — the same deck as a single self-contained file with the
  fonts, images, CSS and JS embedded; works with no internet and no sibling files

Scroll or use the arrow keys to move between slides. Press F11 for fullscreen.

## Publishing

Served straight from `main` by GitHub Pages. No build step and no dependencies — plain HTML, CSS and
vanilla JavaScript.

The deck source lives in the [OriginZero](https://github.com/Parama-Guru/OriginZero) repository under
`pppt/`; this repository is the published copy.
