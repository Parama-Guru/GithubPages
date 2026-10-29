import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const base = process.argv[2] ?? "http://127.0.0.1:4173/GithubPages/ge/";
const chapters = ["welcome", "about", "why-us", "projects", "clients", "quality", "leadership", "contact"];
const holds = [0.36, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.6].map((local, index) => (index + local) / chapters.length);
const routes = ["about", "features", "projects", "clients", "quality-safety", "leadership", "organisation", "downloads", "contact"];

const themes = ["light", "copper", "signal"];
for (const theme of themes) await mkdir(path.join(root, "public", "posters", theme), { recursive: true });
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

for (const theme of themes) {
  for (const [index, chapter] of chapters.entries()) {
    const buffer = await capture(`poster=journey&p=${holds[index]}&theme=${theme}`, 1280, 800);
    await sharp(buffer).webp({ quality: 72 }).toFile(path.join(root, "public", "posters", theme, `${chapter}.webp`));
    if (index === 0 && theme === "light") await sharp(buffer).resize(1200, 630, { fit: "cover", position: "right" }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(root, "public", "og", "home.jpg"));
  }
  console.log(`posters ${theme}`);
}

for (const id of routes) {
  const buffer = await capture(`poster=${id}&p=0&theme=light`, 1200, 630);
  await sharp(buffer).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(root, "public", "og", `${id}.jpg`));
  console.log(`og ${id}`);
}
for (const year of ["2013-2014", "2014-2016", "2016-2017", "2017-2018"]) {
  const buffer = await capture(`poster=projects-${year}&p=0&theme=light`, 1200, 630);
  await sharp(buffer).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(root, "public", "og", `projects-${year}.jpg`));
  console.log(`og projects-${year}`);
}
await browser.close();
