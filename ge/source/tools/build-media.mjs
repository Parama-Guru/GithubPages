import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const logo = path.join(root, "public", "media", "wganesh3.webp");
const emblem = await sharp(logo).extract({ left: 0, top: 0, width: 104, height: 103 }).toBuffer();

async function badge(size, padding, background) {
  const inner = size - padding * 2;
  const mark = await sharp(emblem).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background } });
  return base.composite([{ input: mark, left: padding, top: padding }]);
}

await (await badge(120, 4, { r: 0, g: 0, b: 0, alpha: 0 })).webp({ quality: 90 }).toFile(path.join(root, "public", "media", "emblem.webp"));
await (await badge(64, 8, { r: 6, g: 9, b: 13, alpha: 1 })).png().toFile(path.join(root, "public", "favicon.png"));
await (await badge(180, 26, { r: 6, g: 9, b: 13, alpha: 1 })).png().toFile(path.join(root, "public", "apple-touch-icon.png"));
console.log("Generated emblem, favicon and touch icon.");
