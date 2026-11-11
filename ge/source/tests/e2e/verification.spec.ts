import { expect, test, type Page } from "@playwright/test";

type Metrics = { geometries: number; textures: number; frameMs: number };
type Debug = { __ge: { world(): { metrics(): Metrics; camera: unknown } | null } };

async function ready(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "ready", null, { timeout: 60_000 });
}

async function data(page: Page) {
  return page.evaluate(() => ({ ...document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset }));
}

async function chapterY(page: Page, index: number, local = 0.32) {
  return page.evaluate(
    ([position, fraction]) => {
      const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
      return Math.round(chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * fraction);
    },
    [index, local] as const,
  );
}

async function metrics(page: Page): Promise<Metrics> {
  return page.evaluate(() => (window as unknown as Debug).__ge.world()?.metrics() as Metrics);
}

test.describe("verification", () => {
  test("subjects are framed on screen and never under the text", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("");
      await ready(page);
      for (let index = 1; index < 8; index++) {
        await page.evaluate((y) => window.scrollTo(0, y), await chapterY(page, index));
        await page.waitForTimeout(1600);
        const [x, y] = ((await data(page)).subject ?? "").split(",").map(Number) as [number, number];
        expect(x, `chapter ${index} x at ${viewport.width}`).toBeGreaterThan(0);
        expect(x).toBeLessThan(viewport.width);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(viewport.height);
        const overlaps = await page.evaluate(
          ([px, py, position]) => {
            const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
            return [...chapter.querySelectorAll<HTMLElement>("h2, .chapter-lead, .directory, .stats, .logo-grid")].some((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
            });
          },
          [x, y, index] as const,
        );
        expect(overlaps, `chapter ${index} subject under text at ${viewport.width}`).toBe(false);
      }
    }
  });

  test("memory stays flat over repeated journeys", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const pass = async () => {
      for (let index = 0; index < 8; index++) {
        await page.evaluate((y) => window.scrollTo(0, y), await chapterY(page, index));
        await page.waitForTimeout(900);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1500);
      return metrics(page);
    };
    const first = await pass();
    const second = await pass();
    const third = await pass();
    expect(third.geometries).toBeLessThanOrEqual(second.geometries + 2);
    expect(third.textures).toBeLessThanOrEqual(second.textures + 2);
    expect(second.geometries).toBeLessThanOrEqual(first.geometries + 2);
  });

  test("hash links jump to the right room", async ({ page }) => {
    await page.goto("#clients");
    await ready(page);
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("gallery");
    await page.goto("about/");
    await ready(page);
    await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "/GithubPages/ge/#quality";
      document.querySelector("main")?.append(link);
      link.click();
    });
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("safety");
  });

  test("scrolling during a camera flight leaves no residue", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await page.locator(".header-nav").getByRole("link", { name: "Projects" }).click();
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(3500);
    const y = await page.evaluate(() => window.scrollY);
    const settled = (await data(page)).camera;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await page.evaluate((target) => window.scrollTo(0, target), y);
    await page.waitForTimeout(1500);
    expect((await data(page)).camera).toBe(settled);
    expect((await data(page)).zone).toBe("hall");
  });

  test("first screen is ready within 2.5 s on fast 4G", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
    const started = Date.now();
    await page.goto("", { waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.classList.contains("is-loaded"), null, { timeout: 30_000 });
    const elapsed = Date.now() - started;
    console.log(`fast 4G: 3D ready after ${elapsed} ms`);
    expect(elapsed).toBeLessThanOrEqual(2500);
    await context.close();
  });

  test("sound is off by default and can be switched on", async ({ page }) => {
    await page.goto("");
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.dataset.sound)).toBe("off");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByLabel("Sound").check();
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.documentElement.dataset.sound)).toBe("on");
    await page.getByRole("button", { name: "Enter the facility" }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.lastSound)).toBe("door");
    await page.reload();
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.dataset.sound)).toBe("on");
  });

  test("tapping the doors on a touch screen enters the facility", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await page.waitForTimeout(800);
    const point = await page.evaluate(() => {
      const world = (window as unknown as { __ge: { world(): { camera: { position: { clone(): { set(x: number, y: number, z: number): { project(c: unknown): { x: number; y: number } } } } } } } }).__ge.world();
      const projected = world.camera.position.clone().set(0.6, 1.4, 0.05).project(world.camera);
      return { x: ((projected.x + 1) / 2) * innerWidth, y: ((1 - projected.y) / 2) * innerHeight };
    });
    await page.touchscreen.tap(point.x, point.y);
    await expect.poll(async () => (await data(page)).zone, { timeout: 15_000 }).toBe("lobby");
    await context.close();
  });

  test("records a frame-time sample across the journey", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const samples: number[] = [];
    for (let index = 0; index < 8; index++) {
      await page.evaluate((y) => window.scrollTo(0, y), await chapterY(page, index));
      await page.waitForTimeout(1200);
      samples.push((await metrics(page)).frameMs);
    }
    const average = samples.reduce((a, b) => a + b, 0) / samples.length;
    console.log(`frame time per zone (ms): ${samples.join(", ")} — average ${average.toFixed(1)}`);
    expect(average).toBeLessThan(60);
  });
});
