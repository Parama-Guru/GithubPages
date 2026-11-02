export type ZoneKey = "approach" | "lobby" | "control" | "hall" | "gallery" | "safety" | "office" | "yard";

export type RouteId =
  | "home"
  | "about"
  | "features"
  | "projects"
  | "projects-ongoing"
  | "projects-2023-2026"
  | "projects-2019-2022"
  | "projects-2012-2018"
  | "execution"
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
    description: "Ganesh Electricals, established in 1997 in Chennai, executes 230 kV and 110 kV substations and turnkey industrial electrical installations.",
  },
  {
    id: "about",
    path: "about/",
    zone: "lobby",
    label: "About",
    title: "About Ganesh Electricals",
    description:
      "About Ganesh Electricals, established in 1997: ESA licence 283, CRISIL MSE 2 rating, credentials, achievements and milestones of a turnkey electrical contractor.",
  },
  {
    id: "features",
    path: "features/",
    zone: "control",
    label: "How we serve",
    title: "How We Serve Our Clients — Ganesh Electricals",
    description:
      "How Ganesh Electricals serves its clients: meeting requirements, quality and on-time delivery, client protocol, statutory and safety norms, and zero accidents.",
  },
  {
    id: "execution",
    path: "execution/",
    zone: "control",
    label: "How we work",
    title: "How We Work — Ganesh Electricals",
    description:
      "How Ganesh Electricals executes projects: local issue handling, TNEB liaisoning in 211 days, manpower deployment of 95 people per project and specialist equipment.",
  },
  {
    id: "projects",
    path: "projects/",
    zone: "hall",
    label: "Projects",
    title: "Projects — Ganesh Electricals",
    description: "230 kV and 110 kV substation and industrial electrification projects by Ganesh Electricals: on-going projects and projects executed since 2012.",
  },
  ...(
    [
      ["ongoing", "On-going", "On-going projects", "with sector and order value, including 110 kV switchyards and industrial installations."],
      ["2023-2026", "2023–2026", "Projects 2023–2026", "executed from 2023 to 2026, including 110 kV switchyards and HT/LT electrical installations."],
      ["2019-2022", "2019–2022", "Projects 2019–2022", "executed from 2019 to 2022, including substations, HT/LT installations and panels."],
      ["2012-2018", "2012–2018", "Projects 2012–2018", "executed from 2012 to 2018, including switchyard works, HT/LT installations and cable laying."],
    ] as const
  ).map(
    ([slug, years, label, detail]): Route => ({
      id: `projects-${slug}` as RouteId,
      path: `projects/${slug}/`,
      zone: "hall",
      label,
      title: `${label} — Ganesh Electricals`,
      description: `Ganesh Electricals' ${slug === "ongoing" ? "on-going projects" : `projects ${years}`}: client names, scopes and locations ${detail}`,
      parent: "projects",
    }),
  ),
  {
    id: "clients",
    path: "clients/",
    zone: "gallery",
    label: "Clients",
    title: "Our Clients — Ganesh Electricals",
    description: "Clients of Ganesh Electricals by voltage level — 230 kV, 110 kV, 33 kV and 11 kV — German clients, garments, leather and pharmaceutical industries.",
  },
  {
    id: "quality-safety",
    path: "quality-safety/",
    zone: "safety",
    label: "Quality & Safety",
    title: "Quality & Safety — Ganesh Electricals",
    description: "Ganesh Electricals' quality policy and standards, supplier evaluation, site reports, electrical inspections and EHS standards.",
  },
  {
    id: "leadership",
    path: "leadership/",
    zone: "office",
    label: "Leadership",
    title: "Leadership — Ganesh Electricals",
    description:
      "Mr. B. Kumareson, Proprietor of Ganesh Electricals, the key personnel and their roles, responsibilities and authorities.",
  },
  {
    id: "organisation",
    path: "organisation/",
    zone: "office",
    label: "Organisation",
    title: "Organisation Chart — Ganesh Electricals",
    description: "The organisation chart of Ganesh Electricals: liasioning, design, quality, projects, procurement, civil and administration teams under the Proprietor.",
  },
  {
    id: "downloads",
    path: "downloads/",
    zone: "office",
    label: "Downloads",
    title: "Downloads — Ganesh Electricals",
    description: "The Ganesh Electricals company profile and credentials, available on request by email.",
  },
  {
    id: "contact",
    path: "contact/",
    zone: "yard",
    label: "Contact",
    title: "Contact Us — Ganesh Electricals",
    description: "Contact Ganesh Electricals at No.1, New Street, Shakthi Nagar, Porur, Chennai 600 116: telephone 044-4284 0227, email and an enquiry form.",
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
export const menuLinks: RouteId[] = ["home", "about", "features", "execution", "projects", "clients", "quality-safety", "leadership", "organisation", "downloads", "contact"];

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
