import { themes } from "@/app/theme";
import {
  achievements,
  clients,
  company,
  credentials,
  downloads,
  execution,
  featuredProjects,
  leadership,
  projectGroups,
  projectImages,
  projectTotals,
  quality,
  timeline,
  whyUs,
  type ProjectGroup,
  type ProjectRow,
} from "@/content";
import { href, route, routes, type RouteId } from "@/routes/routes";
import { chapterNumber, chapters } from "@/timeline/chapters";
import { arrow, arrowUp, esc, img } from "./html";
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
    <dl class="figures">${board.figures.map(([value = "", text = ""]) => `<div><dd>${esc(value)}</dd><dt>${esc(text)}</dt></div>`).join("")}</dl>`;
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
    <p class="chapter-label chapter-label-hero"><span></span>${esc(company.scope)}</p>
    <h1 class="hero-title" data-split><span>Ganesh</span> <span>Electricals</span></h1>
    <p class="chapter-lead">${esc(company.summary)}</p>
    ${tags(company.scopes)}
    <div class="actions">
      <button class="button" type="button" data-action="enter">Enter the facility${arrow}</button>
      ${link("projects", "Explore projects")}
    </div>`,
  about: (index) => `
    ${label(index, "About")}
    <h2 class="chapter-title" data-split>Ganesh Electricals</h2>
    <p class="chapter-lead">${esc(company.about)}</p>
    <ol class="mini-timeline">${timeline.map((item) => `<li><strong>${item.year}</strong><span>${esc(item.title)}</span></li>`).join("")}</ol>
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
    <div class="actions">
      <button class="button button-ghost" type="button" data-action="panel" aria-pressed="false">Open a switchgear panel${arrow}</button>
      ${link("projects", "View projects")}
    </div>`,
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

const more = (id: string) => `<button class="more-button" type="button" data-more="${id}" aria-haspopup="dialog"><span aria-hidden="true">+</span>Read more</button>`;

const details: Record<string, { label: string; title: string; route: RouteId; body: () => string }> = {
  about: {
    label: "About",
    title: "Ganesh Electricals",
    route: "about",
    body: () => `${company.introduction.map((text) => `<p>${esc(text)}</p>`).join("")}
      <h3>Milestones</h3>
      <ol class="detail-timeline">${timeline.map((item) => `<li><strong>${item.year}</strong><span>${esc(item.title)}</span><p>${esc(item.body)}</p><time>${item.date}</time></li>`).join("")}</ol>`,
  },
  "why-us": {
    label: "How we serve",
    title: whyUs.title,
    route: "features",
    body: () => `<p>${esc(whyUs.lead)}</p><ol class="commitments">${whyUs.principles.map((item) => `<li>${esc(item.title)}</li>`).join("")}</ol>${statistics()}`,
  },
  projects: {
    label: "Projects",
    title: "Projects",
    route: "projects",
    body: () => `<p>${esc(company.capability)}</p>${groupCards()}`,
  },
  clients: {
    label: "Clients",
    title: "Our Clients",
    route: "clients",
    body: () => `${logos()}${clients.byVoltage.map((group) => `<h3>${esc(group.level)}</h3>${list(group.clients)}`).join("")}`,
  },
  quality: {
    label: "Quality & Safety",
    title: "Quality & Safety",
    route: "quality-safety",
    body: () =>
      `<h3>${quality.policy.title}</h3>${quality.policy.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}` +
      `<h3>EHS Policy</h3><p>${esc(quality.ehs.intro)}</p><p>${esc(quality.ehs.committed)}</p><ol class="commitments">${quality.ehs.commitments
        .map((item) => `<li>${esc(item)}</li>`)
        .join("")}</ol><p>${esc(quality.ehs.closing)}</p>`,
  },
  leadership: {
    label: "Leadership",
    title: "Leadership",
    route: "leadership",
    body: () => `<p class="detail-name">${esc(leadership.name)}, ${esc(leadership.title)}</p>${leadership.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}<p>${esc(leadership.note)}</p>`,
  },
};

