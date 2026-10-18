import { describe, expect, it } from "vitest";
import { clients, projectYears, quality, timeline, whyUs } from "@/content";
import { countNodes, organisation, type OrgNode } from "@/content/organisation";
import { href, matchRoute, routes } from "@/routes/routes";
import { renderHead } from "@/ui/layout";
import { renderMain } from "@/ui/pages";

function labels(node: OrgNode): string[] {
  return [[node.name, node.role].filter(Boolean).join(" "), ...(node.children ?? []).flatMap(labels)];
}

describe("routes", () => {
  it("uses clean, unique URLs", () => {
    const paths = routes.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of routes) if (entry.id !== "not-found") expect(entry.path === "" || entry.path.endsWith("/")).toBe(true);
    expect(paths.some((path) => /\.html$/.test(path) && path !== "404.html")).toBe(false);
  });
  it("matches every URL form", () => {
    for (const entry of routes.filter((item) => item.id !== "not-found")) {
      expect(matchRoute(href(entry.id)).id).toBe(entry.id);
      expect(matchRoute(href(entry.id).replace(/\/$/, "")).id).toBe(entry.id);
    }
    expect(matchRoute("/GithubPages/ge/index.html").id).toBe("home");
    expect(matchRoute("/GithubPages/ge/nowhere/").id).toBe("not-found");
  });
  it("has unique titles and descriptions of search-friendly length", () => {
    expect(new Set(routes.map((entry) => entry.title)).size).toBe(routes.length);
    for (const entry of routes) {
      expect(entry.description.length, entry.id).toBeGreaterThanOrEqual(70);
      expect(entry.description.length, entry.id).toBeLessThanOrEqual(170);
    }
  });
  it("renders one h1 and full SEO head per page", () => {
    for (const entry of routes) {
      const main = renderMain(entry.id);
      expect(main.match(/<h1[\s>]/g)?.length, entry.id).toBe(1);
      const head = renderHead(entry);
      expect(head).toContain("og:image");
      expect(head).toContain("twitter:card");
      if (entry.id !== "not-found") expect(head).toContain(`rel="canonical" href="https://parama-guru.github.io${href(entry.id)}"`);
    }
  });
});

describe("original content", () => {
  it("keeps all 45 project rows", () => {
    const rows = projectYears.flatMap((year) => year.tables).reduce((sum, table) => sum + table.rows.length - 1, 0);
    expect(rows).toBe(45);
  });
  it("keeps the published statistics, timeline, logos and testimonials", () => {
    expect(whyUs.statistics.map((stat) => stat.value)).toEqual(["274", "421", "40,000", "18"]);
    expect(timeline.map((item) => item.year)).toEqual(["2019", "2007", "2001", "1997"]);
    expect(clients.logos).toHaveLength(12);
    expect(clients.testimonials).toHaveLength(3);
    expect(quality.ehs.commitments).toHaveLength(9);
  });
  it("reproduces the organisation chart exactly", () => {
    expect(countNodes(organisation)).toBe(25);
    expect(labels(organisation)).toEqual([
      "Mr.B.Kumareson Founder/CEO",
      "Mr. Vijaysaradhi Technical",
      "Mr.Mothilal Design Engineer",
      "Mr.Senthil QA",
      "Mr. Muthukumar Projects",
      "Project Coordinator",
      "Site Engineer",
      "Safety Engineer",
      "Supervisors (3)",
      "Technicians (4)",
      "Electricians (5)",
      "Fab Engineer",
      "Welders (3)",
      "Helpers (10)",
      "Project Control",
      "Documentaion/Drawing",
      "Quality Engineer",
      "Account Supervisor",
      "Mr. Elumalai Procurement",
      "Contract",
      "Logistics",
      "Liasioning",
      "Mr. Anandnarayan Liasioning TNEB",
      "Mr. Saravanan Liasioning CEIG",
      "Mr. Subash Civil",
    ]);
  });
});
