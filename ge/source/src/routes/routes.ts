export type ZoneKey = "approach" | "lobby" | "control" | "hall" | "gallery" | "safety" | "office" | "yard";

export type RouteId =
  | "home"
  | "about"
  | "features"
  | "projects"
  | "projects-2013-2014"
  | "projects-2014-2016"
  | "projects-2016-2017"
  | "projects-2017-2018"
  | "clients"
  | "quality-safety"
  | "leadership"
  | "organisation"
  | "downloads"
  | "contact"
  | "not-found";

export type Route = {
  id: RouteId;
  path: string;
  zone: ZoneKey;
  label: string;
  title: string;
  description: string;
  parent?: RouteId;
};

export const siteUrl = "https://parama-guru.github.io";
export const basePath = "/GithubPages/ge/";

export const routes: Route[] = [
  {
    id: "home",
    path: "",
    zone: "approach",
    label: "Home",
    title: "Ganesh Electricals — EHV and MV/LV electrical contractor, Chennai",
    description: "Ganesh Electricals, established in 1997 in Chennai, provides EHV and MV/LV electrical installations for industrial projects.",
  },
  {
    id: "about",
    path: "about/",
    zone: "lobby",
    label: "About",
    title: "About Ganesh Electricals",
    description:
      "About Ganesh Electricals, an ESA grade electrical contractor in Tamil Nadu established in 1997, executing E.H.V and M.V/L.V installations, with the company timeline.",
  },
  {
    id: "features",
    path: "features/",
    zone: "control",
    label: "Why choose us",
    title: "Why Choose Us — Ganesh Electricals",
    description:
      "Why choose Ganesh Electricals: customer-centric electrical design, quality and safety, and cost-effective solutions, with company statistics.",
  },
  {
    id: "projects",
    path: "projects/",
    zone: "hall",
    label: "Projects",
    title: "Projects — Ganesh Electricals",
    description: "Substation, LT panel, EHV, industrial electrification and power projects by Ganesh Electricals, listed by year from 2013 to 2018.",
  },
  ...(
    [
      ["2013-2014", "2013–2014", "including switchyard works, electrical installations, client names and localities."],
      ["2014-2016", "2014–2016", "for 2014–2015 and 2015–2016, including HT/LT electrical installations and cable laying."],
      ["2016-2017", "2016–2017", "with original electrical installation scopes, client names and localities."],
      ["2017-2018", "2017–2018", "including expansion, HT/LT installation and LT panel supply."],
    ] as const
  ).map(
    ([slug, years, detail]): Route => ({
      id: `projects-${slug}` as RouteId,
      path: `projects/${slug}/`,
      zone: "hall",
      label: `Projects ${years}`,
      title: `Projects ${years} — Ganesh Electricals`,
      description: `Ganesh Electricals' published projects ${detail.startsWith("for") ? detail : `for ${years}, ${detail}`}`,
      parent: "projects",
    }),
  ),
  {
    id: "clients",
    path: "clients/",
    zone: "gallery",
    label: "Clients",
    title: "Our Clients — Ganesh Electricals",
    description: "Clients of Ganesh Electricals, including many Fortune-500 companies, with client logos and testimonials.",
  },
  {
    id: "quality-safety",
    path: "quality-safety/",
    zone: "safety",
    label: "Quality & Safety",
    title: "Quality & Safety — Ganesh Electricals",
    description: "Ganesh Electricals' quality policy, quality standards and environmental, health and safety commitments.",
  },
  {
    id: "leadership",
    path: "leadership/",
    zone: "office",
    label: "Leadership",
    title: "Leadership — Ganesh Electricals",
    description:
      "The founding story of Ganesh Electricals and Mr. B. Kumareson, with the company's mission for quality, safety and industrial electrification.",
  },
  {
    id: "organisation",
    path: "organisation/",
    zone: "office",
    label: "Organisation",
    title: "Organisation Chart — Ganesh Electricals",
    description: "The organisation chart of Ganesh Electricals: technical, projects, procurement, liasioning and civil teams under the founder and CEO.",
  },
  {
    id: "downloads",
    path: "downloads/",
    zone: "office",
    label: "Downloads",
    title: "Downloads — Ganesh Electricals",
    description: "Company profile, news and outreach brochures of Ganesh Electricals. Contact the office to request the brochures.",
  },
  {
    id: "contact",
    path: "contact/",
    zone: "yard",
    label: "Contact",
    title: "Contact Us — Ganesh Electricals",
    description: "Contact Ganesh Electricals at No 1, New Street, Porur, Chennai: telephone 044-4284 0227, email and an enquiry form.",
  },
  {
    id: "not-found",
    path: "404.html",
    zone: "approach",
    label: "Page not found",
    title: "Page not found — Ganesh Electricals",
    description: "The page you are looking for does not exist. Find every Ganesh Electricals page from here.",
  },
];

export const headerLinks: RouteId[] = ["about", "features", "projects", "clients", "quality-safety", "contact"];
export const menuLinks: RouteId[] = ["home", "about", "features", "projects", "clients", "quality-safety", "leadership", "organisation", "downloads", "contact"];

export function route(id: RouteId): Route {
  const found = routes.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown route ${id}`);
  return found;
}

export function href(id: RouteId): string {
  return basePath + route(id).path;
}

export function canonical(id: RouteId): string {
  return siteUrl + href(id);
}

export function matchRoute(pathname: string): Route {
  const relative = decodeURIComponent(pathname).replace(/^.*?\/GithubPages\/ge(\/|$)/, "").replace(/index\.html$/, "");
  const normalised = relative && !relative.endsWith("/") && !relative.endsWith(".html") ? `${relative}/` : relative;
  return routes.find((entry) => entry.path === normalised && entry.id !== "not-found") ?? route("not-found");
}

export const indexableRoutes = routes.filter((entry) => entry.id !== "not-found");
