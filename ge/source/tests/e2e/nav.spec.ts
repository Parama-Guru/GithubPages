import { expect, test, type Page } from "@playwright/test";
import { href, routes } from "../../src/routes/routes";

const headerOrder = ["Home", "About", "How we serve", "Projects", "Clients", "Quality & Safety"];

async function ready(page: Page) {
  await page.waitForFunction(() => ["ready", "static", "idle"].includes(document.querySelector<HTMLElement>(".world")?.dataset.world ?? ""), null, {
    timeout: 60_000,
  });
}

async function canvasData(page: Page) {
  return page.evaluate(() => ({ ...document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset }));
}

async function chapterHold(page: Page, index: number) {
  return page.evaluate((position) => {
    const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
    return chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * 0.32;
  }, index);
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);
const headerLink = (page: Page, name: string) => page.locator(".header-nav").getByRole("link", { name, exact: true });

async function expectCurrent(page: Page, name: string) {
  await expect(page.locator(".header-nav a")).toHaveText(headerOrder);
  await expect(page.locator(".header-nav [aria-current]")).toHaveCount(1);
  await expect(headerLink(page, name)).toHaveAttribute("aria-current", "page");
}

test.describe("header navigation", () => {
  test("no prerendered page shows a breadcrumb trail", async ({ request }) => {
    for (const entry of routes) {
      const response = await request.get(href(entry.id).replace("/GithubPages/ge/", ""));
      expect(response.status(), entry.id).toBe(200);
      const html = await response.text();
      expect(html, entry.id).toContain("<h1");
      expect(html, entry.id).not.toMatch(/aria-label="Breadcrumb"|class="breadcrumbs"/);
    }
  });

  test("Home leads the header and returns to the front of the tour without reloading the 3D world", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    await expectCurrent(page, "Home");
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
    await headerLink(page, "About").click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/about\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ganesh Electricals");
    await expectCurrent(page, "About");
    await expect(page.locator("nav[aria-label='Breadcrumb'], .breadcrumbs")).toHaveCount(0);
    await headerLink(page, "Projects").click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await page.getByRole("link", { name: "On-going" }).first().click();
    await expect(page).toHaveURL(/\/projects\/ongoing\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("On-going projects");
    await expectCurrent(page, "Projects");
    await expect(page.locator("nav[aria-label='Breadcrumb'], .breadcrumbs")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 900));
    await headerLink(page, "Home").click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expectCurrent(page, "Home");
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect.poll(async () => (await canvasData(page)).zone, { timeout: 15_000 }).toBe("approach");
  });

  test("on the home page Home, the logo and the menu rewind the tour to its front", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
    const controls = [
      { name: "Home link", click: () => headerLink(page, "Home").click() },
      { name: "logo", click: () => page.locator(".site-header .brand").click() },
      {
        name: "menu",
        click: async () => {
          await page.getByRole("button", { name: "Menu" }).click();
          await page.locator("#site-menu").getByRole("link", { name: "Home" }).click();
          await expect(page.locator("#site-menu")).toBeHidden();
        },
      },
    ];
    for (const control of controls) {
      await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 4));
      await expect.poll(async () => (await canvasData(page)).zone, { timeout: 15_000 }).toBe("gallery");
      await control.click();
      await expect.poll(() => scrollY(page), { message: control.name, timeout: 10_000 }).toBe(0);
      await expect.poll(async () => (await canvasData(page)).zone, { message: control.name, timeout: 15_000 }).toBe("approach");
      await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    }
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
  });

  test("with reduced motion Home jumps straight back to the top", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 3));
    expect(await scrollY(page)).toBeGreaterThan(0);
    await headerLink(page, "Home").click();
    expect(await scrollY(page)).toBe(0);
    await context.close();
  });

  test("the header fits on one line without overlaps wherever its links are shown", async ({ browser }) => {
    // The header links show from 901 pixels, with and without JavaScript.
    for (const [javaScriptEnabled, widths] of [
      [true, [904, 960, 1023, 1024, 1180, 1181, 1280, 1440, 1920, 2560]],
      [false, [904, 960, 1023]],
    ] as const) {
      const context = await browser.newContext({ reducedMotion: "reduce", javaScriptEnabled });
      const page = await context.newPage();
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of ["", "projects/ongoing/"]) {
          await page.goto(path);
          if (javaScriptEnabled) await ready(page);
          const layout = await page.evaluate(() => {
            const header = document.querySelector<HTMLElement>(".site-header") as HTMLElement;
            const links = [...header.querySelectorAll<HTMLAnchorElement>(".header-nav a")];
            const lines = links.map((link) => {
              const range = document.createRange();
              range.selectNodeContents(link);
              return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
            });
            const controls = [
              header.querySelector(".brand"),
              ...links,
              header.querySelector(".header-contact"),
              header.querySelector(".menu-button"),
            ]
              .map((element) => ({ name: element?.textContent?.trim() || element?.className, rect: element?.getBoundingClientRect() }))
              .filter((control): control is { name: string; rect: DOMRect } => Boolean(control.rect?.width))
              .map(({ name, rect }) => ({ name, left: rect.left, right: rect.right }));
            return { overflow: header.scrollWidth - header.clientWidth, labels: links.map((link) => link.textContent), lines, controls };
          });
          const where = `${path || "home"} at ${width}${javaScriptEnabled ? "" : " without JavaScript"}`;
          expect(layout.overflow, where).toBeLessThanOrEqual(0);
          expect(layout.labels, where).toEqual(headerOrder);
          expect(layout.lines, `link lines, ${where}`).toEqual(headerOrder.map(() => 1));
          expect(layout.controls.length, where).toBeGreaterThanOrEqual(headerOrder.length + 3);
          expect(layout.controls[0]?.left ?? -1, where).toBeGreaterThanOrEqual(0);
          expect(layout.controls.at(-1)?.right ?? Infinity, where).toBeLessThanOrEqual(width);
          layout.controls.slice(1).forEach((control, index) => {
            const previous = layout.controls[index] as (typeof layout.controls)[number];
            expect(control.left - previous.right, `${previous.name} → ${control.name}, ${where}`).toBeGreaterThanOrEqual(12);
          });
        }
      }
      await context.close();
    }
  });
});
