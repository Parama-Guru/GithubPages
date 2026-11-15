import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

type Scene = { traverse(callback: (object: { material?: { name?: string; color?: { getHexString(): string } } }) => void): void };
type Debug = { __ge: { world(): { scene: Scene } | null } };

const look = JSON.parse(readFileSync("src/world/look.json", "utf8")) as {
  surfaces: Record<string, { color: string }>;
  ink: Record<string, string>;
  models: Record<string, { color: string }>;
};

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

const rgb = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
};
// Named colours of the palette (src/styles/main.css :root, README "Colour palette").
const forest = rgb("#0c3a2b");
const emerald = rgb("#0f5c40");
const terracotta = rgb("#a8492a");
const terracottaDeep = rgb("#96401f");
const marigold = rgb("#e9a23b");

test.describe("colour palette", () => {
  test("one palette: forest bands with the white logo, emerald brand, terracotta figures, marigold highlights", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await expect(page.locator(".theme-switch, .menu-theme, [data-theme-choice]")).toHaveCount(0);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#0c3a2b");
    expect(await page.locator(".site-header").evaluate((header) => getComputedStyle(header).backgroundImage)).toContain(forest);
    await expect(page.locator(".brand img")).toHaveAttribute("src", /\/media\/wganesh3\.webp$/);
    const current = page.locator('.header-nav a[aria-current="page"]');
    await expect(current).toHaveText("Home");
    expect(await current.evaluate((link) => getComputedStyle(link, "::after").backgroundColor)).toBe(marigold);
    await expect(page.locator(".hero-title > :last-child")).toHaveCSS("color", emerald);
    await expect(page.locator(".chapter-label").first()).toHaveCSS("color", terracottaDeep);
    await expect(page.locator(".stats dd").first()).toHaveCSS("color", terracotta);
    await expect(page.locator(".button").first()).toHaveCSS("background-color", emerald);
    await expect(page.locator(".site-footer")).toHaveCSS("background-color", forest);
    await expect(page.locator(".footer-brand img")).toHaveAttribute("src", /\/media\/wganesh3\.webp$/);
    await expect(page.locator(".site-footer .text-link")).toHaveCSS("color", marigold);
    // The route-change emblem on the ivory curtain is the white logo's shape cut in emerald (lossy WebP, so a tolerance).
    const emblem = await page.locator(".route-curtain img").evaluate(async (image: HTMLImageElement) => {
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const opaque: number[][] = [[], [], []];
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] === 255) for (let c = 0; c < 3; c++) opaque[c]!.push(data[i + c]!);
      return opaque.map((channel) => channel.sort((a, b) => a - b)[Math.floor(channel.length / 2)] ?? -99);
    });
    [15, 92, 64].forEach((value, channel) => expect(Math.abs((emblem[channel] ?? -99) - value)).toBeLessThanOrEqual(6));
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator(".menu-top")).toHaveCSS("background-color", forest);
    await expect(page.locator(".menu-top img")).toHaveAttribute("src", /\/media\/wganesh3\.webp$/);
    expect(await page.locator("[data-canvas]").getAttribute("data-theme")).toBeNull();
  });

  test("the 3D world and its Blender models take their colours from the look file", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await expect(page.locator("[data-canvas]")).toHaveAttribute(
      "data-look",
      `${look.surfaces.copper?.color}|${look.ink.accent}|${look.models.PanelEnamel?.color}`,
    );
    await hold(page, 3);
    await expect.poll(async () => page.locator("[data-canvas]").getAttribute("data-zone"), { timeout: 15_000 }).toBe("hall");
    await expect.poll(async () => modelColour(page, "PanelEnamel")).toBe(look.models.PanelEnamel?.color.slice(1));
    expect(await modelColour(page, "Copper")).toBe(look.models.Copper?.color.slice(1));
  });

  test("reduced motion shows the 2D site, which never shows or downloads the 3D posters", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const posters: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/posters/")) posters.push(request.url());
    });
    await page.goto("");
    await page.waitForLoadState("load");
    expect(await page.locator(".chapter-poster img").count()).toBe(8);
    expect(await page.locator(".chapter-poster img:visible").count()).toBe(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect(posters).toEqual([]);
    await expect(page.locator("#why-us")).toHaveCSS("background-color", forest);
    await expect(page.locator("#contact")).toHaveCSS("background-color", emerald);
    await context.close();
  });
});
