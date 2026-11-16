import { expect, test, type Browser } from "@playwright/test";

// Desktop sizes from a short laptop browser (1280 × 640) to an ultrawide: the home hero fits the first screen in both
// modes, nothing scrolls sideways, and the footer's links and email address stay on one line.
const sizes = [
  { width: 1024, height: 768 },
  { width: 1280, height: 640 },
  { width: 1366, height: 657 },
  { width: 1920, height: 961 },
  { width: 2560, height: 1305 },
  { width: 3440, height: 1305 },
];

async function open(browser: Browser, path: string, viewport: { width: number; height: number }, threeD: boolean) {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  if (!threeD) await context.addInitScript(() => localStorage.setItem("ge-3d", "off"));
  const page = await context.newPage();
  await page.goto(path);
  return { context, page };
}

test.describe("desktop sizes", () => {
  test("the home hero fits the first screen in both modes", async ({ browser }) => {
    test.setTimeout(240_000);
    for (const viewport of sizes) {
      for (const threeD of [true, false]) {
        const { context, page } = await open(browser, "./", viewport, threeD);
        const states = threeD ? ["loading", "ready"] : ["static"];
        await page.waitForFunction((expected) => expected.includes(document.querySelector<HTMLElement>(".world")?.dataset.world ?? ""), states);
        const measure = () =>
          page.evaluate(() => {
            const visible = (selector: string) =>
              [...document.querySelectorAll(selector)].map((element) => element.getBoundingClientRect()).filter((rect) => rect.height > 0);
            const header = document.querySelector(".site-header")!.getBoundingClientRect().bottom;
            return {
              header: Math.round(header),
              top: Math.round(Math.min(...visible("#welcome .chapter-panel > *").map((rect) => rect.top))),
              bottom: Math.round(Math.max(...visible("#welcome .actions > :is(a, button)").map((rect) => rect.bottom))),
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
          });
        // Wait for the entrance to come to rest (it moves the hero with transforms): two equal measurements in a row.
        let fit = await measure();
        for (let attempt = 0; attempt < 20; attempt++) {
          await page.waitForTimeout(300);
          const next = await measure();
          if (JSON.stringify(next) === JSON.stringify(fit)) break;
          fit = next;
        }
        const label = `${viewport.width}×${viewport.height} ${threeD ? "3D" : "2D"}`;
        expect(fit.top, `${label}: hero below the header`).toBeGreaterThanOrEqual(fit.header);
        expect(fit.bottom, `${label}: buttons on the first screen`).toBeLessThanOrEqual(viewport.height);
        expect(fit.overflow, `${label}: no sideways scrolling`).toBeLessThanOrEqual(0);
        await context.close();
      }
    }
  });

  test("footer links and the email address stay on one line on narrow desktops", async ({ browser }) => {
    for (const width of [1024, 1180, 1280, 1281, 1366]) {
      const { context, page } = await open(browser, "about/", { width, height: 800 }, false);
      const broken = await page.evaluate(() => {
        const lines = (element: Element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
        };
        return [...document.querySelectorAll(".site-footer ul a, .site-footer address a")].filter((link) => lines(link) > 1).map((link) => link.textContent?.trim());
      });
      expect(broken, `footer at ${width} px`).toEqual([]);
      await context.close();
    }
  });
});
