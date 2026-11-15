import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { look } from "@/world/look";
import { palette } from "@/world/palette";

const blenderMaterials = [
  "PanelEnamel",
  "PanelDark",
  "Steel",
  "Rubber",
  "Copper",
  "Porcelain",
  "GlassInsulator",
  "TankPaint",
  "Galvanised",
  "WarningYellow",
  "DoorGlass",
];
const surfaces = [
  "floor",
  "floorDark",
  "wall",
  "wallDark",
  "ceiling",
  "cladding",
  "concrete",
  "asphalt",
  "gravel",
  "copper",
  "steel",
  "darkMetal",
  "black",
  "amber",
  "hazard",
  "enamel",
  "lacquer",
  "wood",
  "fabric",
  "glass",
  "glassWarm",
];
const hex = /^#[0-9a-f]{6}$/i;

function luminance(colour: string): number {
  const value = Number.parseInt(colour.slice(1), 16);
  const [r, g, b] = [16, 8, 0]
    .map((shift) => ((value >> shift) & 255) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

// Hue in degrees and HSL saturation, to check the colour families of the palette roles.
function hueAndSaturation(colour: string): [number, number] {
  const value = Number.parseInt(colour.slice(1), 16);
  const [r, g, b] = [16, 8, 0].map((shift) => ((value >> shift) & 255) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (!delta) return [0, 0];
  const sector = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [sector * 60, delta / (1 - Math.abs(max + min - 1))];
}

const colours = [
  ...Object.values(look.surfaces).flatMap((finish) => [finish.color, ...(finish.emissive ? [finish.emissive] : [])]),
  ...Object.values(look.models).map((finish) => finish.color),
  ...Object.values(look.glows).map(([colour]) => colour),
  ...Object.values(look.ink),
  look.pools.warm,
  look.pools.cool,
  look.lightTint.warm,
  look.lightTint.cool,
  look.energy.warm,
  look.energy.cool,
  ...Object.values(palette).filter((value): value is string => typeof value === "string"),
];

describe("colour palette", () => {
  it("gives every room surface and Blender material a finish", () => {
    expect(Object.keys(look.surfaces).sort()).toEqual([...surfaces].sort());
    expect(Object.keys(look.glows).sort()).toEqual(["lightCool", "lightStrip", "lightWarm"]);
    expect(Object.keys(look.models).sort()).toEqual([...blenderMaterials].sort());
  });

  it("uses valid colours everywhere", () => {
    for (const colour of colours) expect(colour).toMatch(hex);
  });

  it("paints the brand in emerald, figures in terracotta and highlights in marigold, and nothing in blue", () => {
    const family = (range: [number, number], ...list: string[]) => {
      for (const colour of list) {
        const [hue, saturation] = hueAndSaturation(colour);
        expect(hue, colour).toBeGreaterThanOrEqual(range[0]);
        expect(hue, colour).toBeLessThanOrEqual(range[1]);
        expect(saturation, colour).toBeGreaterThan(0.3);
      }
    };
    const { surfaces: finish, ink, models } = look;
    family([140, 170], ink.brand, ink.sign, ink.screenLine, finish.darkMetal!.color, finish.fabric!.color, models.PanelDark!.color);
    family([10, 30], ink.screenValue, finish.lacquer!.color, finish.copper!.color, models.Copper!.color);
    family([30, 45], ink.accent, ink.logoGlow, look.energy.warm);
    for (const colour of colours) {
      const [hue, saturation] = hueAndSaturation(colour);
      expect(hue >= 190 && hue <= 260 && saturation > 0.2, `${colour} reads as blue`).toBe(false);
    }
  });

  it("keeps text painted in the 3D world readable on its plaques, signs and screens", () => {
    const { ink } = look;
    expect(Object.keys(ink).sort()).toEqual(
      [
        "panel",
        "text",
        "muted",
        "brand",
        "accent",
        "line",
        "sign",
        "signText",
        "signDim",
        "screenTop",
        "screenBottom",
        "screenLine",
        "screenValue",
        "safety",
        "logoGlow",
      ].sort(),
    );
    for (const [text, background] of [
      [ink.text, ink.panel],
      [ink.muted, ink.panel],
      [ink.brand, ink.panel],
      [ink.signText, ink.brand],
      [ink.signText, ink.sign],
      [ink.signDim, ink.sign],
      [ink.accent, ink.sign],
      [ink.safety, ink.sign],
      // Control-room screens are dark: light lettering, jade lines and terracotta-orange figures.
      [ink.signText, ink.screenBottom],
      [ink.accent, ink.screenBottom],
      [ink.screenLine, ink.screenBottom],
      [ink.screenValue, ink.screenTop],
      [ink.screenValue, ink.screenBottom],
    ] as const)
      expect(contrast(text, background), `${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
  });

  it("is read by the Blender build from the same file", () => {
    const script = readFileSync("blender/build_assets.py", "utf8");
    expect(script).toContain('"src", "world", "look.json"');
    expect(script).not.toContain("GE_THEME");
    for (const name of blenderMaterials.filter((name) => name !== "DoorGlass")) expect(script).toContain(`look_material("${name}"`);
    expect(script).toContain('MODEL["DoorGlass"]');
  });
});
