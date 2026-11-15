import { describe, expect, it } from "vitest";
import { href, routes } from "@/routes/routes";
import { renderHead, renderHeader } from "@/ui/layout";
import { renderMain } from "@/ui/pages";

describe("header navigation", () => {
  it("starts with Home before About and marks Home current only on the home page", () => {
    for (const entry of routes) {
      const nav = renderHeader(entry).match(/<nav class="header-nav"[^>]*>(.*?)<\/nav>/s)?.[1] ?? "";
      const links = [...nav.matchAll(/<a href="([^"]+)"( aria-current="page")?>([^<]+)<\/a>/g)];
      expect(
        links.map((link) => link[3]),
        entry.id,
      ).toEqual(["Home", "About", "How we serve", "Projects", "Clients", "Quality &amp; Safety"]);
      expect(links[0]?.[1]).toBe(href("home"));
      expect(Boolean(links[0]?.[2]), entry.id).toBe(entry.id === "home");
    }
  });

  it("shows no breadcrumb trail on any page but keeps the BreadcrumbList data", () => {
    for (const entry of routes) {
      expect(renderMain(entry.id), entry.id).not.toMatch(/breadcrumb/i);
      if (entry.id !== "home") expect(renderHead(entry), entry.id).toContain('"@type":"BreadcrumbList"');
    }
  });
});
