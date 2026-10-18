import { AdditiveBlending, Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Vector3 } from "three";
import energyFrag from "./shaders/energy.frag";
import energyVert from "./shaders/energy.vert";
import skyFrag from "./shaders/sky.frag";
import skyVert from "./shaders/sky.vert";
import { asphalt, concrete, cornerShade, floorTiles, gravel, radial, wallPanels } from "./textures";

export type Materials = ReturnType<typeof createMaterials>;

const std = (color: string, roughness: number, metalness = 0, extra: Partial<MeshStandardMaterial> = {}) =>
  Object.assign(new MeshStandardMaterial({ color, roughness, metalness }), extra);

const glow = (color: string, intensity: number) => {
  const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), toneMapped: false });
  return material;
};

export function createMaterials() {
  return {
    floor: std("#8b939a", 0.34, 0.05, { map: floorTiles(44) }),
    floorDark: std("#5b6268", 0.42, 0.05, { map: floorTiles(34) }),
    wall: std("#626c75", 0.82, 0, { map: wallPanels(36) }),
    wallDark: std("#2b3138", 0.86, 0, { map: wallPanels(26) }),
    ceiling: std("#1a1f25", 0.95),
    cladding: std("#2a3138", 0.55, 0.45, { map: wallPanels(30) }),
    concrete: std("#7d8287", 0.9, 0, { map: concrete(70) }),
    asphalt: std("#9aa0a6", 0.78, 0, { map: asphalt() }),
    gravel: std("#a29d96", 0.95, 0, { map: gravel() }),
    copper: std("#d68f57", 0.32, 1),
    steel: std("#a6aeb5", 0.36, 0.9),
    darkMetal: std("#171b1f", 0.48, 0.6),
    black: std("#0b0d0f", 0.7, 0.1),
    amber: std("#f2b33c", 0.55),
    hazard: std("#f2b33c", 0.6),
    enamel: std("#b8c0c6", 0.4, 0.15),
    navy: std("#1c2c3d", 0.6, 0.2),
    whiteboard: std("#f4f5f2", 0.45),
    wood: std("#6d4c34", 0.62),
    fabric: std("#262b31", 0.95),
    glass: std("#a8d4e6", 0.04, 0, { transparent: true, opacity: 0.16, envMapIntensity: 2.2, depthWrite: false, side: DoubleSide }),
    glassWarm: std("#20180f", 0.08, 0.3, { emissive: new Color("#ff9a4a"), emissiveIntensity: 0.42, envMapIntensity: 1.6 }),
    lightStrip: glow("#f4f7ff", 3.2),
    lightWarm: glow("#ffcf96", 2.6),
    lightCool: glow("#9fdcff", 2.4),
    lightRed: glow("#ff3b2a", 3),
    lightGreen: glow("#3dff8a", 3),
    screen: glow("#0e2433", 1),
    pool: new MeshBasicMaterial({ map: radial("rgba(255,214,160,0.9)"), transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
    poolCool: new MeshBasicMaterial({ map: radial("rgba(170,220,255,0.75)"), transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
    corner: new MeshBasicMaterial({ map: cornerShade(), transparent: true, depthWrite: false, side: DoubleSide, color: "#ffffff" }),
    shadow: new MeshBasicMaterial({ map: radial("rgba(0,0,0,0.85)"), transparent: true, depthWrite: false, color: "#000000" }),
  };
}

export function energyMaterial(color = "#7fd4ff", scale = 6) {
  return new ShaderMaterial({
    vertexShader: energyVert,
    fragmentShader: energyFrag,
    uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uScale: { value: scale }, uColor: { value: new Color(color) } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

export function skyMaterial() {
  const uniforms = {
    uTop: { value: new Color("#060b16") },
    uHorizon: { value: new Color("#1b2433") },
    uGlow: { value: new Color("#9a5636") },
    uGlowDirection: { value: new Vector3(0.9, 0.04, 0.6) },
    uStars: { value: 1 },
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
