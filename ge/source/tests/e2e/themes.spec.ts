import { expect, test, type Page } from "@playwright/test";

type Scene = { traverse(callback: (object: { material?: { name?: string; color?: { getHexString(): string } } }) => void): void };
type Debug = { __ge: { world(): { scene: Scene } | null } };

async function ready(page: Page) {
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "ready", null, { timeout: 60_000 });
}

async function hold(page: Page, index: number) {
  const y = await page.evaluate((position) => {
    const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
    return chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * 0.32;
  }, index);
  await page.evaluate((target) => window.scrollTo(0, target), y);
}

async function modelColour(page: Page, name: string) {
  return page.evaluate((material) => {
    let found = "";
    (window as unknown as Debug).__ge.world()?.scene.traverse((object) => {
      if (!found && object.material?.name === material) found = object.material.color?.getHexString() ?? "";
    });
    return found;
  }, name);
}

async function sceneColour(page: Page) {
  const shot = await page.screenshot({ clip: { x: 900, y: 200, width: 400, height: 400 } });
  return page.evaluate(async (data) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i] ?? 0;
      g += pixels[i + 1] ?? 0;
      b += pixels[i + 2] ?? 0;
    }
    const count = pixels.length / 4;
    return { r: r / count, g: g / count, b: b / count };
  }, shot.toString("base64"));
}

test.describe("whole-scene colour themes", () => {
  test("switching theme recolours rooms, trims, signs and Blender models live", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await hold(page, 3);
    await expect.poll(async () => page.locator("[data-canvas]").getAttribute("data-zone"), { timeout: 15_000 }).toBe("hall");
    await page.waitForTimeout(1200);
    const results: Record<string, { look: string | null; enamel: string; colour: { r: number; g: number; b: number } }> = {};
    for (const theme of ["light", "copper", "signal"]) {
      await page.locator(".theme-switch").getByLabel(new RegExp(`^${theme}$`, "i")).check();
      await expect.poll(async () => page.locator("[data-canvas]").getAttribute("data-theme")).toBe(theme);
      await page.waitForTimeout(900);
      results[theme] = { look: await page.locator("[data-canvas]").getAttribute("data-look"), enamel: await modelColour(page, "PanelEnamel"), colour: await sceneColour(page) };
    }
    expect(new Set(Object.values(results).map((result) => result.look)).size).toBe(3);
    expect(results.light?.enamel).toBe("d9dfe5");
    expect(results.copper?.enamel).toBe("959ba0");
    expect(results.signal?.enamel).toBe("2c7072");
    const brightness = (c: { r: number; g: number; b: number }) => (c.r + c.g + c.b) / 3;
    expect(brightness(results.light!.colour)).toBeGreaterThan(brightness(results.copper!.colour) + 60);
    const signal = results.signal!.colour;
    expect(signal.g).toBeGreaterThan(signal.r + 8);
    const copper = results.copper!.colour;
    expect(Math.abs(copper.g - copper.r)).toBeLessThan(Math.abs(signal.g - signal.r));
  });

  test("fallback posters follow the chosen theme", async ({ browser }) => {
    for (const theme of ["light", "copper", "signal"]) {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.addInitScript((value) => localStorage.setItem("ge-theme", value), theme);
      const page = await context.newPage();
      await page.goto("");
      const visible = page.locator(".chapter-poster img:visible").first();
      await expect(visible).toHaveAttribute("src", new RegExp(`/posters/${theme}/welcome\\.webp$`));
      expect(await visible.evaluate((image: HTMLImageElement) => image.decode().then(() => image.naturalWidth))).toBeGreaterThan(0);
      expect(await page.locator(".chapter-poster img:visible").count()).toBe(8);
      await context.close();
    }
  });
});
