import { expect, test, type Page } from "@playwright/test";

async function ready(page: Page) {
  // "idle": a page other than home with 3D on, where the world is not loaded until the way home.
  await page.waitForFunction(() => ["ready", "static", "idle"].includes(document.querySelector<HTMLElement>(".world")?.dataset.world ?? ""), null, {
    timeout: 60_000,
  });
}

async function zone(page: Page) {
  return page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.dataset.zone);
}

async function chapterHold(page: Page, index: number) {
  return page.evaluate((position) => {
    const chapter = document.querySelectorAll<HTMLElement>(".chapter")[position] as HTMLElement;
    return chapter.offsetTop + Math.max(0, chapter.offsetHeight - innerHeight) * 0.32;
  }, index);
}

async function scrollToY(page: Page, y: number) {
  await page.evaluate((target) => window.scrollTo(0, target), y);
}

async function expectScrollNear(page: Page, y: number) {
  await expect.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThanOrEqual(60);
}

async function markCanvas(page: Page) {
  await page.evaluate(() => document.querySelector<HTMLCanvasElement>("[data-canvas]")?.setAttribute("data-marker", "same"));
}

// The restored chapter's text must be fully shown: no faded panel items and no split characters left off their line.
async function expectChapterShown(page: Page, id: string) {
  await expect(page.locator(`#${id}-title`)).toBeInViewport();
  await expect
    .poll(() =>
      page.evaluate((chapter) => {
        const panel = document.querySelector(`#${chapter} .chapter-panel`);
        const faded = [...(panel?.children ?? [])].filter((child) => Number(getComputedStyle(child).opacity) < 0.99);
        const shifted = [...(panel?.querySelectorAll<HTMLElement>(".split-char") ?? [])].filter((char) => {
          const transform = getComputedStyle(char).transform;
          return transform !== "none" && Math.abs(new DOMMatrixReadOnly(transform).m42) > 0.5;
        });
        return faded.length + shifted.length;
      }, id),
    )
    .toBe(0);
}

