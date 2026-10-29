import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const blender = process.env.BLENDER ?? "C:/Users/t-paharimuru/tools/blender-4.5.14-windows-x64/blender.exe";
const out = path.join(root, ".cache", "theme-preview");
await mkdir(out, { recursive: true });
const themes = ["light", "copper", "signal"];

for (const theme of themes) {
  const models = path.join(out, theme);
  await mkdir(models, { recursive: true });
  execFileSync(blender, ["--background", "--factory-startup", "--python", path.join(root, "blender", "build_assets.py"), "--", models], {
    stdio: "ignore",
    env: { ...process.env, GE_THEME: theme },
  });
  execFileSync(blender, ["--background", "--factory-startup", "--python", path.join(root, "blender", "theme_preview.py"), "--", models, path.join(out, `${theme}.png`), theme], { stdio: "ignore" });
  console.log(`rendered ${theme}`);
}

const tiles = await Promise.all(themes.map((theme) => sharp(path.join(out, `${theme}.png`)).resize(640, 400).toBuffer()));
await sharp({ create: { width: 1920, height: 400, channels: 3, background: "#000" } })
  .composite(tiles.map((input, index) => ({ input, left: index * 640, top: 0 })))
  .png()
  .toFile(path.join(out, "sheet.png"));
console.log(path.join(out, "sheet.png"));
