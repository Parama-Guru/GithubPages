import { expect, test, type Page } from "@playwright/test";

// The 2D site: what visitors see with the 3D experience switched off, reduced motion, or no JavaScript.
const off = () => localStorage.setItem("ge-3d", "off");

async function ready(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "static", null, { timeout: 30_000 });
}

const threeD = /\/(world|three\.[\w]+|post)-[\w-]+\.js$|\/models\/|\/posters\//;

test.describe("2D site", () => {
  test("with 3D switched off: no 3D code, models or posters, the drawings draw and the first visit stays light", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(off);
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    let bytes = 0;
    session.on("Network.loadingFinished", (event) => (bytes += event.encodedDataLength));
    await page.goto("");
    await ready(page);
    await expect(page.locator("html")).not.toHaveClass(/has-3d/);
    await expect(page.locator("html")).toHaveClass(/flat-motion/);
    await expect(page.locator(".flat-hero-art svg")).toBeVisible();
    await expect(page.locator(".flat-hero-art svg")).toHaveClass(/is-drawn/, { timeout: 8_000 });
    await expect(page.locator(".chapter-poster").first()).toBeHidden();
    await expect(page.getByRole("button", { name: "Enter the facility" })).toBeHidden();
    await page.waitForTimeout(1500);
    console.log(`2D first visit: ${(bytes / 1024).toFixed(0)} KiB`);
    expect(bytes).toBeLessThanOrEqual(400 * 1024);
    for (const id of ["about", "why-us", "projects", "clients", "quality", "leadership", "contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    await expect(page.locator(".flat-contact-art svg")).toHaveClass(/is-drawn/, { timeout: 8_000 });
    expect(requests.filter((url) => threeD.test(url))).toEqual([]);
    await context.close();
  });

  test("counters count up to their final figures", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(off);
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    const counters = page.locator("#why-us [data-count]");
    await expect(counters).toHaveCount(4);
    // Below the fold they wait at zero, then run once they come into view.
    await expect(counters.first()).toHaveText("0");
    await page.locator("#why-us").scrollIntoViewIfNeeded();
    for (const counter of await counters.all()) await expect(counter).toHaveText((await counter.getAttribute("data-final")) as string, { timeout: 5_000 });
    await context.close();
  });

  test("reduced motion shows every final state at once", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("");
    await ready(page);
    await expect(page.locator("html")).not.toHaveClass(/flat-motion|has-3d/);
    expect(await page.locator("svg[data-art]").evaluateAll((arts) => arts.every((art) => art.classList.contains("is-drawn")))).toBe(true);
    await page.evaluate(() => window.scrollTo(0, document.getElementById("why-us")?.offsetTop ?? 0));
    for (const counter of await page.locator("#why-us [data-count]").all()) await expect(counter).toHaveText((await counter.getAttribute("data-final")) as string);
    expect(await page.locator("[data-rv], .rv-wait").count()).toBe(0);
    expect(await page.locator(".flat-art .c").first().evaluate((path) => getComputedStyle(path).animationName)).toBe("none");
    await expect(page.locator(".flat-marquee")).not.toHaveClass(/is-running/);
    expect(requests.filter((url) => threeD.test(url))).toEqual([]);
    await context.close();
  });

  test("without JavaScript every chapter and drawing is shown", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("");
    for (const id of ["welcome", "about", "why-us", "projects", "clients", "quality", "leadership", "contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}-title`)).toBeVisible();
      expect(await page.locator(`#${id} :is(.chapter-panel > *, .flat-extra)`).evaluateAll((items) => items.every((item) => Number(getComputedStyle(item).opacity) === 1))).toBe(true);
    }
    await expect(page.locator(".flat-timeline li")).toHaveCount(7);
    await expect(page.locator(".flat-principles li")).toHaveCount(6);
    expect(await page.locator(".flat-hero-art .d").first().evaluate((path) => getComputedStyle(path).strokeDashoffset)).toMatch(/^0(px)?$/);
    await expect(page.locator("#why-us [data-count]").first()).toHaveText("230");
    await page.goto("about/");
    await expect(page.locator(".flat-motif svg")).toBeVisible();
    await expect(page.locator(".timeline li").first()).toBeVisible();
    expect(requests.filter((url) => threeD.test(url))).toEqual([]);
    await context.close();
  });
});
