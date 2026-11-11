import { cp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(import.meta.dirname, "..");
const target = path.resolve(source, "..");
const dist = path.join(source, "dist");
const manifestFile = path.join(target, ".published.json");
const protectedEntries = new Set(["source", "checklist.md", ".gitignore", ".published.json"]);

let previous;
try {
  previous = JSON.parse(await readFile(manifestFile, "utf8"));
} catch {
  previous = [];
}

for (const entry of previous) {
  if (!protectedEntries.has(entry)) await rm(path.join(target, entry), { recursive: true, force: true });
}

const entries = (await readdir(dist)).filter((entry) => !protectedEntries.has(entry));
for (const entry of entries) await cp(path.join(dist, entry), path.join(target, entry), { recursive: true });
await writeFile(manifestFile, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Published ${entries.length} entries to ${target}`);
