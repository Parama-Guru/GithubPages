import { clients, company, downloads, leadership, projectImages, projectYears, quality, timeline, whyUs } from "@/content";
import { href, route, routes, type RouteId } from "@/routes/routes";
import { chapterNumber, chapters } from "@/timeline/chapters";
import { arrow, arrowUp, esc, img } from "./html";
import { renderOrgChart } from "./orgchart";

const link = (id: RouteId, label: string, kind = "text-link") => `<a class="${kind}" href="${href(id)}">${esc(label)}${kind === "button" ? arrowUp : arrow}</a>`;

function label(index: number, text: string) {
  return `<p class="chapter-label"><span>${chapterNumber(index)}</span>${esc(text)}</p>`;
}

function statistics(compact = false) {
  return `<dl class="stats${compact ? " stats-compact" : ""}">${whyUs.statistics
    .map((stat) => `<div><dt>${esc(stat.label)}</dt><dd data-count="${stat.value.replace(/,/g, "")}" data-final="${esc(stat.value)}">${esc(stat.value)}</dd></div>`)
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

const chapterBodies: Record<string, (index: number) => string> = {
  welcome: () => `
    <p class="chapter-label chapter-label-hero"><span></span>${esc(company.scope)}</p>
    <h1 class="hero-title" data-split><span>Ganesh</span> <span>Electricals</span></h1>
    <p class="chapter-lead">${esc(company.summary)}</p>
    <ul class="tags">${company.scopes.map((scope) => `<li>${esc(scope)}</li>`).join("")}</ul>
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
    ${label(index, "Why choose us")}
    <h2 class="chapter-title" data-split>${esc(whyUs.title)}</h2>
    <p class="chapter-lead">${esc(whyUs.lead)}</p>
    ${statistics(true)}
    <div class="actions">${link("features", "Why choose us")}</div>`,
  projects: (index) => `
    ${label(index, "Projects")}
    <h2 class="chapter-title" data-split>Projects</h2>
    <ul class="tags">${company.scopes.map((scope) => `<li>${esc(scope)}</li>`).join("")}</ul>
    <ul class="year-links">${projectYears.map((year) => `<li><a href="${href(`projects-${year.slug}` as RouteId)}">${year.years}</a></li>`).join("")}</ul>
    <div class="actions">
      <button class="button button-ghost" type="button" data-action="panel" aria-pressed="false">Open a switchgear panel${arrow}</button>
      ${link("projects", "View projects")}
    </div>`,
  clients: (index) => `
    ${label(index, "Clients")}
    <h2 class="chapter-title" data-split>Our Clients</h2>
    <p class="chapter-lead">${esc(clients.lead)}</p>
    ${logos(6)}
    <div class="actions">${link("clients", "All clients and testimonials")}</div>`,
  quality: (index) => `
    ${label(index, "Quality & Safety")}
    <h2 class="chapter-title" data-split>Quality &amp; Safety</h2>
    <p class="chapter-lead">${esc(quality.ehs.intro)}</p>
    <ul class="tags">${["Quality Policy", "Quality Standards", "EHS Policy"].map((item) => `<li>${item}</li>`).join("")}</ul>
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
    body: () => `<p>${esc(company.about)}</p>
      <h3>Timeline</h3>
      <ol class="detail-timeline">${timeline.map((item) => `<li><strong>${item.year}</strong><span>${esc(item.title)}</span><p>${esc(item.body)}</p><time>${item.date}</time></li>`).join("")}</ol>`,
  },
  "why-us": {
    label: "Why choose us",
    title: whyUs.title,
    route: "features",
    body: () => `<p>${esc(whyUs.lead)}</p>${whyUs.principles.map((item) => `<h3>${esc(item.title)}</h3><p>${esc(item.body)}</p>`).join("")}${statistics()}`,
  },
  projects: {
    label: "Projects",
    title: "Projects",
    route: "projects",
    body: () => `<ul class="tags">${company.scopes.map((scope) => `<li>${esc(scope)}</li>`).join("")}</ul>
      <ul class="year-cards">${projectYears
        .map((year) => {
          const count = year.tables.reduce((sum, table) => sum + table.rows.length - 1, 0);
          return `<li><a href="${href(`projects-${year.slug}` as RouteId)}"><strong>${year.years}</strong><span>${count} projects</span>${arrow}</a></li>`;
        })
        .join("")}</ul>`,
  },
  clients: {
    label: "Clients",
    title: "Our Clients",
    route: "clients",
    body: () => `<p>${esc(clients.lead)}</p>${logos()}<h3>Testimonials</h3>${clients.testimonials
      .map((item) => `<blockquote>${esc(item.quote)}<footer>${esc(item.author)}</footer></blockquote>`)
      .join("")}`,
  },
  quality: {
    label: "Quality & Safety",
    title: "Quality & Safety",
    route: "quality-safety",
    body: () =>
      quality.sections.map((section) => `<h3>${esc(section.title)}</h3>${section.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}`).join("") +
      `<h3>EHS Policy</h3><p>${esc(quality.ehs.intro)}</p><p>${esc(quality.ehs.committed)}</p><ol class="commitments">${quality.ehs.commitments
        .map((item) => `<li>${esc(item)}</li>`)
        .join("")}</ol><p>${esc(quality.ehs.closing)}</p>`,
  },
  leadership: {
    label: "Leadership",
    title: "Leadership",
    route: "leadership",
    body: () => `<p class="detail-name">${esc(leadership.name)}</p>${leadership.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}`,
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
          <picture class="chapter-poster" aria-hidden="true"><img src="/GithubPages/ge/posters/${chapter.id}.webp" width="1280" height="800" alt="" loading="lazy" decoding="async"></picture>
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

function yearNav(active?: string) {
  return `<nav class="year-nav" aria-label="Project years"><ul>${projectYears
    .map((year) => `<li><a href="${href(`projects-${year.slug}` as RouteId)}"${year.slug === active ? ' aria-current="page"' : ""}>${year.years}</a></li>`)
    .join("")}</ul></nav>`;
}

function projectTable(heading: string, rows: string[][]) {
  const [head = [], ...body] = rows;
  return `<div class="table-block">
    <h2>${esc(heading)}</h2>
    <div class="table-scroll" role="region" aria-label="${esc(heading)}" tabindex="0">
      <table><thead><tr>${head.map((cell) => `<th scope="col">${esc(cell)}</th>`).join("")}</tr></thead>
      <tbody>${body.map((row) => `<tr>${row.map((cell, index) => `<td data-label="${esc(head[index] ?? "")}">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>
    </div>
  </div>`;
}

const pageBodies: Partial<Record<RouteId, () => string>> = {
  about: () =>
    hero("about", "About", "Ganesh Electricals", company.about) +
    sheet(`<p class="chapter-label"><span></span>Since 1997</p><h2>Timeline</h2>
      <ol class="timeline">${timeline
        .map((item) => `<li><strong>${item.year}</strong><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><time>${item.date}</time></li>`)
        .join("")}</ol>`) +
    sheet(`<p class="sheet-lead">${esc(company.summary)}</p><div class="actions">${link("features", "Why choose us")}${link("organisation", "Organisation chart")}${link("projects", "Projects")}</div>`),
  features: () =>
    hero("features", "Why choose us", whyUs.title, whyUs.lead) +
    sheet(`<div class="principles">${whyUs.principles
      .map((item, index) => `<article><span class="mono-label">${chapterNumber(index + 1)}</span><h2>${esc(item.title)}</h2><p>${esc(item.body)}</p></article>`)
      .join("")}</div>`) +
    sheet(statistics()),
  projects: () =>
    hero("projects", "Projects", "Projects", "", `<ul class="tags">${company.scopes.map((scope) => `<li>${esc(scope)}</li>`).join("")}</ul>`) +
    sheet(`<ul class="gallery">${projectImages
      .map((image) => `<li><figure>${img(image.src, image.width, image.height, image.alt)}<figcaption>${esc(image.label)}</figcaption></figure></li>`)
      .join("")}</ul>`) +
    sheet(`<h2>Projects by year</h2><ul class="year-cards">${projectYears
      .map((year) => {
        const count = year.tables.reduce((sum, table) => sum + table.rows.length - 1, 0);
        return `<li><a href="${href(`projects-${year.slug}` as RouteId)}"><strong>${year.years}</strong><span>${count} projects</span>${arrow}</a></li>`;
      })
      .join("")}</ul>`),
  clients: () =>
    hero("clients", "Clients", "Our Clients", clients.lead) +
    sheet(`<h2 class="visually-hidden">Client logos</h2>${logos()}`) +
    sheet(`<h2>Testimonials</h2><div class="testimonials">${clients.testimonials
      .map(
        (item) =>
          `<figure><blockquote>${esc(item.quote)}</blockquote><figcaption>${img(item.portrait.src, 64, 64, "")}<span>${esc(item.author)}</span></figcaption></figure>`,
      )
      .join("")}</div>`),
  "quality-safety": () =>
    hero("quality-safety", "Quality & Safety", "Quality & Safety", "Quality Policy · Quality Standards · EHS Policy") +
    quality.sections
      .map((section, index) =>
        sheet(`<div class="policy"><div><span class="mono-label">${chapterNumber(index + 1)}</span><h2>${esc(section.title)}</h2></div><div>${section.paragraphs
          .map((text) => `<p>${esc(text)}</p>`)
          .join("")}</div></div>`),
      )
      .join("") +
    sheet(`<div class="policy"><div><span class="mono-label">03</span><h2>EHS Policy</h2></div><div>
      <p>${esc(quality.ehs.intro)}</p><h3>${esc(quality.ehs.committed)}</h3>
      <ol class="commitments">${quality.ehs.commitments.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>
      <p>${esc(quality.ehs.closing)}</p></div></div>`),
  leadership: () =>
    hero("leadership", "Leadership", "Leadership", leadership.name) +
    sheet(`<div class="split">${img(leadership.photo.src, leadership.photo.width, leadership.photo.height, leadership.photo.alt, 'class="photo"')}
      <div><p class="chapter-label"><span></span>Established in 1997</p>${leadership.paragraphs.map((text) => `<p>${esc(text)}</p>`).join("")}
      <div class="actions">${link("organisation", "Organisation chart")}</div></div></div>`),
  organisation: () => hero("organisation", "Team", "Organisation Chart") + sheet(renderOrgChart(), "sheet-chart"),
  downloads: () =>
    hero("downloads", "Downloads", "Downloads", downloads.intro) +
    sheet(`<ul class="documents">${downloads.documents
      .map(
        (title, index) => `<li><span class="mono-label">PDF / ${chapterNumber(index + 1)}</span><h2>${esc(title)}</h2><p>Available on request by email.</p>
          <a class="text-link" href="mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(title)}">Request by email${arrow}</a></li>`,
      )
      .join("")}</ul><p class="note">${esc(downloads.note)}</p>`),
  contact: () =>
    hero("contact", "Contact", "Contact Us", "", directory()) +
    sheet(`<form class="enquiry" data-enquiry novalidate>
      <h2>Send an enquiry</h2>
      <p class="note">This prepares an email to ganeshvar@yahoo.com in your mail app.</p>
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

for (const year of projectYears) {
  const id = `projects-${year.slug}` as RouteId;
  pageBodies[id] = () =>
    hero(id, "Projects", "Projects", year.years, yearNav(year.slug)) + year.tables.map((table) => sheet(projectTable(table.heading, table.rows))).join("");
}

export function renderMain(id: RouteId): string {
  if (id === "home") return home();
  const body = pageBodies[id];
  if (!body) throw new Error(`No page body for ${id}`);
  return `<div class="page" data-page="${id}">${body()}</div>`;
}
