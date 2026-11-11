import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [dir, filter = "", output = "sheet.png", columns = "4", tileWidth = "480"] = process.argv.slice(2);
const files = (await readdir(dir)).filter((name) => name.endsWith(".png") && name.includes(filter) && !name.startsWith("sheet")).sort();
const meta = await sharp(path.join(dir, files[0])).metadata();
const w = Number(tileWidth);
const h = Math.round((meta.height / meta.width) * w);
const cols = Number(columns);
const rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(files.map((file) => sharp(path.join(dir, file)).resize(w, h).toBuffer()));
await sharp({ create: { width: w * cols, height: h * rows, channels: 3, background: "#000" } })
  .composite(tiles.map((input, index) => ({ input, left: (index % cols) * w, top: Math.floor(index / cols) * h })))
  .png()
  .toFile(path.join(dir, output));
console.log(files.join("\n"));
