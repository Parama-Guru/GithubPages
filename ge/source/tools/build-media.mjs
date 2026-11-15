import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const logo = path.join(root, "public", "media", "wganesh3.webp");
const media = path.join(root, "public", "media");
// Emerald brand colour of the palette (README "Colour palette"); the original logo is white on transparency.
const emerald = { r: 15, g: 92, b: 64 };
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const emblem = await sharp(logo).extract({ left: 0, top: 0, width: 104, height: 103 }).toBuffer();

// The same shapes in one colour for light surfaces: the white logo's alpha channel over a solid fill.
async function tint(input, colour) {
  const { data, info } = await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: info.width, height: info.height, channels: 3, background: colour } })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
}

async function badge(size, padding, background, mark = emblem) {
  const inner = size - padding * 2;
  const resized = await sharp(mark).resize(inner, inner, { fit: "contain", background: transparent }).toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background } });
  return base.composite([{ input: resized, left: padding, top: padding }]);
}

// The header, menu and footer show the white original on forest-green bands; only the route-change emblem sits on ivory.
const curtain = await tint(emblem, emerald);
await (await badge(120, 4, transparent, curtain)).webp({ quality: 90 }).toFile(path.join(media, "emblem.webp"));
await (await badge(64, 2, transparent, curtain)).webp({ quality: 90 }).toFile(path.join(media, "emblem-64.webp"));
// Logo sizes for srcset: shown 200–240 px wide (header, menu, footer), so 1x and 2x copies instead of the 799 px original.
for (const width of [240, 480]) await sharp(logo).resize({ width }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(media, `logo-${width}.webp`));
await (await badge(64, 8, { ...emerald, alpha: 1 })).png().toFile(path.join(root, "public", "favicon.png"));
await (await badge(180, 26, { ...emerald, alpha: 1 })).png().toFile(path.join(root, "public", "apple-touch-icon.png"));
// Project photos are shown 360–1320 px wide (2D home mosaic, where the tiles crop to about 500 px, and the Projects
// gallery): 520 and 800 px copies for srcset (src/content/index.ts photoCopies). The 1600 px originals stay as the largest
// candidate and as the 3D hall's textures.
for (const name of ["slide3", "hd2", "hd3", "hd4", "hd5"])
  for (const width of [520, 800]) await sharp(path.join(media, `${name}.webp`)).resize({ width }).webp({ quality: 80 }).toFile(path.join(media, `${name}-${width}.webp`));
// Client logos in the 2D site's logo strip are shown at most 116 px wide: 120 and 240 px copies (1x, 2x) of the wider ones
// (src/ui/flat.ts). The originals stay for the Clients page grid and the 3D gallery's textures.
for (const file of (await readdir(media)).filter((name) => /^client-\d+\.webp$/.test(name))) {
  const { width = 0 } = await sharp(path.join(media, file)).metadata();
  for (const copy of [120, 240])
    if (width > copy) await sharp(path.join(media, file)).resize({ width: copy }).webp({ quality: 85, alphaQuality: 100 }).toFile(path.join(media, file.replace(".webp", `-${copy}.webp`)));
}
console.log("Generated the emerald emblem (64 and 120 px), logo sizes (240 and 480 px), photo and client logo copies, favicon and touch icon.");
