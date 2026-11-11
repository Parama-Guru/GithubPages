import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const out = path.resolve(args[0] ?? ".cache/shots");
const base = args[1] ?? "http://127.0.0.1:4173/GithubPages/ge/";
const width = Number(args[2] ?? 1440);
const height = Number(args[3] ?? 900);
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined, args: ["--ignore-gpu-blocklist", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForFunction(() => ["ready", "static"].includes(document.querySelector(".world")?.dataset.world ?? ""), null, { timeout: 60000 });
await page.waitForTimeout(3000);
const chapters = await page.evaluate(() => [...document.querySelectorAll(".chapter")].map((chapter) => ({ id: chapter.id, top: chapter.offsetTop, height: chapter.offsetHeight })));
const vh = height;
const shots = [];
for (const chapter of chapters) {
  for (const [suffix, fraction] of [
    ["hold", 0.3],
    ["travel", 0.78],
  ]) {
    const y = chapter.top + (chapter.height - vh) * (suffix === "hold" ? fraction : 1) + (suffix === "travel" ? vh * 0.45 : 0);
    await page.evaluate((target) => window.scrollTo(0, target), Math.round(y));
    await page.waitForTimeout(2200);
    const file = path.join(out, `${width}-${chapter.id}-${suffix}.png`);
    await page.screenshot({ path: file });
    const metrics = await page.evaluate(() => ({ ...document.querySelector("[data-canvas]")?.dataset }));
    shots.push({ file: path.basename(file), calls: metrics.calls, triangles: metrics.triangles, zone: metrics.zone });
  }
}
console.log(JSON.stringify({ shots, errors }, null, 1));
await browser.close();
