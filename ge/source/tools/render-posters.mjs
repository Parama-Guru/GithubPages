import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const base = process.argv[2] ?? "http://127.0.0.1:4173/GithubPages/ge/";
const chapters = ["welcome", "about", "why-us", "projects", "clients", "quality", "leadership", "contact"];
const holds = [0.36, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.6].map((local, index) => (index + local) / chapters.length);
const routes = [
  "about",
  "features",
  "execution",
  "projects",
  "projects-ongoing",
  "projects-2023-2026",
  "projects-2019-2022",
  "projects-2012-2018",
  "clients",
  "quality-safety",
  "leadership",
  "organisation",
  "downloads",
  "contact",
];

await mkdir(path.join(root, "public", "posters"), { recursive: true });
await mkdir(path.join(root, "public", "og"), { recursive: true });
const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined, args: ["--ignore-gpu-blocklist", "--enable-gpu"] });

async function capture(query, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${base}?${query}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.poster === "ready", null, { timeout: 90000 });
  await page.waitForTimeout(400);
  const buffer = await page.screenshot();
  await page.close();
  return buffer;
}

for (const [index, chapter] of chapters.entries()) {
  const buffer = await capture(`poster=journey&p=${holds[index]}`, 1280, 800);
  await sharp(buffer).webp({ quality: 72 }).toFile(path.join(root, "public", "posters", `${chapter}.webp`));
  if (index === 0) await sharp(buffer).resize(1200, 630, { fit: "cover", position: "right" }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(root, "public", "og", "home.jpg"));
  console.log(`poster ${chapter}`);
}

// Inner pages share one design in both modes, so their social images show the page itself: header and hero at
// 1200×630, in the final state of the entrance animation (reduced motion). The home page keeps the 3D façade above.
async function capturePage(id) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await context.addInitScript(() => globalThis.localStorage.setItem("ge-3d", "off"));
  const page = await context.newPage();
  const route = id.startsWith("projects-") ? `projects/${id.slice("projects-".length)}/` : `${id}/`;
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const buffer = await page.screenshot();
  await context.close();
  return buffer;
}

for (const id of routes) {
  const buffer = await capturePage(id);
  await sharp(buffer).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, "public", "og", `${id}.jpg`));
  console.log(`og ${id}`);
}
await browser.close();
