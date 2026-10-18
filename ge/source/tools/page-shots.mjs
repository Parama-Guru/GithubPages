import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const [outArg = ".cache/pages", base = "http://127.0.0.1:4173/GithubPages/ge/", widthArg = "1440", heightArg = "900"] = process.argv.slice(2);
const out = path.resolve(outArg);
const width = Number(widthArg);
const height = Number(heightArg);
await mkdir(out, { recursive: true });
const paths = ["about/", "features/", "projects/", "projects/2014-2016/", "clients/", "quality-safety/", "leadership/", "organisation/", "downloads/", "contact/", "404.html"];
const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined, args: ["--ignore-gpu-blocklist", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(base);
await page.waitForFunction(() => document.querySelector(".world")?.dataset.world === "ready", null, { timeout: 60000 });
for (const target of paths) {
  const name = target.replace(/\W+/g, "-").replace(/-$/, "") || "home";
  await page.evaluate((href) => {
    const link = document.createElement("a");
    link.href = href;
    document.querySelector("main")?.append(link);
    link.click();
  }, `/GithubPages/ge/${target}`);
  await page.waitForTimeout(3200);
  await page.screenshot({ path: path.join(out, `${width}-${name}-a.png`) });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(out, `${width}-${name}-b.png`) });
}
console.log(JSON.stringify({ errors }));
await browser.close();
