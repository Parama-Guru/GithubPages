import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { href, routes } from "../../src/routes/routes";

const zones = ["approach", "lobby", "control", "hall", "gallery", "safety", "office", "yard"];
const pages = routes.filter((entry) => entry.id !== "not-found");

async function ready(page: Page) {
  await page.waitForFunction(() => ["ready", "static"].includes(document.querySelector<HTMLElement>(".world")?.dataset.world ?? ""), null, { timeout: 60_000 });
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

test.describe("prerendered pages", () => {
  for (const entry of routes) {
    test(`${entry.id} is served with content and SEO`, async ({ request }) => {
      const response = await request.get(href(entry.id).replace("/GithubPages/ge/", ""));
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(html).toContain(`<title>${entry.title.replace(/&/g, "&amp;")}</title>`);
      expect(html).toContain('name="description"');
      if (entry.id !== "not-found") expect(html).toContain('rel="canonical"');
      const image = html.match(/property="og:image" content="https:\/\/parama-guru\.github\.io\/GithubPages\/ge\/([^"]+)"/)?.[1];
      expect(image).toBeTruthy();
      expect((await request.get(image as string)).status()).toBe(200);
    });
  }

  test("sitemap lists every page", async ({ request }) => {
    const xml = await (await request.get("sitemap.xml")).text();
    for (const entry of pages) expect(xml).toContain(`https://parama-guru.github.io${href(entry.id)}<`);
  });
});

test.describe("3D journey", () => {
  test("walks through all eight zones within budget and only uses local files", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (!/^(http:\/\/127\.0\.0\.1|blob:|data:)/.test(request.url())) external.push(request.url());
    });
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    for (let index = 0; index < zones.length; index++) {
      await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, index));
      await expect.poll(async () => (await canvasData(page)).zone, { timeout: 15_000 }).toBe(zones[index]);
      const data = await canvasData(page);
      expect(Number(data.calls)).toBeLessThanOrEqual(120);
      expect(Number(data.triangles)).toBeLessThanOrEqual(300_000);
    }
    expect(external).toEqual([]);
  });

  test("scrolling back returns exactly the same camera", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const target = await chapterHold(page, 3);
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(1500);
    const first = (await canvasData(page)).camera;
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 6));
    await page.waitForTimeout(1200);
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 1));
    await page.waitForTimeout(1200);
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(1500);
    expect((await canvasData(page)).camera).toBe(first);
  });

  test("Enter the facility walks through the doors into the lobby", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.getByRole("button", { name: "Enter the facility" }).click();
    await expect.poll(async () => (await canvasData(page)).zone, { timeout: 15_000 }).toBe("lobby");
  });

  test("clicking the doors in 3D enters the facility", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.waitForTimeout(800);
    const point = await page.evaluate(() => {
      const world = (window as unknown as { __ge: { world(): { camera: { position: { clone(): { set(x: number, y: number, z: number): { project(camera: unknown): { x: number; y: number } } } } } } } }).__ge.world();
      const projected = world.camera.position.clone().set(0.6, 1.4, 0.05).project(world.camera);
      return { x: ((projected.x + 1) / 2) * innerWidth, y: ((1 - projected.y) / 2) * innerHeight };
    });
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(300);
    await expect(page.locator("[data-hover-label]")).toHaveText("Enter the facility");
    await page.mouse.click(point.x, point.y);
    await expect.poll(async () => (await canvasData(page)).zone, { timeout: 15_000 }).toBe("lobby");
  });

  test("the switchgear panel opens and closes", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 3));
    const button = page.getByRole("button", { name: /switchgear panel/ });
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => (await canvasData(page)).panel, { timeout: 8_000 }).toBe("1.00");
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await canvasData(page)).panel, { timeout: 8_000 }).toBe("0.00");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("pausing stops ambient rendering", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByLabel("Pause animation").check();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    const before = Number((await canvasData(page)).frames);
    await page.waitForTimeout(1200);
    expect(Number((await canvasData(page)).frames)).toBe(before);
    expect((await canvasData(page)).motion).toBe("false");
  });
});

