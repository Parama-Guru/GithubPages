import { Group, MeshBasicMaterial, type Material } from "three";
import type { Materials } from "../materials";
import { disposeGroup, type Frame, type LightSpec, type Pickable, type Zone } from "../kit";

export type Tier = "high" | "medium" | "low";

export type ZoneContext = { m: Materials; tier: Tier };

export type ZoneBuilder = (context: ZoneContext) => Promise<Zone>;

export function createZone(context: ZoneContext, update: (frame: Frame) => void = () => undefined) {
  const group = new Group();
  const lights: LightSpec[] = [];
  const pickables: Pickable[] = [];
  const owned: Material[] = [];
  const shared = new Set<Material>(Object.values(context.m) as Material[]);
  const zone: Zone & { own<T extends Material>(material: T): T } = {
    group,
    lights,
    pickables,
    update,
    own(material) {
      owned.push(material);
      return material;
    },
    dispose() {
      disposeGroup(group, shared);
      for (const material of owned) material.dispose();
    },
  };
  return zone;
}

export function glowMaterial(texture: MeshBasicMaterial["map"], intensity = 1.6, transparent = true): MeshBasicMaterial {
  const material = new MeshBasicMaterial({ map: texture, transparent, toneMapped: false, depthWrite: !transparent });
  material.color.setScalar(intensity);
  return material;
}

export function cue(value: number, from: number, to: number): number {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}
