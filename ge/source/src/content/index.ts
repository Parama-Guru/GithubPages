import { about, company, newsletter } from "./company";
import { organisation } from "./organisation";
import profile from "./profile.json";
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

export type Image = { src: string; width: number; height: number; alt: string };

function image(name: string, alt?: string): Image {
  const found = images.find((entry) => entry.name === name);
  if (!found) throw new Error(`Missing image: ${name}`);
  return { src: found.file.replace(/^\//, ""), width: found.width, height: found.height, alt: alt ?? found.label };
}

const executed = profile.projects.executed;
const executedCount = executed.reduce((sum, group) => sum + group.rows.length, 0);
const ongoingCount = profile.projects.ongoing.length;

const shortServe = ["Client requirement", "Quality & on-time", "Client protocol", "Statutory norms", "Safety norms", "Zero accidents"];

export const whyUs = {
  title: "How do we serve our clients?",
  lead: about.purpose,
  principles: profile.serve.map((body, index) => ({ title: body, short: shortServe[index] ?? body })),
  statistics: [
    { value: "230", label: "kV — highest substation voltage executed", short: "kV substations" },
    { value: String(executedCount), label: "projects executed since 2012", short: "Projects executed" },
    { value: String(ongoingCount), label: "projects on-going", short: "On-going" },
    { value: "95", label: "people deployed on a typical project", short: "Manpower" },
  ],
};

const gst = (fy: string) => ({ year: fy, title: "GST appreciation", body: `GST certificate of appreciation for FY ${fy}`, date: `FY ${fy}` });

export const timeline = [
  gst("2024–25"),
  gst("2023–24"),
  gst("2022–23"),
  gst("2021–22"),
  { year: "2019", title: "CRISIL MSE 2 rating", body: "High financial strength — high credit worthiness", date: "03/12/2019" },
  { year: "2008", title: "ESA License 283", body: "All electrical works, no limitation in voltage or capacity", date: "29/02/2008" },
  { year: "1997", title: "Ganesh Electricals established", body: "Founded by Mr. B. Kumareson; incorporated / registered on 06/05/1997", date: "06/05/1997" },
];

// For small spaces (the home About chapter, 3D lobby plaques): the four GST appreciations as one entry.
export const milestoneSummary = [
  { year: "2021–25", title: "GST appreciation (4 years)", body: "FY 2021–22 · 2022–23 · 2023–24 · 2024–25" },
  ...timeline.filter((item) => item.title !== "GST appreciation").map(({ year, title, body }) => ({ year, title, body })),
];

// Widths of the smaller copies of the project photos (tools/build-media.mjs) offered through srcset.
const photoCopies = [520, 800] as const;

export const projectImages = ["slide3", "hd2", "hd3", "hd4", "hd5"].map((name, index) => ({
  ...image(name, home[index]),
  label: home[index] ?? "",
  copies: photoCopies,
}));

export type ProjectRow = { client: string; project: string; location: string; sector?: string; value?: string };
export type ProjectGroup = { slug: string; label: string; count: number; sections: { heading: string; rows: ProjectRow[] }[] };

export const projectGroups: ProjectGroup[] = profile.projectGroups.map((group) => {
  const sections =
    group.slug === "ongoing"
      ? [{ heading: "List of on-going projects", rows: profile.projects.ongoing as ProjectRow[] }]
      : group.periods.map((period) => ({ heading: period, rows: (executed.find((entry) => entry.period === period)?.rows ?? []) as ProjectRow[] }));
  return { slug: group.slug, label: group.label, count: sections.reduce((sum, section) => sum + section.rows.length, 0), sections };
});

export const projectTotals = { executed: executedCount, ongoing: ongoingCount };
export const featuredProjects = profile.featuredProjects;

export const clients = {
  lead: "Clients by voltage level, German clients, other sectors and the industrial areas we work in.",
  logos: images.filter((entry) => entry.name.startsWith("client-")).map((entry) => image(entry.name, entry.label.replace("Client logo / ", ""))),
  byVoltage: profile.clients.byVoltage,
  german: profile.clients.german,
  sectors: profile.clients.sectors,
  areas: profile.clients.areas,
};

const ehs = page("ehs").paragraphs;

export const quality = {
  policy: { title: "Quality Policy", paragraphs: ehs.slice(0, 2), signature: "B.Kumareson, Proprietor" },
  standards: { title: "Quality Standards", paragraphs: profile.quality.standards },
  workStandards: [
    { title: "Job-ready start work standards", body: ehs[2] ?? "" },
    { title: "Protection of completed work standards", body: ehs[3] ?? "" },
  ],
  supplierEvaluation: profile.quality.supplierEvaluation,
  weeklyReport: profile.quality.weeklyReport,
  monthlyReport: profile.quality.monthlyReport,
  inspections: profile.quality.inspections,
  ehs: { intro: ehs[4] ?? "", committed: ehs[5] ?? "", commitments: site.commitments as string[], closing: ehs[6] ?? "", signature: "B.Kumareson, Proprietor" },
  ehsStandards: profile.ehsStandards,
};

export const leadership = {
  name: "Mr. B. Kumareson",
  title: "Proprietor",
  paragraphs: [about.founded, about.purpose],
  note: about.note,
  photo: image("founder", "Mr. B. Kumareson and industrial equipment"),
  personnel: profile.personnel,
  personnelNote: profile.personnelNote,
  roles: profile.roles,
};

export const execution = {
  capability: about.capability,
  localIssues: about.localIssues,
  tneb: profile.tnebTimeline,
  manpower: profile.manpower,
  manpowerTotal: profile.manpower.reduce((sum, entry) => sum + entry.count, 0),
  equipment: profile.equipment,
};

export const credentials = profile.credentials;
export const achievements = profile.achievements;

const downloadsText = page("downloads").paragraphs;

export const downloads = {
  intro: downloadsText[0] ?? "",
  note: downloadsText[1] ?? "",
  documents: ["Company profile", "Credentials and certificates"],
};

export { company, newsletter, organisation };