test.describe("navigation", () => {
  test("changes page without reloading the 3D world", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
    await page.locator(".header-nav").getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page).toHaveTitle("Projects — Ganesh Electricals");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://parama-guru.github.io/GithubPages/ge/projects/");
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expect.poll(async () => (await canvasData(page)).zone, { timeout: 10_000 }).toBe("hall");
    await page.getByRole("link", { name: "2016–2017" }).first().click();
    await expect(page).toHaveURL(/projects\/2016-2017\/$/);
    await expect(page.locator("tbody tr")).toHaveCount(8);
    await page.goBack();
    await expect(page).toHaveURL(/\/projects\/$/);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
  });

  test("colour themes switch live, persist and default to light", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    expect(await page.locator(".site-header").evaluate((header) => getComputedStyle(header).backgroundImage)).toContain("rgb(0, 74, 153)");
    await expect(page.locator(".theme-switch").getByLabel("Light")).toBeChecked();
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
    await page.locator(".theme-switch").getByLabel("Signal").check();
    await expect(html).toHaveAttribute("data-theme", "signal");
    await expect.poll(async () => (await canvasData(page)).theme).toBe("signal");
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await page.locator(".theme-switch").getByLabel("Copper").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator(".menu-theme").getByLabel("Light")).toBeChecked();
    await page.locator(".menu-theme").getByLabel("Copper").click();
    await expect(html).toHaveAttribute("data-theme", "copper");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#06090d");
    await page.locator("#site-menu").getByRole("link", { name: /Projects/ }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator(".theme-switch").getByLabel("Copper")).toBeChecked();
    await page.reload();
    await ready(page);
    await expect(html).toHaveAttribute("data-theme", "copper");
    expect((await canvasData(page)).theme).toBe("copper");
  });

  test("menu works with the keyboard", async ({ page }) => {
    await page.goto("about/");
    await ready(page);
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Website menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Website menu" })).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("organisation chart follows the published format", async ({ page }) => {
    await page.goto("organisation/");
    await expect(page.locator(".org-box")).toHaveCount(25);
    await expect(page.locator(".org-box").first()).toHaveText(/Mr\.B\.Kumareson\s*Founder\/CEO/);
    await expect(page.locator(".org-box").first()).toHaveCSS("background-color", "rgb(47, 119, 179)");
    await expect(page.locator(".org-chart > ul > li > ul > li")).toHaveCount(5);
  });

  test("enquiry form validates and prepares an email", async ({ page }) => {
    await page.goto("contact/");
    await page.getByRole("button", { name: "Prepare email" }).click();
    await expect(page.locator(".form-status")).toContainText("Please add");
    await page.getByLabel("Your name").fill("Test");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Tell us about your project").fill("Substation works");
    await page.getByRole("button", { name: "Prepare email" }).click();
    await expect(page.locator(".form-status a")).toHaveAttribute("href", /^mailto:ganeshvar@yahoo\.com\?subject=Enquiry/);
  });
});

test.describe("fallbacks and accessibility", () => {
  test("reduced motion shows rendered posters without WebGL", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on("request", (request) => scripts.push(request.url()));
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    const poster = page.locator(".chapter-poster img").first();
    await expect(poster).toBeVisible();
    expect(await poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(scripts.some((url) => /\/world-[\w-]+\.js$/.test(url))).toBe(false);
    await context.close();
  });

  test("WebGL failure keeps every message available", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === "webgl2" || type === "webgl") return null;
        return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof original;
    });
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    await expect(page.getByRole("heading", { name: "Contact Us" })).toBeAttached();
    await context.close();
  });

  test("Data Saver skips the 3D download", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    await context.close();
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("projects/2013-2014/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page.locator("tbody tr")).toHaveCount(13);
    await expect(page.getByRole("link", { name: "Contact" }).first()).toBeVisible();
    await context.close();
  });

  test("no horizontal overflow from 320 to 2560 pixels", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const width of [320, 390, 768, 1024, 1280, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      for (const entry of routes) {
        await page.goto(href(entry.id).replace("/GithubPages/ge/", ""));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        expect(overflow, `${entry.id} at ${width}`).toBeLessThanOrEqual(0);
      }
    }
    await context.close();
  });

  test("has no serious accessibility violations in any theme", async ({ browser }) => {
    for (const theme of ["light", "copper", "signal"]) {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.addInitScript((value) => localStorage.setItem("ge-theme", value), theme);
      const page = await context.newPage();
      for (const entry of routes) {
        await page.goto(href(entry.id).replace("/GithubPages/ge/", ""));
        await ready(page);
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        const serious = result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
        expect(serious.map((violation) => `${theme} ${entry.id}: ${violation.id} ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
      }
      await context.close();
    }
  });

  test("first visit stays within the transfer budget", async ({ browser }) => {
    for (const [name, viewport, limit, isMobile] of [
      ["desktop", { width: 1440, height: 900 }, 2.5 * 1024 * 1024, false],
      ["phone", { width: 390, height: 844 }, 1.5 * 1024 * 1024, true],
    ] as const) {
      const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      await session.send("Network.enable");
      let bytes = 0;
      session.on("Network.loadingFinished", (event) => (bytes += event.encodedDataLength));
      await page.goto("");
      await ready(page);
      await page.waitForTimeout(1500);
      console.log(`${name} first visit: ${(bytes / 1024).toFixed(0)} KiB`);
      expect(bytes, name).toBeLessThanOrEqual(limit);
      await context.close();
    }
  });
});
