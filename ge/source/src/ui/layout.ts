import { company, newsletter } from "@/content";
import { basePath, canonical, headerLinks, href, menuLinks, route, siteUrl, type Route, type RouteId } from "@/routes/routes";
import { arrow, arrowUp, esc } from "./html";

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
    telephone: "+91-44-4284-0227",
    address: { "@type": "PostalAddress", streetAddress: "No 1, New Street, Shakthi Nagar, Porur", addressLocality: "Chennai", postalCode: "600116", addressCountry: "IN" },
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

export function renderHeader(current: Route): string {
  return `<header class="site-header" data-header>
    <a class="brand" href="${href("home")}" aria-label="${company.name} — home">
      <img src="${basePath}media/wganesh3.webp" width="799" height="103" alt="${company.name}">
    </a>
    <nav class="header-nav" aria-label="Main">${headerLinks.filter((id) => id !== "contact").map((id) => navLink(id, current)).join("")}</nav>
    <a class="header-contact" href="${href("contact")}"${current.id === "contact" ? ' aria-current="page"' : ""}>Contact${arrowUp}</a>
    <button class="menu-button" type="button" aria-haspopup="dialog" aria-controls="site-menu" data-menu-open><span>Menu</span><i></i><i></i></button>
  </header>`;
}

export function renderMenu(current: Route): string {
  return `<dialog class="site-menu" id="site-menu" aria-label="Website menu">
    <div class="menu-top">
      <img src="${basePath}media/wganesh3.webp" width="799" height="103" alt="${company.name}">
      <button type="button" class="menu-close" data-menu-close>Close<span aria-hidden="true">×</span></button>
    </div>
    <nav aria-label="All pages"><ol class="menu-links">${menuLinks
      .map((id, index) => `<li><a href="${href(id)}"${current.id === id ? ' aria-current="page"' : ""}><span>${String(index).padStart(2, "0")}</span>${esc(route(id).label)}${arrow}</a></li>`)
      .join("")}</ol></nav>
    <div class="menu-prefs">
      <label><input type="checkbox" data-pref="pause"> Pause animation</label>
      <label><input type="checkbox" data-pref="motion"> Reduce motion</label>
      <label><input type="checkbox" data-pref="sound"> Sound</label>
      <label><input type="checkbox" data-pref="3d" checked> 3D experience</label>
    </div>
    <div class="menu-contact"><a href="${company.phoneHref}">${esc(company.phone)}</a><a href="mailto:${company.emails[0]}">${company.emails[0]}</a></div>
  </dialog>`;
}

export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="footer-brand"><img src="${basePath}media/wganesh3.webp" width="799" height="103" alt="${company.name}" loading="lazy"><p>${esc(company.summary)}</p></div>
    <nav aria-label="Footer"><p class="mono-label">Useful Links</p><ul>${menuLinks.map((id) => `<li><a href="${href(id)}">${esc(route(id).label)}</a></li>`).join("")}</ul></nav>
    <div><p class="mono-label">Contact Us</p><address>${esc(company.footerAddress)}</address></div>
    <div><p class="mono-label">Our Newsletter</p><p>${esc(newsletter)}</p><a class="text-link" href="mailto:${company.emails[0]}?subject=Newsletter">Subscribe by email${arrow}</a></div>
    <p class="copyright">© ${year} ${company.name}</p>
  </footer>`;
}