function dialogs() {
  return Object.entries(details)
    .map(
      ([id, detail]) => `<dialog class="detail" id="more-${id}" aria-labelledby="more-${id}-title" data-lenis-prevent>
        <div class="detail-inner">
          <button class="detail-close" type="button" data-close-more aria-label="Close">×</button>
          <p class="chapter-label"><span></span>${esc(detail.label)}</p>
          <h2 id="more-${id}-title">${esc(detail.title)}</h2>
          <div class="detail-body">${detail.body()}</div>
          <div class="actions">${link(detail.route, `Open the ${detail.label} page`)}</div>
        </div>
      </dialog>`,
    )
    .join("");
}

function home() {
  return `<div class="journey" data-journey>
    ${chapters
      .map(
        (chapter, index) => `<section class="chapter" id="${chapter.id}" data-chapter="${chapter.id}" data-zone="${chapter.zone}" aria-labelledby="${chapter.id}-title">
          <div class="chapter-panel">${(chapterBodies[chapter.id] ?? (() => ""))(index)
            .replace(/<h([12]) class="([^"]+)"/, `<h$1 id="${chapter.id}-title" class="$2"`)
            .replace('<div class="actions">', details[chapter.id] ? `<div class="actions">${more(chapter.id)}` : '<div class="actions">')}</div>
          <div class="chapter-poster" aria-hidden="true">${themes.map((theme) => `<img data-poster-theme="${theme.id}" src="/GithubPages/ge/posters/${theme.id}/${chapter.id}.webp" width="1280" height="800" alt="" loading="lazy" decoding="async">`).join("")}</div>
        </section>`,
      )
      .join("")}
    <p class="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><i></i></p>
  </div>
  ${dialogs()}`;
}

function breadcrumbs(id: RouteId) {
  const trail: RouteId[] = ["home"];
  const current = route(id);
  if (current.parent) trail.push(current.parent);
  trail.push(id);
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${trail
    .map((step, index) => (index === trail.length - 1 ? `<li aria-current="page">${esc(route(step).label)}</li>` : `<li><a href="${href(step)}">${esc(route(step).label)}</a></li>`))
    .join("")}</ol></nav>`;
}

function hero(id: RouteId, eyebrow: string, title: string, lead = "", extra = "") {
  return `<header class="page-hero">
    ${breadcrumbs(id)}
    <p class="chapter-label"><span></span>${esc(eyebrow)}</p>
    <h1 class="page-title" data-split>${esc(title)}</h1>
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
    hero("about", "About", "Ganesh Electricals", company.introduction[0]) +
    sheet(`<p class="sheet-lead">${esc(company.about)}</p><p>${esc(company.capability)}</p>
      <div class="split-text"><div><h3>Our purpose</h3><p>${esc(company.purpose)}</p></div><div><h3>Founded in 1997</h3><p>${esc(company.founded)}</p></div></div>`) +
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
      `<dl class="manpower">${execution.manpower.map((item) => `<div><dt>${esc(item.role)}</dt><dd>${item.count}</dd></div>`).join("")}</dl>`,
    ) +
    section("Equipment", "Access equipment on site", tags(execution.equipment)),
  projects: () =>
    hero("projects", "Projects", "Projects", company.capability, tags(company.scopes)) +
    sheet(`<dl class="stats">${[
      { value: String(projectTotals.ongoing), label: "On-going projects" },
      { value: String(projectTotals.executed), label: "Projects executed since 2012" },
      { value: "230", label: "kV — highest substation voltage" },
      { value: "1997", label: "Established" },
    ]
      .map((stat) => `<div><dt>${esc(stat.label)}</dt><dd>${esc(stat.value)}</dd></div>`)
      .join("")}</dl>`) +
    section("Featured", "Substation & electrification projects", featured()) +
    sheet(`<ul class="gallery">${projectImages
      .map((image) => `<li><figure>${img(image.src, image.width, image.height, image.alt)}<figcaption>${esc(image.label)}</figcaption></figure></li>`)
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
