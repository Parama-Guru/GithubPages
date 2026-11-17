import { expect, test, type Browser, type Page } from "@playwright/test";

// Version 2.1 signatures (app/signatures.ts): each page's own effect starts with motion, everything ends in its final
// state once the page has been scrolled, and reduced motion shows the final state at once.
const signatures: [string, string][] = [
  ["about/", ".brand-statement p.is-writing"],
  ["features/", ".principles.is-lamps"],
  ["execution/", ".manpower > div.bar-wait"],
  ["projects/", ".gallery figure.is-parallax"],
  ["projects/ongoing/", ".table-block.is-played"],
  ["projects/2012-2018/", ".table-block.is-played"],
  ["clients/", ".logo-grid.is-played"],
  ["quality-safety/", ".policy.is-read"],
  ["organisation/", ".org-section.is-played"],
  ["downloads/", ".documents.is-played"],
  ["contact/", ".fields.is-played"],
  ["404.html", ".year-cards.is-played"],
];

async function open(browser: Browser, path: string, reducedMotion: "reduce" | "no-preference", viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, reducedMotion });
  await context.addInitScript(() => localStorage.setItem("ge-3d", "off"));
  const page = await context.newPage();
  await page.goto(path);
  await page.waitForFunction(() => document.querySelector<HTMLElement>(".world")?.dataset.world === "static");
  return { context, page };
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 450) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(3200);
}

/** Text and images in the page body that are still faded or moved (an effect that did not finish). */
function unfinished(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main .page .sheet :is(p, li, h2, h3, td, img, .org-box, label, .bw)")]
      .filter((element) => element.getClientRects().length && Number(getComputedStyle(element).opacity) < 0.99)
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
      .slice(0, 5),
  );
}

test.describe("v2.1 page signatures", () => {
  test("every page plays its own effect and ends in its final state", async ({ browser }) => {
    test.setTimeout(300_000);
    for (const [path, marker] of signatures) {
      const { context, page } = await open(browser, path, "no-preference");
      if (marker.includes("is-played")) await page.locator(marker.replace(".is-played", "")).first().scrollIntoViewIfNeeded();
      await expect(page.locator(marker).first(), path).toBeAttached({ timeout: 10_000 });
      await scrollThrough(page);
      expect(await unfinished(page), path).toEqual([]);
      await context.close();
    }
  });

  test("the quality policies keep their titles in view while they are read", async ({ browser }) => {
    const { context, page } = await open(browser, "quality-safety/", "no-preference");
    const title = page.locator(".policy > div:first-child").nth(1);
    await expect(title).toHaveCSS("position", "sticky");
    await context.close();
  });

  test("How We Work: the manpower table is a bar chart whose bars run out to their share of the largest team", async ({ browser }) => {
    // The right inset of each bar's clip, in % of its track: 100 is empty, 0 is the largest team.
    const bars = (page: Page) =>
      page.locator(".manpower").evaluate((grid) =>
        Object.fromEntries(
          [...grid.children].map((cell) => [cell.querySelector("dt")?.textContent ?? "", Number(/inset\(\S+ ([\d.]+)%/.exec(getComputedStyle(cell, "::after").clipPath)?.[1])]),
        ),
      );
    const { context, page } = await open(browser, "execution/", "no-preference");
    const grid = page.locator(".manpower");
    await expect(grid.locator(":scope > div.bar-wait")).toHaveCount(20);
    expect(Object.values(await bars(page)).every((right) => right === 100)).toBe(true);
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3200);
    const grown = await bars(page);
    expect(grown["Helpers"]).toBeCloseTo(0, 1);
    expect(grown["Electricians"]).toBeCloseTo(57.5, 1);
    expect(grown["Project Manager"]).toBeCloseTo(97.5, 1);
    await expect(page.locator(".manpower-scale")).toHaveText("Bars compare each team with the largest: 40 helpers.");
    await context.close();

    // On a phone the chart is taller than the screen: a bar waits until its role is on screen, like its number.
    const phone = await open(browser, "execution/", "no-preference", { width: 390, height: 844 });
    await phone.page.locator(".manpower > div").first().evaluate((cell) => cell.scrollIntoView({ block: "center" }));
    await phone.page.waitForTimeout(2400);
    const partly = await bars(phone.page);
    expect(partly["Project Manager"]).toBeCloseTo(97.5, 1);
    expect(partly["Welders"]).toBe(100);
    await phone.context.close();

    const still = await open(browser, "execution/", "reduce");
    expect((await bars(still.page))["Helpers"]).toBeCloseTo(0, 1);
    expect((await bars(still.page))["Welders"]).toBeCloseTo(75, 1);
    await still.context.close();
  });

  test("reduced motion shows every page's final state at once", async ({ browser }) => {
    for (const path of ["about/", "projects/ongoing/", "organisation/", "clients/"]) {
      const { context, page } = await open(browser, path, "reduce");
      await page.waitForTimeout(600);
      expect(await page.locator(".is-writing, .is-lamps, .bar-wait, .is-parallax, .is-played, .is-read").count(), path).toBe(0);
      expect(await page.locator(".brand-statement .bw").count(), path).toBe(0);
      expect(await unfinished(page), path).toEqual([]);
      await context.close();
    }
  });

  test("the 2D home's scroll effects reach their end", async ({ browser }) => {
    const { context, page } = await open(browser, "", "no-preference");
    await expect(page.locator("#why-us.is-band")).toBeAttached();
    await expect(page.locator(".flat-timeline.is-scrubbed")).toBeAttached();
    await scrollThrough(page);
    const ends = await page.evaluate(() => ({
      band: getComputedStyle(document.querySelector("#why-us")!).getPropertyValue("--band").trim(),
      fill: getComputedStyle(document.querySelector(".flat-timeline")!).getPropertyValue("--fill").trim(),
    }));
    expect(ends).toEqual({ band: "1.000", fill: "1.000" });
    await context.close();
  });
});