test.describe("back to the tour", () => {
  test("Back returns to the chapter where the tour was left without reloading the world", async ({ page }) => {
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "ready");
    const hold = await chapterHold(page, 4);
    await scrollToY(page, hold);
    await expect.poll(() => zone(page)).toBe("gallery");
    await page.locator("#clients").getByRole("link", { name: "All clients" }).click();
    await expect(page).toHaveURL(/\/clients\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Clients");
    await markCanvas(page);
    await page.getByRole("link", { name: "Back to the tour: Clients" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, hold);
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expect.poll(() => zone(page)).toBe("gallery");
    await expectChapterShown(page, "clients");
    await expect(page.locator("#clients-title")).toBeFocused();
  });

  test("the browser's Back button returns to the chapter each home visit was left at", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const hold = await chapterHold(page, 4);
    await scrollToY(page, hold);
    await expect.poll(() => zone(page)).toBe("gallery");
    await page.locator("#clients").getByRole("link", { name: "All clients" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Clients");
    await markCanvas(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, hold);
    await expect(page.locator("[data-canvas]")).toHaveAttribute("data-marker", "same");
    await expect.poll(() => zone(page)).toBe("gallery");
    await expectChapterShown(page, "clients");
    const later = await chapterHold(page, 6);
    await scrollToY(page, later);
    await expect.poll(() => zone(page)).toBe("office");
    await page.goForward();
    // The outgoing page holds still while it fades out: the router, not the browser, places the next scroll position.
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - later)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Clients");
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.goBack();
    // Scroll anchoring may nudge the outgoing page by a pixel or two while late images settle; it must not jump.
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - 300)).toBeLessThanOrEqual(2);
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, later);
    await expect.poll(() => zone(page)).toBe("office");
  });

  test("Back still returns to the tour after visiting further pages", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const hold = await chapterHold(page, 2);
    await scrollToY(page, hold);
    await expect.poll(() => zone(page)).toBe("control");
    await page.locator("#why-us").getByRole("link", { name: "How we serve our clients" }).click();
    await expect(page).toHaveURL(/\/features\/$/);
    await page.locator(".header-nav").getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    // The world waits where the tour was left, stopped and hidden, while other pages are open.
    await expect(page.locator(".world")).toHaveCSS("visibility", "hidden");
    expect(await zone(page)).toBe("control");
    await page.getByRole("link", { name: "Back to the tour: How we serve" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, hold);
    await expect.poll(() => zone(page)).toBe("control");
    await expectChapterShown(page, "why-us");
  });

  test("Back opens the tour at the front when no chapter is remembered", async ({ page }) => {
    await page.goto("about/");
    await ready(page);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.getByRole("link", { name: "Back to the start of the tour" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
    await expect.poll(() => zone(page)).toBe("approach");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("the logo and the menu's Home link still open the tour at the front", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const leave = async () => {
      await scrollToY(page, await chapterHold(page, 5));
      await expect.poll(() => zone(page)).toBe("safety");
      await page.locator("#quality .actions").getByRole("link", { name: "Quality & Safety" }).click();
      await expect(page).toHaveURL(/\/quality-safety\/$/);
      await expect(page.getByRole("link", { name: "Back to the tour: Quality & Safety" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 600));
    };
    const atFront = async () => {
      await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
      await expect.poll(() => zone(page)).toBe("approach");
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    };
    await leave();
    await page.locator(".site-header .brand").click();
    await atFront();
    await leave();
    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator("#site-menu").getByRole("link", { name: /Home/ }).click();
    await atFront();
  });

  test("in the static site Back brings the remembered chapter into view", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await expect(page.locator(".world")).toHaveAttribute("data-world", "static");
    const top = await page.evaluate(() => document.getElementById("clients")?.offsetTop ?? 0);
    await scrollToY(page, top);
    await page.locator("#clients").getByRole("link", { name: "All clients" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Clients");
    await page.getByRole("link", { name: "Back to the tour: Clients" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, top);
    await expect(page.locator("#clients")).toBeInViewport();
    await expect(page.locator("#clients-title")).toBeFocused();
    await context.close();
  });

  test("in the animated 2D site (3D switched off) Back returns to the remembered chapter", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => localStorage.setItem("ge-3d", "off"));
    const page = await context.newPage();
    await page.goto("");
    await ready(page);
    await expect(page.locator("html")).toHaveClass(/flat-motion/);
    const top = await page.evaluate(() => document.getElementById("projects")?.offsetTop ?? 0);
    await scrollToY(page, top);
    await page.locator("#projects .actions").getByRole("link", { name: "View projects" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    await expect(page.locator(".page-hero .flat-motif svg")).toBeVisible();
    await page.getByRole("link", { name: "Back to the tour: Projects" }).click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, top);
    await expect(page.locator("#projects-title")).toBeFocused();
    await expectChapterShown(page, "projects");
    await context.close();
  });

  test("Back is reached and activated from the keyboard", async ({ page }) => {
    await page.goto("");
    await ready(page);
    const hold = await chapterHold(page, 3);
    await scrollToY(page, hold);
    await expect.poll(() => zone(page)).toBe("hall");
    await page.locator("#projects .actions").getByRole("link", { name: "View projects" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
    const back = page.getByRole("link", { name: "Back to the tour: Projects" });
    // Focus moves to <main> after a page change, so the first Tab reaches Back.
    await page.keyboard.press("Tab");
    await expect(back).toBeFocused();
    await expect(back).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expectScrollNear(page, hold);
    await expect.poll(() => zone(page)).toBe("hall");
    await expect(page.locator("#projects-title")).toBeFocused();
  });

  test("without JavaScript Back links to the start of the tour", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("projects/2019-2022/");
    const back = page.getByRole("link", { name: "Back to the start of the tour" });
    await expect(back).toHaveAttribute("href", "/GithubPages/ge/");
    await back.click();
    await expect(page).toHaveURL(/\/GithubPages\/ge\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ganesh");
    await context.close();
  });
});
