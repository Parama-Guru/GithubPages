---
name: portfolio-card
description: "Use when adding, editing, reordering or reviewing a project card on the root portfolio index.html (the GitHub Pages landing page), e.g. \"create a card for this URL\". Defines the card fields and character limits (about text at most 120 characters), product/type/year filter values, links, order, research steps and the check script."
---

# Portfolio Card

The root `index.html` is the owner's portfolio: one card per project, filtered by Product, Type and Year and sortable by year. Every card follows these rules. When a rule changes, bring every existing card into line in the same change.

## Card markup

Copy this shape; the filter script reads the `data-*` attributes.

```html
<a class="card" href="https://parama-guru.github.io/concept-grove/" data-product="application" data-type="personal" data-year="2026">
  <p class="card-meta">Open-source study app / 2026</p>
  <h2>Concept Grove</h2>
  <p>
    600 original machine learning, deep learning and NLP flashcards with spaced repetition.
    Free to use, no sign-in needed.
  </p>
</a>
```

## Fields

| Field | Rule |
|---|---|
| `href` | The live site, not the source repository. A folder in this repository is relative, case-correct and ends with `/` (`ns/`) so it works under `/GithubPages/`; anything else is the full `https://` URL. Open in the same tab (no `target`), like every card. |
| `data-product` | Required. An id from `PRODUCTS` in the page script: `website`, `application` or `presentation`. |
| `data-type` | Required. The context the work was made in, an id from `TYPES`: `academic` (coursework), `hackathon` (a competition or challenge), `professional` (for a club, department or organisation), `client` (a website or application built for a client), `personal` (the owner's own work, such as open-source tools anyone can use). It is filter-only: never print the type on the card. Ask the owner when unsure. |
| `data-year` | Required. Four digits: the year the work was delivered or published. It must match the year in the meta line. |
| Meta (`.card-meta`) | "What it is / year", e.g. `Open-source study app / 2026` or `Semester 9 / 2026`. One to three segments joined by ` / `, each starting with a capital letter or digit, at most 48 characters, and containing the `data-year` value. |
| Title (`h2`) | The project's real name, at most 40 characters. Add a short qualifier only to tell two cards apart (`Ganesh Electricals — 3D website`). |
| About (`p`) | At most **120 characters**, counted after collapsing whitespace (an entity such as `&amp;` counts as one). One or two plain sentences ending with a full stop, about three lines on a phone. Say what it is or does, then one concrete fact: a number, a result, or who can use it. No filler ("modern", "stunning", "renowned") and no repeat of the meta line. |

## Content

- Use only facts from the live site, its README, the repository metadata or the owner. Every number must appear in a source. Never invent clients, dates, awards or results.
- For the owner's own public tools, say that anyone can use it (licence or "free to use") in the meta line or the about text, and use the type `personal`.
- Take the year from the publication date (repository `created_at`, first deployment or the owner's date). Ask when sources disagree.

## Order and filters

- DOM order is the "Featured" order. Put a new card first unless the owner names a position. Newest/Oldest sorting uses `data-year`; do not reorder cards for it.
- `PRODUCTS` and `TYPES` in the page script are the only category lists; the chips, counts and URL parameters are generated from them. Add a category only when real work needs it, give it a short label, and never leave a category without cards.

## Workflow: "create a card for <url>"

1. Open the live URL in a browser (Playwright) and confirm it renders without errors. Read the repository README and description (GitHub MCP), the licence and `created_at`.
2. Choose the product, type and year. Write the meta, title and about within the limits.
3. Insert the card at the top of `[data-cards]`, matching the existing indentation.
4. From the repository root, run `powershell -NoProfile -File .github/skills/portfolio-card/scripts/check-cards.ps1` and fix every reported issue. It prints each card's about length and exits with 1 on a violation.
5. Serve the repository root as static files and check at 390 px and at least 1100 px wide:
   - The card appears under "All" and under its product, type and year chips, and the status line counts it.
   - Nothing overflows horizontally, and the link opens the right page.
   - The page also works when `index.html` is opened directly from disk.
6. Commit and push only when the owner says so. After publishing, check the live index at https://parama-guru.github.io/GithubPages/.
