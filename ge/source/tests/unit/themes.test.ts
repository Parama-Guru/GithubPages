import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { themes } from "@/app/theme";
import { looks } from "@/world/look";
import { palettes } from "@/world/palette";

const blenderMaterials = ["PanelEnamel", "PanelDark", "Steel", "Rubber", "Copper", "Porcelain", "GlassInsulator", "TankPaint", "Galvanised", "WarningYellow", "DoorGlass"];
const hex = /^#[0-9a-f]{6}$/i;

describe("colour themes", () => {
  const ids = themes.map((theme) => theme.id);

  it("defines a complete 3D look and atmosphere for every theme", () => {
    for (const id of ids) {
      expect(looks[id], id).toBeTruthy();
      expect(palettes[id], id).toBeTruthy();
    }
    const keys = (id: (typeof ids)[number]) => ({
      surfaces: Object.keys(looks[id].surfaces).sort(),
      glows: Object.keys(looks[id].glows).sort(),
      ink: Object.keys(looks[id].ink).sort(),
      models: Object.keys(looks[id].models).sort(),
    });
    for (const id of ids) expect(keys(id), id).toEqual(keys("copper"));
  });

  it("uses valid colours everywhere", () => {
    for (const id of ids) {
      const look = looks[id];
      for (const finish of [...Object.values(look.surfaces), ...Object.values(look.models)]) expect(finish.color, id).toMatch(hex);
      for (const [color] of Object.values(look.glows)) expect(color, id).toMatch(hex);
      for (const color of Object.values(look.ink)) expect(color, id).toMatch(hex);
      for (const color of [look.energy.warm, look.energy.cool, look.pools.warm, look.pools.cool]) expect(color, id).toMatch(hex);
    }
  });

  it("covers every Blender material and the Blender build reads the same file", () => {
    for (const id of ids) for (const name of blenderMaterials) expect(looks[id].models[name], `${id} ${name}`).toBeTruthy();
    const script = readFileSync("blender/build_assets.py", "utf8");
    expect(script).toContain('"src", "world", "themes.json"');
    for (const name of blenderMaterials.filter((name) => name !== "DoorGlass")) expect(script).toContain(`themed("${name}"`);
  });

  it("makes each theme visibly different in walls, trims, signs and equipment", () => {
    for (const field of [
      (id: (typeof ids)[number]) => looks[id].surfaces.wall?.color,
      (id: (typeof ids)[number]) => looks[id].surfaces.copper?.color,
      (id: (typeof ids)[number]) => looks[id].ink.accent,
      (id: (typeof ids)[number]) => looks[id].models.PanelEnamel?.color,
      (id: (typeof ids)[number]) => looks[id].energy.cool,
    ]) {
      expect(new Set(ids.map(field)).size).toBe(ids.length);
    }
  });
});
