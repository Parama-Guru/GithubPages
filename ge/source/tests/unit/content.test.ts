import { describe, expect, it } from "vitest";
import { clients, company, credentials, execution, leadership, projectGroups, projectTotals, quality, timeline, whyUs } from "@/content";
import { countNodes, depth, organisation, type OrgNode } from "@/content/organisation";
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

describe("company profile content", () => {
  it("keeps every project row from the profile", () => {
    expect(projectGroups.map((group) => [group.slug, group.count])).toEqual([
      ["ongoing", 10],
      ["2023-2026", 36],
      ["2019-2022", 26],
      ["2012-2018", 60],
    ]);
    expect(projectTotals).toEqual({ executed: 122, ongoing: 10 });
  });
  it("uses the profile statistics, milestones, credentials and contacts", () => {
    expect(whyUs.statistics.map((stat) => stat.value)).toEqual(["230", "122", "10", "95"]);
    expect(whyUs.principles).toHaveLength(6);
    expect(timeline.map((item) => item.year)).toEqual(["2025", "2019", "2008", "1997"]);
    expect(execution.manpowerTotal).toBe(95);
    expect(credentials.map((item) => item.title)).toContain("ESA License");
    expect(company.emails).toEqual(["enquiry@ganeshelectricals.in", "kumareson@ganeshvar.com"]);
    expect(clients.logos).toHaveLength(12);
    expect(quality.ehs.commitments).toHaveLength(9);
    expect(quality.ehsStandards).toHaveLength(24);
    expect(leadership.personnel).toHaveLength(8);
  });
  it("publishes no personal mobile numbers or retired contacts", () => {
    const html = routes.map((entry) => renderMain(entry.id)).join("");
    expect(html).not.toMatch(/(?<![\d+])(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/);
    expect(html).not.toContain("ganeshvar@yahoo.com");
    expect(html).not.toContain("33AFTPK");
  });
  it("reproduces the profile organisation chart", () => {
    expect(countNodes(organisation)).toBe(43);
    expect(depth(organisation)).toBe(8);
    expect(labels(organisation).slice(0, 12)).toEqual([
      "Mr.B.Kumareson Proprietor",
      "Mr.C.Jagan Liasioning TNEB",
      "Mr.G.Saravanan Liasioning CEIG",
      "Mr.S.Krishnan Technical Manager",
      "Mr.P.Pravinkumar Design Engineer",
      "Draftsman (2 Nos)",
      "Mr.K.Senthil Quality",
      "Mr.R.Sethuraman Head Business Development",
      "Mr.Mahaveer Head Finance",
      "Mr.B.Muthukumar Head Projects/Technical",
      "Factory Team",
      "Quality Engineer",
    ]);
    expect(organisation.children).toHaveLength(11);
  });
});