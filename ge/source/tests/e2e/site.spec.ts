import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { href, routes } from "../../src/routes/routes";

const zones = ["approach", "lobby", "control", "hall", "gallery", "safety", "office", "yard"];
const pages = routes.filter((entry) => entry.id !== "not-found");

async function ready(page: Page) {
  // "idle": a page other than home with 3D on, where the world is not loaded until the way home. The page script must have
  // started (__ge): the prerendered page says "static" until then, before the world has even begun to load.
  await page.waitForFunction(() => "__ge" in window && ["ready", "static", "idle"].includes(document.querySelector<HTMLElement>(".world")?.dataset.world ?? ""), null, { timeout: 60_000 });
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
      // No "Read more" buttons or chapter detail dialogs: the menu is the only dialog.
      expect(html).not.toMatch(/Read more|data-more|class="detail/);
      expect(html.match(/<dialog[\s>]/g)?.length).toBe(1);
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
      expect(Number(data.calls)).toBeLessThanOrEqual(110);
      expect(Number(data.triangles)).toBeLessThanOrEqual(300_000);
    }
    expect(external).toEqual([]);
  });

  test("only the chapter on screen shows its frosted card", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const cards = () =>
      page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".chapter-panel")].map((panel) => Number(panel.style.getPropertyValue("--card") || "1")));
    // The intro fades the first card in; the cards of the chapters below must not show before their text does.
    await expect.poll(async () => (await cards())[0], { timeout: 8_000 }).toBe(1);
    expect((await cards()).slice(1).filter((value) => value > 0)).toEqual([]);
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 3));
    await expect.poll(async () => (await cards())[3], { timeout: 8_000 }).toBe(1);
    await page.waitForTimeout(800);
    expect((await cards()).map((value, index) => (index === 3 ? 0 : value)).filter((value) => value > 0)).toEqual([]);
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

  test("the switchgear panel opens and closes from the 3D scene", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.evaluate((y) => window.scrollTo(0, y), await chapterHold(page, 3));
    await expect.poll(async () => (await canvasData(page)).zone, { timeout: 10_000 }).toBe("hall");
    await page.waitForTimeout(1500);
    await expect(page.getByRole("button", { name: /switchgear panel/ })).toHaveCount(0);
    const point = await page.evaluate(() => {
      const world = (window as unknown as { __ge: { world(): { camera: { position: { clone(): { set(x: number, y: number, z: number): { project(camera: unknown): { x: number; y: number } } } } } } } }).__ge.world();
      const projected = world.camera.position.clone().set(-3.9, 1.2, -48.5).project(world.camera);
      return { x: ((projected.x + 1) / 2) * innerWidth, y: ((1 - projected.y) / 2) * innerHeight };
    });
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(300);
    await expect(page.locator("[data-hover-label]")).toHaveText("Open the panel");
    await page.mouse.click(point.x, point.y);
    await expect.poll(async () => (await canvasData(page)).panel, { timeout: 8_000 }).toBe("1.00");
    await page.mouse.click(point.x, point.y);
    await expect.poll(async () => (await canvasData(page)).panel, { timeout: 8_000 }).toBe("0.00");
  });

  test("ambient motion always runs; old pause, motion and sound settings are ignored", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ge-pause", "on");
      localStorage.setItem("ge-motion", "reduce");
      localStorage.setItem("ge-sound", "off");
    });
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    expect((await canvasData(page)).motion).toBe("true");
    const before = Number((await canvasData(page)).frames);
    await page.waitForTimeout(1200);
    expect(Number((await canvasData(page)).frames)).toBeGreaterThan(before);
    expect(await page.evaluate(() => document.documentElement.dataset.sound)).toBe("on");
  });
});

