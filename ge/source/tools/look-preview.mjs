import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const blender = process.env.BLENDER ?? "C:/Users/t-paharimuru/tools/blender-4.5.14-windows-x64/blender.exe";
const out = path.join(root, ".cache", "look-preview");
const models = path.join(out, "models");
await mkdir(models, { recursive: true });

// Builds the models into .cache (public/models stays untouched) and renders them with the palette in src/world/look.json.
execFileSync(blender, ["--background", "--factory-startup", "--python", path.join(root, "blender", "build_assets.py"), "--", models], {
  stdio: "ignore",
});
execFileSync(
  blender,
  [
    "--background",
    "--factory-startup",
    "--python",
    path.join(root, "blender", "look_preview.py"),
    "--",
    models,
    path.join(out, "preview.png"),
  ],
  { stdio: "ignore" },
);
console.log(path.join(out, "preview.png"));
