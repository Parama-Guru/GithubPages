import site from "./site.json";

type SourcePage = { id: string; headings: { level: number; text: string }[]; paragraphs: string[]; tables: string[][][] };
type SourceImage = { name: string; file: string; width: number; height: number; label: string };

const pages = site.pages as SourcePage[];
const images = site.images as SourceImage[];

function page(id: string): SourcePage {
  const found = pages.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing source page: ${id}`);
  return found;
}

const home = page("home").paragraphs;
const text = (index: number) => home[index] ?? "";

export type Image = { src: string; width: number; height: number; alt: string };

function image(name: string, alt?: string): Image {
  const found = images.find((entry) => entry.name === name);
  if (!found) throw new Error(`Missing image: ${name}`);
  return { src: found.file.replace(/^\//, ""), width: found.width, height: found.height, alt: alt ?? found.label };
}

export const company = {
  name: "Ganesh Electricals",
  scope: "E.H.V · M.V / L.V",
  summary: text(28),
  about: text(5),
  scopes: home.slice(0, 5),
  address: text(25),
  emails: ["ganeshvar@yahoo.com", "kumareson@ganeshvar.com"],
  phone: text(27),
  phoneHref: "tel:+914442840227",
  footerAddress: text(29),
  logo: image("wganesh3", "Ganesh Electricals"),
};

export const whyUs = {
  title: "Why Choose Us?",
  lead: text(6),
  principles: [
    { title: "Customer-Centric", body: text(7) },
    { title: "Quality & Safety", body: text(8) },
    { title: "Cost-Effective", body: text(9) },
  ],
  statistics: [
    { value: "274", label: text(10) },
    { value: "421", label: text(11) },
    { value: "40,000", label: text(12) },
    { value: "18", label: text(13) },
  ],
};

export const timeline = [
  { year: "2019", title: "New milestone", body: "345 clients, 200000 hours of safety record", date: "11/09/2014" },
  { year: "2007", title: "Awards", body: "Safety award by Cortico", date: "11/09/2014" },
  { year: "2001", title: "New location", body: "First MNC client..", date: "11/09/2014" },
  { year: "1997", title: "Ganesh Electricals started", body: "Founder Kumerason and team", date: "11/09/2014" },
];

export const projectImages = ["slide3", "hd2", "hd3", "hd4", "hd5"].map((name, index) => ({
  ...image(name, home[index]),
  label: home[index] ?? "",
}));

export const clients = {
  lead: text(24),
  logos: images.filter((entry) => entry.name.startsWith("client-")).map((entry) => image(entry.name, entry.label.replace("Client logo / ", ""))),
  testimonials: [0, 1, 2].map((index) => ({
    quote: text(14 + index * 2),
    author: text(15 + index * 2),
    portrait: image(["test-1", "test2", "test3"][index] ?? "test-1", ""),
  })),
};

export type ProjectYear = { slug: string; years: string; tables: { heading: string; rows: string[][] }[] };

export const projectYears: ProjectYear[] = [
  ["project1", "2013-2014", "2013–2014"],
  ["project2", "2014-2016", "2014–2016"],
  ["project3", "2016-2017", "2016–2017"],
  ["project4", "2017-2018", "2017–2018"],
].map(([id, slug, years]) => {
  const source = page(id ?? "");
  const headings = source.headings.filter((heading) => /^\(\d{4}-\d{4}\)$/.test(heading.text));
  return {
    slug: slug ?? "",
    years: years ?? "",
    tables: source.tables.map((rows, index) => ({ heading: `Projects ${headings[index]?.text ?? ""}`.trim(), rows })),
  };
});

const ehs = page("ehs").paragraphs;

export const quality = {
  sections: [
    { title: "Quality Policy", paragraphs: ehs.slice(0, 2) },
    { title: "Quality Standards", paragraphs: ehs.slice(2, 4) },
  ],
  ehs: { intro: ehs[4] ?? "", committed: ehs[5] ?? "", commitments: site.commitments as string[], closing: ehs[6] ?? "" },
};

const founder = page("founder").paragraphs;

export const leadership = {
  name: "Mr. B. Kumareson",
  paragraphs: founder.slice(0, 2),
  photo: image("founder", "Mr. B. Kumareson and industrial equipment"),
};

const downloadsText = page("downloads").paragraphs;

export const downloads = {
  intro: downloadsText[0] ?? "",
  note: downloadsText[1] ?? "",
  documents: ["Overview and detailed profile", "News and Events", "Outreach"],
};

export const newsletter = text(30);
