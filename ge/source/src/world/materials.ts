import { AdditiveBlending, Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Vector3 } from "three";
import energyFrag from "./shaders/energy.frag";
import energyVert from "./shaders/energy.vert";
import skyFrag from "./shaders/sky.frag";
import skyVert from "./shaders/sky.vert";
import { look } from "./look";
import { palette } from "./palette";
import type { Texture } from "three";
import { asphalt, concrete, cornerShade, floorTiles, gravel, radial, wallPanels } from "./textures";

const toned: Record<string, (tone: number) => Texture> = {
  floor: floorTiles,
  floorDark: floorTiles,
  wall: wallPanels,
  wallDark: wallPanels,
  cladding: wallPanels,
  concrete: (tone) => concrete(tone),
  asphalt,
  gravel,
};
const baseTone: Record<string, number> = { floor: 44, floorDark: 34, wall: 36, wallDark: 26, cladding: 30, concrete: 70, asphalt: 22, gravel: 42 };

export type Materials = ReturnType<typeof createMaterials>;

const std = (roughness: number, metalness = 0, extra: Partial<MeshStandardMaterial> = {}) => Object.assign(new MeshStandardMaterial({ roughness, metalness }), extra);

const glow = (color = "#ffffff", intensity = 1) => {
  const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), toneMapped: false });
  return material;
};

// Colours, texture tones, glows and light pools come from look.json (applied by applyLook). The procedural surface
// textures are painted afterwards by paintMaterials, one per task.
export function createMaterials() {
  const materials = {
    floor: std(0.34, 0.05),
    floorDark: std(0.42, 0.05),
    wall: std(0.82),
    wallDark: std(0.86),
    ceiling: std(0.95),
    cladding: std(0.55, 0.45),
    concrete: std(0.9),
    asphalt: std(0.78),
    gravel: std(0.95),
    copper: std(0.32, 1),
    steel: std(0.36, 0.9),
    darkMetal: std(0.48, 0.6),
    black: std(0.7, 0.1),
    amber: std(0.55),
    hazard: std(0.6),
    enamel: std(0.4, 0.15),
    lacquer: std(0.6, 0.2),
    whiteboard: std(0.45, 0, { color: new Color("#f4f5f2") }),
    wood: std(0.62),
    fabric: std(0.95),
    glass: std(0.04, 0, { transparent: true, opacity: 0.16, envMapIntensity: 2.2, depthWrite: false, side: DoubleSide }),
    glassWarm: std(0.08, 0.3, { envMapIntensity: 1.6 }),
    lightStrip: glow(),
    lightWarm: glow(),
    lightCool: glow(),
    lightRed: glow("#ff3b2a", 3),
    lightGreen: glow("#3dff8a", 3),
    screen: glow("#0e2433", 1),
    pool: new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
    poolCool: new MeshBasicMaterial({ transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
    corner: new MeshBasicMaterial({ transparent: true, depthWrite: false, side: DoubleSide, color: "#ffffff" }),
    shadow: new MeshBasicMaterial({ transparent: true, depthWrite: false, color: "#000000" }),
  };
  applyLook(materials as unknown as Record<string, MeshStandardMaterial | MeshBasicMaterial>);
  return materials;
}

/**
 * Paints the procedural textures (several 512 px canvases with thousands of strokes) and assigns them, yielding between
 * them: painted together they blocked the main thread for a few hundred milliseconds on a phone. Every map must be in
 * place before the shaders are compiled, because a map changes the program.
 */
export async function paintMaterials(materials: Materials, pause: () => Promise<void>): Promise<void> {
  const jobs: [MeshStandardMaterial | MeshBasicMaterial, () => Texture][] = [
    [materials.pool, () => radial("rgba(255,255,255,1)")],
    [materials.poolCool, () => radial("rgba(255,255,255,1)")],
    [materials.corner, cornerShade],
    [materials.shadow, () => radial("rgba(0,0,0,0.85)")],
  ];
  const all = materials as unknown as Record<string, MeshStandardMaterial | MeshBasicMaterial>;
  for (const [key, finish] of Object.entries(look.surfaces)) {
    const material = all[key];
    const texture = toned[key];
    if (material && texture) jobs.push([material, () => texture(finish.tone ?? baseTone[key] ?? 40)]);
  }
  for (const [material, paint] of jobs) {
    material.map = paint();
    await pause();
  }
}

export type EnergyRole = "warm" | "cool";

function applyLook(materials: Record<string, MeshStandardMaterial | MeshBasicMaterial>): void {
  for (const [key, finish] of Object.entries(look.surfaces)) {
    const material = materials[key];
    if (!material) continue;
    material.color.set(finish.color);
    if (material instanceof MeshStandardMaterial) {
      if (finish.metalness !== undefined) material.metalness = finish.metalness;
      if (finish.roughness !== undefined) material.roughness = finish.roughness;
      if (finish.emissive) material.emissive.set(finish.emissive);
      if (finish.emissiveIntensity !== undefined) material.emissiveIntensity = finish.emissiveIntensity;
    }
  }
  for (const [key, [color, intensity]] of Object.entries(look.glows)) materials[key]?.color.set(color).multiplyScalar(intensity);
  materials.pool?.color.set(look.pools.warm).multiplyScalar(look.pools.strength);
  materials.poolCool?.color.set(look.pools.cool).multiplyScalar(look.pools.strength);
}

export function energyMaterial(role: EnergyRole = "cool", scale = 6) {
  return new ShaderMaterial({
    vertexShader: energyVert,
    fragmentShader: energyFrag,
    uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uScale: { value: scale }, uColor: { value: new Color(look.energy[role]) } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

export function skyMaterial() {
  const uniforms = {
    uTop: { value: new Color(palette.skyTop) },
    uHorizon: { value: new Color(palette.skyHorizon) },
    uGlow: { value: new Color(palette.skyGlow) },
    uGlowDirection: { value: new Vector3(0.9, 0.04, 0.6) },
    uStars: { value: palette.stars },
  };
  const material = new ShaderMaterial({
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    uniforms,
    side: 1,
    depthWrite: false,
  });
  return material as ShaderMaterial & { uniforms: typeof uniforms };
}

export type SkyMaterial = ReturnType<typeof skyMaterial>;

export function disposeMaterials(materials: Materials): void {
  for (const material of Object.values(materials)) material.dispose();
}
