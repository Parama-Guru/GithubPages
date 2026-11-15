import {
  achievements,
  clients,
  company,
  credentials,
  downloads,
  execution,
  featuredProjects,
  leadership,
  milestoneSummary,
  projectGroups,
  projectImages,
  projectTotals,
  quality,
  timeline,
  whyUs,
  type ProjectGroup,
  type ProjectRow,
} from "@/content";
import { href, routes, type RouteId } from "@/routes/routes";
import { chapterNumber, chapters } from "@/timeline/chapters";
import { heroMotif } from "./art";
import { homeExtra } from "./flat";
import { arrow, arrowLeft, arrowUp, esc, img, photo } from "./html";
import { renderOrgChart } from "./orgchart";

const link = (id: RouteId, label: string, kind = "text-link") => `<a class="${kind}" href="${href(id)}">${esc(label)}${kind === "button" ? arrowUp : arrow}</a>`;
const list = (items: string[], className = "") => `<ul${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
const tags = (items: string[]) => list(items, "tags");
const groupRoute = (group: ProjectGroup) => `projects-${group.slug}` as RouteId;

const awardSizes: Record<string, [number, number]> = {
  "award-alstom": [137, 298],
  "award-danfoss": [211, 300],
  "award-daimler": [318, 153],
  "award-board": [278, 208],
};

// A figure the 2D site counts up to (app/flat.ts); the text stays the final value without JavaScript.
const tally = (value: string) => {
  const number = value.match(/\d[\d,]*(\.\d+)?/)?.[0].replace(/,/g, "");
  return number ? ` data-tally="${number}"` : "";
};

function label(index: number, text: string) {
  return `<p class="chapter-label"><span>${chapterNumber(index)}</span>${esc(text)}</p>`;
}

function statistics(compact = false) {
  return `<dl class="stats${compact ? " stats-compact" : ""}">${whyUs.statistics
    .map((stat) => `<div><dt>${esc(compact ? stat.short : stat.label)}</dt><dd data-count="${stat.value.replace(/,/g, "")}" data-final="${esc(stat.value)}">${esc(stat.value)}</dd></div>`)
    .join("")}</dl>`;
}

function directory() {
  return `<div class="directory">
    <div><p class="mono-label">Visit us</p><p>${esc(company.address)}</p></div>
    <div><p class="mono-label">Email</p>${company.emails.map((email) => `<a href="mailto:${email}">${email}</a>`).join("")}</div>
    <div><p class="mono-label">Telephone</p><a href="${company.phoneHref}">${esc(company.phone)}</a></div>
  </div>`;
}

function logos(limit?: number) {
  return `<ul class="logo-grid">${clients.logos
    .slice(0, limit)
    .map((logo) => `<li>${img(logo.src, logo.width, logo.height, logo.alt)}</li>`)
    .join("")}</ul>`;
}

function groupCards() {
  return `<ul class="year-cards">${projectGroups
    .map((group) => `<li><a href="${href(groupRoute(group))}"><strong>${esc(group.label)}</strong><span>${group.count} projects</span>${arrow}</a></li>`)
    .join("")}</ul>`;
}

function credentialCards() {
  return `<div class="cards">${credentials
    .map((item, index) => `<article><span class="mono-label">${chapterNumber(index + 1)}</span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`)
    .join("")}</div>`;
}

function awardFigure(name: string, caption: string) {
  const [width, height] = awardSizes[name] ?? [300, 300];
  return `<figure>${img(`media/${name}.webp`, width, height, caption)}<figcaption>${esc(caption)}</figcaption></figure>`;
}

function achievementBlock() {
  const board = achievements.board;
  return `<div class="awards">${achievements.awards.map((award) => awardFigure(award.image, award.caption)).join("")}${awardFigure(board.image, board.caption)}</div>
    <dl class="figures">${board.figures.map(([value = "", text = ""]) => `<div><dd${tally(value)}>${esc(value)}</dd><dt>${esc(text)}</dt></div>`).join("")}</dl>`;
}

function featured() {
  return `<div class="cards">${featuredProjects
    .map(
      (item) =>
        `<article><span class="mono-label">${esc(item.voltage || "Electrification")}</span><h3>${esc(item.title)}</h3><p>${esc(item.client)}</p></article>`,
    )
    .join("")}</div>`;
}

const chapterBodies: Record<string, (index: number) => string> = {
  welcome: () => `
    <h1 class="hero-title" data-split><span>Ganesh</span> <span class="title-script">Electricals</span></h1>
    <p class="chapter-lead hero-tagline">${esc(company.tagline)}</p>
    ${tags(company.expertise)}
    <div class="actions">
      <button class="button" type="button" data-action="enter">Enter the facility${arrow}</button>
      ${link("projects", "Explore projects")}
      <a class="text-link flat-only" href="${company.phoneHref}">Call ${esc(company.phone)}${arrowUp}</a>
    </div>`,
  about: (index) => `
    ${label(index, "About")}
    <h2 class="chapter-title" data-split>Ganesh Electricals</h2>
    <p class="chapter-lead">${esc(company.introduction)}</p>
    <ol class="mini-timeline">${milestoneSummary.map((item) => `<li><strong>${item.year}</strong><span>${esc(item.title)}</span></li>`).join("")}</ol>
    <div class="actions">${link("about", "About us")}</div>`,
  "why-us": (index) => `
    ${label(index, "How we serve")}
    <h2 class="chapter-title" data-split>How we serve</h2>
    <p class="chapter-lead">${esc(whyUs.lead)}</p>
    ${statistics(true)}
    <div class="actions">${link("features", "How we serve our clients")}</div>`,
  projects: (index) => `
    ${label(index, "Projects")}
    <h2 class="chapter-title" data-split>Projects</h2>
    <p class="chapter-lead">${esc(company.capability)}</p>
    <ul class="year-links">${projectGroups.map((group) => `<li><a href="${href(groupRoute(group))}">${esc(group.label)}</a></li>`).join("")}</ul>
    <div class="actions">${link("projects", "View projects")}</div>`,
  clients: (index) => `
    ${label(index, "Clients")}
    <h2 class="chapter-title" data-split>Our Clients</h2>
    <p class="chapter-lead">${esc(clients.lead)}</p>
    ${logos(6)}
    <div class="actions">${link("clients", "All clients")}</div>`,
  quality: (index) => `
    ${label(index, "Quality & Safety")}
    <h2 class="chapter-title" data-split>Quality &amp; Safety</h2>
    <p class="chapter-lead">${esc(quality.ehs.intro)}</p>
    ${tags(["Quality Policy", "Quality Standards", "EHS Policy", "EHS Standards"])}
    <div class="actions">${link("quality-safety", "Quality & Safety")}</div>`,
  leadership: (index) => `
    ${label(index, "Leadership")}
    <h2 class="chapter-title" data-split>Leadership</h2>
    <p class="chapter-lead">${esc(leadership.paragraphs[0] ?? "")}</p>
    <div class="actions">${link("leadership", "Leadership")}${link("organisation", "Organisation chart")}</div>`,
  contact: (index) => `
    ${label(index, "Contact")}
    <h2 class="chapter-title" data-split>Contact Us</h2>
    ${directory()}
    <div class="actions">${link("contact", "Send an enquiry", "button")}</div>`,
};

// Without JavaScript this opens the tour at its start; the router resumes the chapter the visitor left and names it.
const back = `<a class="back-link" href="${href("home")}" data-back aria-label="Back to the start of the tour">${arrowLeft}<span>Back</span></a>`;

// Each word of a page title sits in its own mask, so a page opened by the router raises its words in turn (main.css
// main.is-entering); the text itself and its line breaks are those of the plain title.
const words = (text: string) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => `<span class="w" style="--w:${Math.min(index, 10)}"><span>${esc(word)}</span></span>`)
    .join(" ");

function home() {
  return `<div class="journey" data-journey>
    ${chapters
      .map(
        (chapter, index) => `<section class="chapter" id="${chapter.id}" data-chapter="${chapter.id}" data-zone="${chapter.zone}" aria-labelledby="${chapter.id}-title">
          <div class="chapter-panel">${(chapterBodies[chapter.id] ?? (() => ""))(index).replace(/<h([12]) class="([^"]+)"/, `<h$1 id="${chapter.id}-title" class="$2"`)}</div>
          ${homeExtra(chapter.id)}
          <div class="chapter-poster" aria-hidden="true"><picture><source srcset="data:," media="(scripting: none)"><img src="/GithubPages/ge/posters/${chapter.id}.webp" width="1280" height="800" alt="" loading="lazy" decoding="async"></picture></div>
        </section>`,
      )
      .join("")}
    <p class="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><i></i></p>
  </div>`;
}

function hero(id: RouteId, eyebrow: string, title: string, lead = "", extra = "") {
  // The text column shares the content's left edge; the page's drawing sits beside it (below 900 px, beside Back).
  return `<header class="page-hero">
    ${back}
    ${heroMotif(id)}
    <p class="chapter-label"><span></span>${esc(eyebrow)}</p>
    <h1 class="page-title">${words(title)}</h1>
    ${lead ? `<p class="chapter-lead">${esc(lead)}</p>` : ""}
    ${extra}
  </header>`;
}

const sheet = (content: string, className = "") => `<section class="sheet ${className}">${content}</section>`;
const section = (eyebrow: string, title: string, content: string, className = "") =>
  sheet(`<p class="chapter-label"><span></span>${esc(eyebrow)}</p><h2>${esc(title)}</h2>${content}`, className);

function groupNav(active?: string) {
  return `<nav class="year-nav" aria-label="Project groups"><ul>${projectGroups
    .map((group) => `<li><a href="${href(groupRoute(group))}"${group.slug === active ? ' aria-current="page"' : ""}>${esc(group.label)}</a></li>`)
    .join("")}</ul></nav>`;
}

function dataTable(heading: string, head: string[], rows: string[][]) {
  return `<div class="table-block">
    <h2>${esc(heading)}</h2>
    <div class="table-scroll" role="region" aria-label="${esc(heading)}" tabindex="0">
      <table><thead><tr>${head.map((cell) => `<th scope="col">${esc(cell)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<td data-label="${esc(head[index] ?? "")}">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>
    </div>
  </div>`;
}

function projectTable(heading: string, rows: ProjectRow[], ongoing: boolean) {
  const head = ongoing ? ["S.No", "Client name", "Name of project", "Location", "Sector", "Value"] : ["S.No", "Client name", "Name of project", "Location"];
  return dataTable(
    heading,
    head,
    rows.map((row, index) => [String(index + 1), row.client, row.project, row.location, ...(ongoing ? [row.sector ?? "", row.value ?? ""] : [])]),
  );
}

function roles() {
  return `<div class="roles">${leadership.roles
    .map(
      (item) => `<details><summary><strong>${esc(item.title)}</strong><span>${esc(item.role)}</span></summary>
        <div class="roles-body"><div><h3>Responsibilities</h3>${list(item.responsibilities)}</div><div><h3>Authorities</h3>${list(item.authorities)}</div></div>
      </details>`,
    )
    .join("")}</div>`;
}

const pageBodies: Partial<Record<RouteId, () => string>> = {
  about: () =>
    hero("about", "About", company.tagline, company.introduction) +
    section("What we do", "Our expertise", list(company.expertise, "expertise")) +
    sheet(`<blockquote class="brand-statement"><p>${esc(company.closing)}</p></blockquote>`) +
    sheet(`<p class="sheet-lead">${esc(company.capability)}</p>
      <div class="split-text"><div><h3>Our purpose</h3><p>${esc(company.purpose)}</p></div><div><h3>Founded in 1997</h3><p>${esc(company.founded)} Incorporated / registered on ${esc(company.incorporated)}.</p></div></div>`) +
    section("Since 1997", "Milestones", `<ol class="timeline">${timeline
      .map((item) => `<li><strong>${item.year}</strong><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><time>${item.date}</time></li>`)
      .join("")}</ol>`) +
    section("Credentials", "Licence, registration & rating", credentialCards()) +
    section("Achievements", "Recognised on site", achievementBlock()) +
    sheet(`<div class="actions">${link("features", "How we serve")}${link("execution", "How we work")}${link("organisation", "Organisation chart")}${link("projects", "Projects")}</div>`),
  features: () =>
    hero("features", "How we serve", whyUs.title, whyUs.lead) +
    sheet(`<div class="principles">${whyUs.principles
      .map((item, index) => `<article><span class="mono-label">${chapterNumber(index + 1)}</span><h2>${esc(item.title)}</h2></article>`)
      .join("")}</div>`) +
    sheet(statistics()) +
    sheet(`<p class="sheet-lead">${esc(company.capability)}</p><div class="actions">${link("execution", "How we work")}${link("projects", "Projects")}</div>`),
  execution: () =>
    hero("execution", "How we work", "How we work", execution.capability) +
    section("Handling local issues", "Rapport on the ground", execution.localIssues.map((text) => `<p>${esc(text)}</p>`).join("")) +
    section(
      "TNEB liaisoning",
      `HT service in ${execution.tneb.total}`,
      `<ol class="steps">${execution.tneb.steps.map(([step = "", days = ""]) => `<li><span>${esc(step)}</span><strong>${esc(days)}</strong></li>`).join("")}</ol>
      <p class="steps-total"><span>Total</span><strong>${esc(execution.tneb.total)}</strong></p>`,
    ) +
    section(
      "Manpower deployment",
      `${execution.manpowerTotal} people per project`,
      `<dl class="manpower">${execution.manpower.map((item) => `<div><dt>${esc(item.role)}</dt><dd${tally(String(item.count))}>${item.count}</dd></div>`).join("")}</dl>`,
    ) +
    section("Equipment", "Access equipment on site", tags(execution.equipment)),
  projects: () =>
    hero("projects", "Projects", "Projects", company.capability, tags(company.expertise)) +
    sheet(`<dl class="stats">${[
      { value: String(projectTotals.ongoing), label: "On-going projects" },
      { value: String(projectTotals.executed), label: "Projects executed since 2012" },
      { value: "230", label: "kV — highest substation voltage" },
      { value: "1997", label: "Established" },
    ]
      .map((stat) => `<div><dt>${esc(stat.label)}</dt><dd${/^(19|20)\d\d$/.test(stat.value) ? "" : tally(stat.value)}>${esc(stat.value)}</dd></div>`)
      .join("")}</dl>`) +
    section("Featured", "Substation & electrification projects", featured()) +
    sheet(`<ul class="gallery">${projectImages
      .map(
        (image, index) =>
          `<li><figure>${photo(image, index ? "(max-width: 900px) calc(100vw - 48px), (max-width: 1368px) calc(50vw - 35px), 650px" : "(max-width: 1368px) calc(100vw - 48px), 1320px")}<figcaption>${esc(image.label)}</figcaption></figure></li>`,
      )
      .join("")}</ul>`) +
    section("Project lists", "On-going and executed projects", groupCards()),
  clients: () =>
    hero("clients", "Clients", "Our Clients", clients.lead) +
    sheet(`<h2 class="visually-hidden">Client logos</h2>${logos()}`) +
    section(
      "By voltage level",
      "Clients by voltage level",
      clients.byVoltage.map((group) => `<div class="voltage-group"><h3>${esc(group.level)}</h3>${list(group.clients, "columns")}</div>`).join(""),
    ) +
    section("International", "German clients", list(clients.german, "columns")) +
    section(
      "Sectors",
      "Industries we serve",
      `<div class="cards">${clients.sectors.map((group) => `<article><h3>${esc(group.sector)}</h3>${list(group.clients)}</article>`).join("")}</div>`,
    ) +
    section("Industrial areas", "Where we work", `<div class="cards">${clients.areas.map((group) => `<article><h3>${esc(group.area)}</h3>${list(group.clients)}</article>`).join("")}</div>`),
  "quality-safety": () =>
    hero("quality-safety", "Quality & Safety", "Quality & Safety", "Quality Policy · Quality Standards · EHS Policy · EHS Standards") +
    sheet(`<div class="policy"><div><span class="mono-label">01</span><h2>${quality.policy.title}</h2></div><div>${quality.policy.paragraphs
      .map((text) => `<p>${esc(text)}</p>`)
      .join("")}<p class="signature">${esc(quality.policy.signature)}</p></div></div>`) +
    sheet(`<div class="policy"><div><span class="mono-label">02</span><h2>${quality.standards.title}</h2></div><div>${quality.standards.paragraphs
      .map((text) => `<p>${esc(text)}</p>`)
      .join("")}${quality.workStandards.map((item) => `<h3>${esc(item.title)}</h3><p>${esc(item.body)}</p>`).join("")}</div></div>`) +
    sheet(`<div class="policy"><div><span class="mono-label">03</span><h2>Supplier evaluation</h2></div><div><ol class="commitments">${quality.supplierEvaluation
      .map((item) => `<li>${esc(item)}</li>`)
      .join("")}</ol></div></div>`) +
    sheet(`<div class="policy"><div><span class="mono-label">04</span><h2>Site reports</h2></div><div>
      <h3>Weekly report</h3><p>${esc(quality.weeklyReport.intro)}</p>${list(quality.weeklyReport.items, "columns")}
      <h3>Monthly report</h3><p>${esc(quality.monthlyReport.intro)}</p>${list(quality.monthlyReport.items, "columns")}</div></div>`) +
    sheet(`<div class="policy"><div><span class="mono-label">05</span><h2>Electrical inspections</h2></div><div>${list(quality.inspections, "columns")}</div></div>`) +
    sheet(`<div class="policy"><div><span class="mono-label">06</span><h2>EHS Policy</h2></div><div>
      <p>${esc(quality.ehs.intro)}</p><h3>${esc(quality.ehs.committed)}</h3>
      <ol class="commitments">${quality.ehs.commitments.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>
      <p>${esc(quality.ehs.closing)}</p><p class="signature">${esc(quality.ehs.signature)}</p></div></div>`) +
    section(
      "07",
      "EHS standards",
      `<ol class="ehs-standards">${quality.ehsStandards
        .map((item) => `<li><strong>${esc(item.group)}</strong>${item.items.length ? list(item.items) : ""}</li>`)
        .join("")}</ol>`,
    ),
  leadership: () =>
    hero("leadership", "Leadership", "Leadership", `${leadership.name}, ${leadership.title}`) +
    sheet(`<div class="split">${img(leadership.photo.src, leadership.photo.width, leadership.photo.height, leadership.photo.alt, 'class="photo"')}
      <div><p class="chapter-label"><span></span>Established in 1997</p>${leadership.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}<p>${esc(leadership.note)}</p>
      <div class="actions">${link("organisation", "Organisation chart")}</div></div></div>`) +
    sheet(
      dataTable(
        "Key personnel",
        ["Name", "Designation", "Education", "Experience", "Email"],
        leadership.personnel.map((person) => [person.name, person.designation, person.education, person.experience, person.email]),
      ) + `<p class="note">${esc(leadership.personnelNote)}</p>`,
    ) +
    section("Roles", "Responsibilities & authorities", roles()),
  organisation: () => hero("organisation", "Team", "Organisation Chart") + sheet(renderOrgChart(), "sheet-chart"),
  downloads: () =>
    hero("downloads", "Downloads", "Downloads", downloads.intro) +
    sheet(`<ul class="documents">${downloads.documents
      .map(
        (title, index) => `<li><span class="mono-label">PDF / ${chapterNumber(index + 1)}</span><h2>${esc(title)}</h2><p>Available on request by email.</p>
          <a class="text-link" href="mailto:${company.emails[0]}?subject=${encodeURIComponent(title)}">Request by email${arrow}</a></li>`,
      )
      .join("")}</ul><p class="note">${esc(downloads.note)}</p>`),
  contact: () =>
    hero("contact", "Contact", "Contact Us", "", directory()) +
    sheet(`<form class="enquiry" data-enquiry novalidate>
      <h2>Send an enquiry</h2>
      <p class="note">This prepares an email to ${company.emails[0]} in your mail app.</p>
      <div class="fields">
        <label>Your name<input name="name" autocomplete="name" required></label>
        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
        <label>Phone <small>(optional)</small><input name="phone" type="tel" autocomplete="tel"></label>
        <label>Company <small>(optional)</small><input name="company" autocomplete="organization"></label>
        <label class="wide">Tell us about your project<textarea name="message" rows="5" required></textarea></label>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
      <button class="button" type="submit">Prepare email${arrow}</button>
    </form>`),
  "not-found": () =>
    hero("not-found", "404", "Page not found", "This door does not lead anywhere. Every page of the website is listed below.") +
    sheet(`<ul class="year-cards">${routes
      .filter((entry) => entry.id !== "not-found" && !entry.parent)
      .map((entry) => `<li><a href="${href(entry.id)}"><strong>${esc(entry.label)}</strong>${arrow}</a></li>`)
      .join("")}</ul>`),
};

for (const group of projectGroups) {
  const id = groupRoute(group);
  const ongoing = group.slug === "ongoing";
  pageBodies[id] = () =>
    hero(id, "Projects", ongoing ? "On-going projects" : "Projects", ongoing ? `${group.count} projects in progress` : `${group.label} · ${group.count} projects executed`, groupNav(group.slug)) +
    group.sections.map((part) => sheet(projectTable(ongoing ? part.heading : `Projects ${part.heading}`, part.rows, ongoing))).join("");
}

export function renderMain(id: RouteId): string {
  if (id === "home") return home();
  const body = pageBodies[id];
  if (!body) throw new Error(`No page body for ${id}`);
  return `<div class="page" data-page="${id}">${body()}</div>`;
}
