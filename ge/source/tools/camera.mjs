import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const blender = process.env.BLENDER ?? "C:/Users/t-paharimuru/tools/blender-4.5.14-windows-x64/blender.exe";
const script = path.join(root, "blender", "camera_path.py");
const blend = path.join(root, "blender", "camera_path.blend");
const json = path.join(root, "src", "world", "camera-path.json");

if (!existsSync(blend) || process.argv.includes("--seed")) {
  execFileSync(blender, ["--background", "--factory-startup", "--python", script, "--", "seed", json, blend], { stdio: "inherit" });
}
execFileSync(blender, ["--background", blend, "--python", script, "--", "export", json], { stdio: "inherit" });
