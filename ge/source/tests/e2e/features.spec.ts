import { expect, test, type Page } from "@playwright/test";

type Debug = { __ge: { world(): { camera: unknown; metrics(): { geometries: number; textures: number } } } };

async function ready(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "ready", null, { timeout: 60_000 });
}

async function data(page: Page) {
  return page.evaluate(() => ({ ...document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset }));
}

async function hold(page: Page, index: number, fraction = 0.32) {
  const y = await page.evaluate(
    ([position, local]) => {
      const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
      return chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * local;
    },
    [index, fraction] as const,
  );
  await page.evaluate((target) => window.scrollTo(0, target), y);
}

async function screenPoint(page: Page, point: [number, number, number]) {
  return page.evaluate((p) => {
    const world = (window as unknown as Debug).__ge.world() as unknown as {
      camera: { position: { clone(): { set(x: number, y: number, z: number): { project(c: unknown): { x: number; y: number } } } } };
    };
    const projected = world.camera.position.clone().set(p[0], p[1], p[2]).project(world.camera);
    return { x: ((projected.x + 1) / 2) * innerWidth, y: ((1 - projected.y) / 2) * innerHeight };
  }, point);
}

test.describe("cinematic features", () => {
  test("stepping through the doors adapts exposure, holds are neutral", async ({ page }) => {
    await page.goto("");
    await ready(page);
    let peak = 1;
    for (const fraction of [0, 0.02, 0.04, 0.06, 0.08, 0.1]) {
      await hold(page, 1, fraction);
      await page.waitForTimeout(500);
      peak = Math.max(peak, Number((await data(page)).exposure));
    }
    expect(peak).toBeGreaterThan(1.1);
    await hold(page, 1);
    await expect.poll(async () => (await data(page)).exposure, { timeout: 8_000 }).toBe("1.00");
  });

  test("scrolling between rooms pulls focus, holds are sharp", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 2);
    await expect.poll(async () => (await data(page)).focus, { timeout: 8_000 }).toBe("0.00");
    await hold(page, 2, 1.4);
    await expect.poll(async () => Number((await data(page)).focus), { timeout: 8_000 }).toBeGreaterThan(0.3);
  });

  test("Read more opens the chapter details and returns focus", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 1);
    const button = page.locator("#about").getByRole("button", { name: "Read more" });
    await expect(button).toBeVisible();
    await button.click();
    const dialog = page.getByRole("dialog", { name: "Ganesh Electricals" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Timeline" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("opening the panel shows its details; closing them closes the panel", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 3);
    await page.getByRole("button", { name: /switchgear panel/ }).click();
    await expect.poll(async () => (await data(page)).panel, { timeout: 8_000 }).toBe("1.00");
    const dialog = page.locator("#more-projects");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /2013–2014/ })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect.poll(async () => (await data(page)).panel, { timeout: 8_000 }).toBe("0.00");
  });

  test("clicking a client lightbox flies it forward and opens the page", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 4);
    await expect.poll(async () => (await data(page)).zone, { timeout: 10_000 }).toBe("gallery");
    await page.waitForTimeout(1500);
    const point = await screenPoint(page, [3.38, 1.9, -70.8]);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator("[data-hover-label]")).toHaveClass(/is-visible/);
    await page.mouse.click(point.x, point.y);
    await expect(page).toHaveURL(/\/clients\/$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Clients");
  });

  test("shows the branded loader when the next room is still loading", async ({ page, context }) => {
    await page.goto("");
    await ready(page);
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: 200_000, uploadThroughput: 100_000 });
    await page.evaluate(() => {
      const curtain = document.querySelector("[data-curtain]");
      new MutationObserver(() => {
        if (curtain?.classList.contains("is-visible")) document.documentElement.dataset.curtainSeen = "yes";
      }).observe(curtain as Element, { attributes: true });
    });
    await page.locator(".header-nav").getByRole("link", { name: "Quality & Safety" }).click();
    await expect(page).toHaveURL(/quality-safety\/$/);
    await expect.poll(async () => (await data(page)).zone, { timeout: 30_000 }).toBe("safety");
    expect(await page.evaluate(() => document.documentElement.dataset.curtainSeen)).toBe("yes");
  });

  test("recovers the 3D world after the graphics context is lost", async ({ page }) => {
    await page.goto("about/");
    await ready(page);
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]");
      (canvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context") as { loseContext(): void } | null)?.loseContext();
    });
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static", { timeout: 5_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await ready(page);
    await expect.poll(async () => (await data(page)).zone, { timeout: 10_000 }).toBe("lobby");
  });
});
