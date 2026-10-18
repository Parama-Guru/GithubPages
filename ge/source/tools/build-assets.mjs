import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = path.resolve(import.meta.dirname, "..");
const raw = path.join(root, ".cache", "models");
const out = path.join(root, "public", "models");
const blender = process.env.BLENDER ?? "C:/Users/t-paharimuru/tools/blender-4.5.14-windows-x64/blender.exe";

await rm(raw, { recursive: true, force: true });
await mkdir(raw, { recursive: true });
await mkdir(out, { recursive: true });

execFileSync(blender, ["--background", "--factory-startup", "--python", path.join(root, "blender", "build_assets.py"), "--", raw], { stdio: "inherit" });

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.encoder": MeshoptEncoder });

for (const file of (await readdir(raw)).filter((name) => name.endsWith(".glb"))) {
  const document = await io.read(path.join(raw, file));
  await document.transform(dedup(), weld(), prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
  const target = path.join(out, file);
  await io.write(target, document);
  const before = (await stat(path.join(raw, file))).size;
  const after = (await stat(target)).size;
  console.log(`${file}: ${(before / 1024).toFixed(0)} KiB -> ${(after / 1024).toFixed(0)} KiB`);
}
