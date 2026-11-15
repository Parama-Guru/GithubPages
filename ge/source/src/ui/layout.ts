import { company, newsletter } from "@/content/company";
import { basePath, canonical, headerLinks, href, menuLinks, route, siteUrl, type Route, type RouteId } from "@/routes/routes";
import { motif } from "./art";
import { arrow, arrowLeft, arrowUp, esc } from "./html";

// The white logo lockup is shown 150–240 px wide: 240 and 480 px copies (tools/build-media.mjs) for 1x and 2x screens.
const logo = (sizes: string, extra = "") =>
  `<img src="${basePath}${company.logo.src}" srcset="${basePath}media/logo-240.webp 240w, ${basePath}media/logo-480.webp 480w, ${basePath}${company.logo.src} ${company.logo.width}w" sizes="${sizes}" width="${company.logo.width}" height="${company.logo.height}" alt="${company.name}"${extra}>`;

export function renderHead(current: Route): string {
  const url = canonical(current.id);
  const image = `${siteUrl}${basePath}og/${current.id === "not-found" ? "home" : current.id}.jpg`;
  const crumbs: RouteId[] = current.id === "home" ? [] : ["home", ...(current.parent ? [current.parent] : []), current.id];
  const organisation = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: siteUrl + basePath,
    logo: `${siteUrl}${basePath}media/wganesh3.webp`,
    foundingDate: "1997",
    email: company.emails[0],
    telephone: company.telephone,
    address: { "@type": "PostalAddress", streetAddress: "No.1, 1st Floor, New Street, Shakthi Nagar, Porur", addressLocality: "Chennai", postalCode: "600116", addressCountry: "IN" },
  };
  const breadcrumb = crumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((id, index) => ({ "@type": "ListItem", position: index + 1, name: route(id).label, item: canonical(id) })),
      }
    : null;
  return `<title>${esc(current.title)}</title>
    <meta name="description" content="${esc(current.description)}">
    ${current.id === "not-found" ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${company.name}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:title" content="${esc(current.title)}">
    <meta property="og:description" content="${esc(current.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(current.title)}">
    <meta name="twitter:description" content="${esc(current.description)}">
    <meta name="twitter:image" content="${image}">
    <script type="application/ld+json" data-seo="organization">${JSON.stringify(organisation)}</script>
    ${breadcrumb ? `<script type="application/ld+json" data-seo="breadcrumb">${JSON.stringify(breadcrumb)}</script>` : ""}`;
}

function navLink(id: RouteId, current: Route) {
  const active = current.id === id || current.parent === id;
  return `<a href="${href(id)}"${active ? ' aria-current="page"' : ""}>${esc(route(id).label)}</a>`;
}

// The original white logo sits on the forest-green header and menu bands (palette in README "Colour palette").
export function renderHeader(current: Route): string {
  return `<header class="site-header" data-header>
    <a class="brand" href="${href("home")}" aria-label="${company.name} — home">
      ${logo("(max-width: 340px) 120px, (max-width: 560px) 150px, (max-width: 900px) 200px, (max-width: 1180px) 180px, 232px")}
    </a>
    <nav class="header-nav" aria-label="Main">${headerLinks.filter((id) => id !== "contact").map((id) => navLink(id, current)).join("")}</nav>
    <a class="header-contact" href="${href("contact")}"${current.id === "contact" ? ' aria-current="page"' : ""}>Contact${arrowUp}</a>
    <button class="menu-button" type="button" aria-haspopup="dialog" aria-controls="site-menu" data-menu-open><span>Menu</span><i></i><i></i></button>
  </header>`;
}

// The menu groups every page; Home and Contact close it as its two direct actions.
const menuGroups: { title: string; links: RouteId[] }[] = [
  { title: "Company", links: ["about", "features", "execution", "leadership", "organisation"] },
  { title: "Work", links: ["projects", "clients", "quality-safety", "downloads"] },
];

function menuLink(id: RouteId, current: Route, index: number, number: number) {
  const state = current.id === id ? ' aria-current="page"' : current.parent === id ? ' aria-current="true"' : "";
  return `<li style="--i:${index}"><a href="${href(id)}"${state}><span class="menu-num">${String(number).padStart(2, "0")}</span><span class="menu-label">${esc(route(id).label)}</span>${arrow}</a></li>`;
}

export function renderMenu(current: Route): string {
  let index = 0;
  let number = 0;
  const groups = menuGroups
    .map(
      (group, position) => `<div class="menu-group">
        <p class="menu-heading" id="menu-group-${position}" style="--i:${index++}">${esc(group.title)}</p>
        <ul aria-labelledby="menu-group-${position}">${group.links.map((id) => menuLink(id, current, index++, ++number)).join("")}</ul>
      </div>`,
    )
    .join("");
  const quick = (id: RouteId, kind: string, icon: string) =>
    `<a class="menu-quick-${kind}" href="${href(id)}"${current.id === id ? ' aria-current="page"' : ""} style="--i:${index++}">${kind === "home" ? icon : ""}<span>${esc(route(id).label)}</span>${kind === "home" ? "" : icon}</a>`;
  return `<dialog class="site-menu" id="site-menu" aria-label="Website menu">
    <div class="menu-top">
      ${logo("(max-width: 900px) 200px, 232px")}
      <button type="button" class="menu-close" data-menu-close>Close<span aria-hidden="true">×</span></button>
    </div>
    <div class="menu-body">
      <nav class="menu-nav" aria-label="All pages">
        <div class="menu-groups">${groups}</div>
        <div class="menu-quick">${quick("home", "home", arrowLeft)}${quick("contact", "contact", arrowUp)}</div>
      </nav>
      <div class="menu-card">
        <div class="menu-art">${motif("tower", "flat-art menu-drawing is-drawn")}</div>
        <p class="menu-since">Since 1997</p>
        <p class="menu-tagline">${esc(company.tagline)}</p>
        <dl class="menu-contact">
          <div><dt>Call</dt><dd><a class="menu-phone" href="${company.phoneHref}">${esc(company.phone)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${company.emails[0]}">${company.emails[0]}</a></dd></div>
          <div class="menu-address"><dt>Visit</dt><dd>${esc(company.address)}</dd></div>
        </dl>
        <div class="menu-pref">
          <label for="menu-3d">3D experience</label>
          <p id="menu-3d-note">With motion and sound. Switch it off for a still, silent site.</p>
          <input class="switch" id="menu-3d" type="checkbox" role="switch" data-pref="3d" checked aria-describedby="menu-3d-note">
        </div>
      </div>
    </div>
  </dialog>`;
}

export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="footer-brand">${logo("240px", ' loading="lazy"')}<p class="footer-signature">Since 1997</p><p>${esc(company.summary)}</p></div>
    <nav aria-label="Footer"><p class="mono-label">Useful Links</p><ul>${menuLinks.map((id) => `<li><a href="${href(id)}">${esc(route(id).label)}</a></li>`).join("")}</ul></nav>
    <div><p class="mono-label">Contact Us</p><address><p>${esc(company.address)}</p><p>Phone: <a href="${company.phoneHref}">${esc(company.phone)}</a></p><p>Email: <a href="mailto:${company.emails[0]}">${company.emails[0]}</a></p></address></div>
    <div><p class="mono-label">Our Newsletter</p><p>${esc(newsletter)}</p><a class="text-link" href="mailto:${company.emails[0]}?subject=Newsletter">Subscribe by email${arrow}</a></div>
    <p class="copyright">© ${year} ${company.name}</p>
  </footer>`;
}
