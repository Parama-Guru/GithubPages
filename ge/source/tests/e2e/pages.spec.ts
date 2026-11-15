import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

// Every page but home is one design in both modes: the 3D world is neither shown nor loaded there.
const world = /\/world-[\w-]+\.js$/;

async function settled(page: Page, state: string) {
  await page.waitForFunction((expected) => document.querySelector<HTMLElement>(".world")?.dataset.world === expected, state, { timeout: 60_000 });
}

async function visit(browser: Browser, path: string, threeD: boolean, viewport = { width: 1440, height: 900 }) {
  // With motion, as reduced motion always shows the 2D site.
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  if (!threeD) await context.addInitScript(() => localStorage.setItem("ge-3d", "off"));
  const page = await context.newPage();
  await page.goto(path);
  return { context, page };
}

// The boxes of the elements that make a page's layout, rounded to the pixel.
async function layout(page: Page) {
  return page.evaluate(() =>
    [".back-link", ".page-hero .chapter-label", "h1", ".page-hero .chapter-lead", ".flat-motif", ".sheet", ".sheet h2", ".site-footer"].map((selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return { selector, box: rect ? [rect.x, rect.y, rect.width, rect.height].map(Math.round) : null };
    }),
  );
}

test.describe("pages in both modes", () => {
  test("every page but home looks the same with 3D on and off", async ({ browser }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      for (const path of ["about/", "projects/", "clients/", "contact/"]) {
        const on = await visit(browser, path, true, viewport);
        const off = await visit(browser, path, false, viewport);
        await settled(on.page, "idle");
        await settled(off.page, "static");
        await expect(on.page.locator("html")).toHaveClass(/has-3d/);
        // No frosted card, veil or scene behind the page.
        expect(await on.page.locator(".page-hero").evaluate((hero) => getComputedStyle(hero, "::before").content)).toBe("none");
        await expect(on.page.locator(".world")).toHaveCSS("visibility", "hidden");
        const [a, b] = [await layout(on.page), await layout(off.page)];
        a.forEach((entry, index) => {
          const other = b[index]?.box;
          expect(Boolean(entry.box), `${entry.selector} on ${path}`).toBe(Boolean(other));
          entry.box?.forEach((value, axis) => expect(Math.abs(value - (other?.[axis] ?? 0)), `${entry.selector} on ${path} at ${viewport.width}`).toBeLessThanOrEqual(2));
        });
        await on.context.close();
        await off.context.close();
      }
    }
  });

  test("entering on a page with 3D on loads no 3D code; the way home boots the world", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("projects/");
    await settled(page, "idle");
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    expect(requests.filter((url) => world.test(url) || url.includes("/models/") || url.includes("/posters/"))).toEqual([]);
    await page.getByRole("link", { name: "Back to the start of the tour" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await settled(page, "ready");
    expect(requests.some((url) => world.test(url))).toBe(true);
    await expect(page.locator(".world")).toHaveCSS("visibility", "visible");
    await expect.poll(() => page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset.zone)).toBe("approach");
  });

  test("page changes run without long tasks and every page enters in sequence", async ({ page }) => {
    await page.goto("about/");
    await settled(page, "idle");
    await page.evaluate(() => {
      const longest: number[] = [];
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => longest.push(entry.duration))).observe({ type: "longtask" });
      Object.assign(window, { __long: longest });
    });
    for (const [link, heading] of [
      ["Projects", "Projects"],
      ["Clients", "Our Clients"],
      ["Quality & Safety", "Quality & Safety"],
      ["About", "Powering Infrastructure. Engineering Reliability. Building Trust."],
    ]) {
      await page.locator(".header-nav").getByRole("link", { name: link, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading as string);
      await expect(page.locator("main")).toHaveClass(/is-entering/);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await expect(page.locator("main")).toBeFocused();
      // The title's words rise out of their masks and come to rest.
      await expect
        .poll(() => page.locator(".page-title .w > span").evaluateAll((words) => words.every((word) => getComputedStyle(word).transform === "none")))
        .toBe(true);
      await page.waitForTimeout(300);
    }
    const long = await page.evaluate(() => (window as unknown as { __long: number[] }).__long);
    console.log(`page-change long tasks (ms): ${long.map(Math.round).join(", ") || "none"}`);
    expect(Math.max(0, ...long)).toBeLessThan(120);
  });

  test("the open menu has no serious accessibility violations", async ({ browser }) => {
    for (const threeD of [true, false]) {
      const { context, page } = await visit(browser, "leadership/", threeD);
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(page.getByRole("dialog", { name: "Website menu" })).toBeVisible();
      // Let the opening animation finish, so contrast is measured on the final colours.
      await page.waitForTimeout(2000);
      const result = await new AxeBuilder({ page }).include("#site-menu").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
      expect(serious.map((violation) => `${violation.id} ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
      await context.close();
    }
  });

  test("on a phone the menu's call, email and 3D switch are on the first screen", async ({ browser }) => {
    const { context, page } = await visit(browser, "clients/", true, { width: 390, height: 844 });
    await page.getByRole("button", { name: "Menu" }).click();
    await page.waitForTimeout(1500);
    const menu = page.locator("#site-menu");
    for (const target of [menu.getByRole("link", { name: "044-22523330" }), menu.getByRole("link", { name: "kumareson@ganeshelectricals.in" }), menu.getByRole("switch", { name: "3D experience" }), menu.getByRole("link", { name: "Downloads" })]) {
      await expect(target).toBeInViewport({ ratio: 1 });
    }
    await context.close();
  });
});
