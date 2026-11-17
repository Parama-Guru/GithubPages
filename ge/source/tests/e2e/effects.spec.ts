import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Version 2.1: the WebGL effects, the switchyard's power-up (3D and its HTML button), adaptive resolution and the
// scene pausing behind the menu.

type Debug = { __ge: { world(): { camera: { position: { clone(): { set(x: number, y: number, z: number): { project(c: unknown): { x: number; y: number } } } } } } | null } };

async function ready(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "ready", null, { timeout: 60_000 });
}

async function data(page: Page) {
  return page.evaluate(() => ({ ...document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset }));
}

async function hold(page: Page, index: number) {
  const y = await page.evaluate((position) => {
    const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
    return chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * 0.32;
  }, index);
  await page.evaluate((target) => window.scrollTo(0, target), y);
}

async function screenPoint(page: Page, point: [number, number, number]) {
  return page.evaluate((p) => {
    const world = (window as unknown as Debug).__ge.world();
    if (!world) throw new Error("no world");
    const projected = world.camera.position.clone().set(p[0], p[1], p[2]).project(world.camera);
    return { x: ((projected.x + 1) / 2) * innerWidth, y: ((1 - projected.y) / 2) * innerHeight };
  }, point);
}

test.describe("version 2.1 effects", () => {
  test("the switchyard is energised from the 3D scene and switched off with its button", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 7);
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("yard");
    const button = page.getByRole("button", { name: "Energise the switchyard" });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    expect((await data(page)).energy).toBe("0.00");
    const axe = await new AxeBuilder({ page }).include("[data-hotspot]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations.map((violation) => violation.id)).toEqual([]);
    // The middle breaker pole of the bay.
    const pole = await screenPoint(page, [0, 3.2, -137.2]);
    await page.mouse.move(pole.x, pole.y);
    await expect(page.locator("[data-hover-label]")).toHaveText("Energise the switchyard");
    await page.mouse.click(pole.x, pole.y);
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("1.00");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.dataset.lastSound)).toBe("energise");
    await expect(page.locator("[data-hover-label]")).toHaveText("Switch off the switchyard");
    await button.click();
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("0.00");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => document.documentElement.dataset.lastSound)).toBe("release");
  });

  test("the switchyard's button is reached by keyboard, brings the yard into view and toggles", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const enquiry = page.locator("#contact").getByRole("link", { name: "Send an enquiry" });
    await enquiry.focus();
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", { name: "Energise the switchyard" });
    await expect(button).toBeFocused();
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("yard");
    await expect(button).toBeVisible();
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("1.00");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("0.00");
  });

  test("leaving the home page switches the yard off; the button lives only in the 3D tour", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 7);
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("yard");
    await page.getByRole("button", { name: "Energise the switchyard" }).click();
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("1.00");
    await page.locator(".header-nav").getByRole("link", { name: "Projects" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page.locator("[data-hotspot]")).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __ge: { world(): { metrics(): unknown } | null } }).__ge.world() !== null)).toBe(true);
    await page.goBack();
    await expect.poll(async () => (await data(page)).energy, { timeout: 8_000 }).toBe("0.00");
  });

  test("the 2D site has no scene controls and loads no WebGL", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on("request", (request) => scripts.push(request.url()));
    await page.goto("");
    await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "static");
    await expect(page.locator("[data-hotspot]")).toHaveCount(0);
    expect(scripts.some((url) => /\/(world|network|post)-[\w-]+\.js$/.test(url))).toBe(false);
    await context.close();
  });

  test("every hold stays within the draw-call budget with the effects on, desktop and low tier", async ({ page }) => {
    for (const [query, effects, budget] of [
      ["", "network,particles,shafts,dust", 110],
      ["?tier=low", "network,particles", 70],
    ] as const) {
      await page.goto(query);
      await ready(page);
      expect((await data(page)).effects).toBe(effects);
      for (let index = 0; index < 8; index++) {
        await hold(page, index);
        await page.waitForTimeout(1200);
        const metrics = await data(page);
        expect(Number(metrics.calls), `${query || "desktop"} chapter ${index} (${metrics.zone})`).toBeLessThanOrEqual(budget);
      }
      const scale = Number((await data(page)).scale);
      expect(scale).toBeGreaterThanOrEqual(query ? 0.8 : 0.6);
      expect(scale).toBeLessThanOrEqual(1);
    }
  });

  test("the scene stops drawing behind the full-screen menu and resumes when it closes", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog", { name: "Website menu" })).toBeVisible();
    await page.waitForTimeout(300);
    const covered = Number((await data(page)).frames);
    await page.waitForTimeout(1000);
    expect(Number((await data(page)).frames)).toBe(covered);
    await page.keyboard.press("Escape");
    await expect.poll(async () => Number((await data(page)).frames), { timeout: 5_000 }).toBeGreaterThan(covered);
  });
});