test.describe("navigation", () => {
  test("changes page without reloading the 3D world, which waits stopped and hidden until the way home", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
    await page.locator(".header-nav").getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page).toHaveTitle("Projects — Ganesh Electricals");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://parama-guru.github.io/GithubPages/ge/projects/");
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expect(page.locator(".world")).toHaveCSS("visibility", "hidden");
    const parked = Number((await canvasData(page)).frames);
    await page.waitForTimeout(1000);
    expect(Number((await canvasData(page)).frames)).toBe(parked);
    await page.getByRole("link", { name: "2019–2022" }).first().click();
    await expect(page).toHaveURL(/projects\/2019-2022\/$/);
    await expect(page.locator("tbody tr")).toHaveCount(26);
    await page.goBack();
    await expect(page).toHaveURL(/\/projects\/$/);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
    await expect(page.locator(".world")).toHaveCSS("visibility", "visible");
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expect.poll(async () => Number((await canvasData(page)).frames), { timeout: 5_000 }).toBeGreaterThan(parked);
  });

  test("menu: grouped pages, a brand card and the 3D switch, with the keyboard", async ({ page }) => {
    await page.goto("about/");
    await ready(page);
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Website menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("list", { name: "Company" }).getByRole("link")).toHaveText(["01About", "02How We Serve", "03How We Work", "04Leadership", "05Organisation"]);
    await expect(dialog.getByRole("list", { name: "Work" }).getByRole("link")).toHaveText(["06Projects", "07Clients", "08Quality & Safety", "09Downloads"]);
    await expect(dialog.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    await expect(dialog.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "044-22523330" })).toHaveAttribute("href", "tel:+914422523330");
    await expect(dialog.getByRole("link", { name: "kumareson@ganeshelectricals.in" })).toHaveAttribute("href", "mailto:kumareson@ganeshelectricals.in");
    await expect(dialog.getByRole("checkbox")).toHaveCount(0);
    const toggle = dialog.getByRole("switch", { name: "3D experience" });
    await expect(toggle).toHaveCount(1);
    await expect(toggle).toBeChecked();
    await expect(toggle).toHaveAccessibleDescription("With motion and sound. Switch it off for a still, silent site.");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("the menu's switch turns the 3D experience off and on", async ({ page }) => {
    await page.goto("contact/");
    await ready(page);
    await expect(page.locator("html")).toHaveClass(/has-3d/);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("switch", { name: "3D experience" }).click();
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    expect(await page.evaluate(() => localStorage.getItem("ge-3d"))).toBe("off");
    await expect(page.locator("html")).not.toHaveClass(/has-3d/);
    await page.getByRole("button", { name: "Menu" }).click();
    const toggle = page.getByRole("switch", { name: "3D experience" });
    await expect(toggle).not.toBeChecked();
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(page.locator(".world")).toHaveAttribute("data-world", "idle");
    expect(await page.evaluate(() => localStorage.getItem("ge-3d"))).toBe("on");
    await expect(page.locator("html")).toHaveClass(/has-3d/);
  });

  test("organisation chart follows the company profile format", async ({ page }) => {
    await page.goto("organisation/");
    await expect(page.locator(".org-core .org-box")).toHaveCount(13);
    await expect(page.locator(".org-project .org-box")).toHaveCount(34);
    await expect(page.locator(".org-project .org-box-lead")).toHaveCount(4);
    await expect(page.locator(".org-box").first()).toHaveText(/Mr\. B\. Kumareson\s*Proprietor/);
    await expect(page.locator(".org-box").first()).toHaveCSS("background-color", "rgb(15, 92, 64)");
    await expect(page.locator(".org-core > .org-tree > li > ul > li")).toHaveCount(11);
  });

  test("enquiry form validates and prepares an email", async ({ page }) => {
    await page.goto("contact/");
    await page.getByRole("button", { name: "Prepare email" }).click();
    await expect(page.locator(".form-status")).toContainText("Please add");
    await page.getByLabel("Your name").fill("Test");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Tell us about your project").fill("Substation works");
    await page.getByRole("button", { name: "Prepare email" }).click();
    await expect(page.locator(".form-status a")).toHaveAttribute("href", /^mailto:kumareson@ganeshelectricals\.in\?subject=Enquiry/);
  });
});

test.describe("fallbacks and accessibility", () => {
  test("reduced motion shows the 2D site without posters or WebGL", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on("request", (request) => scripts.push(request.url()));
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    await expect(page.locator(".chapter-poster").first()).toBeHidden();
    await expect(page.locator(".flat-hero-art svg")).toBeVisible();
    expect(scripts.some((url) => /\/world-[\w-]+\.js$|\/posters\//.test(url))).toBe(false);
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

  test("2G connections get the static site unless 3D is switched on", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { effectiveType: "2g" }, configurable: true }));
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on("request", (request) => scripts.push(request.url()));
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    expect(scripts.some((url) => /\/world-[\w-]+\.js$/.test(url))).toBe(false);
    await page.evaluate(() => localStorage.setItem("ge-3d", "on"));
    await page.reload();
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    await context.close();
  });

  test("content is usable while the 3D world streams in on a slow connection", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", { offline: false, latency: 300, downloadThroughput: (750 * 1024) / 8, uploadThroughput: (250 * 1024) / 8 });
    await page.goto("", { waitUntil: "commit" });
    await page.waitForFunction(() => "__ge" in window, null, { timeout: 15_000 });
    expect(await page.locator(".world").getAttribute("data-world")).toBe("loading");
    expect((await page.locator(".loader").boundingBox())?.height ?? 0).toBeLessThanOrEqual(4);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".chapter-poster img").first()).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog", { name: "Website menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Website menu" })).toBeHidden();
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready", { timeout: 60_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await context.close();
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("projects/2012-2018/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page.locator("tbody tr")).toHaveCount(60);
    await page.goto("projects/ongoing/");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await page.goto("projects/2013-2014/");
    await expect(page).toHaveURL(/projects\/2012-2018\/$/);
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

  test("has no serious accessibility violations", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const entry of routes) {
      await page.goto(href(entry.id).replace("/GithubPages/ge/", ""));
      await ready(page);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
      expect(serious.map((violation) => `${entry.id}: ${violation.id} ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    }
    await context.close();
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
