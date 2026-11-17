import { Group, type PointLight, type Vector3 } from "three";
import type { ZoneKey } from "@/routes/routes";
import { clamp01 } from "../math";
import type { Tier } from "../zones/shared";
import { createNetwork } from "./network";
import { createParticles } from "./particles";
import { energiseFront, feedSpeed } from "./routes";
import { createShafts, type Shaft } from "./shafts";

export type EffectsFrame = {
  time: number;
  /** Seconds since the last frame while ambient motion runs, else 0. */
  delta: number;
  camera: Vector3;
  /** Whether a room is built and shown (rooms further than one away are hidden). */
  shown(zone: ZoneKey): boolean;
  panel: number;
  energy: number;
  lights: readonly PointLight[];
  /** Pixels per metre at one metre, for the particles' size. */
  pixels: number;
};

export type Effects = {
  group: Group;
  /** The effects drawn on the current tier (written to the canvas dataset for tests). */
  readonly names: string[];
  update(frame: EffectsFrame): void;
  setTier(tier: Tier): void;
  dispose(): void;
};

const cue = (value: number, from: number, to: number) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

const indoor: ZoneKey[] = ["lobby", "control", "hall", "gallery", "safety", "office"];

/**
 * The facility's WebGL effects, each one draw call for every room: the energised conductors (effects/network.ts), dust,
 * ionised motes and corona (effects/particles.ts) and light shafts (effects/shafts.ts). Their animation runs in the
 * shaders; per frame only uniforms change. The low tier keeps the conductors and the yard's corona and skips dust and
 * shafts. Each part is built in a task of its own (`pause` hands the main thread back between them).
 */
export async function createEffects(tier: Tier, pause: () => Promise<void>): Promise<Effects> {
  const network = createNetwork();
  await pause();
  const shafts = tier === "low" ? null : createShafts();
  const particles = createParticles(tier === "high" ? 2000 : tier === "medium" ? 1200 : 0);
  const group = new Group();
  group.name = "effects";
  group.add(network.mesh, particles.points);
  if (shafts) group.add(shafts.mesh);
  let low = tier === "low";
  const power = {} as Record<ZoneKey, number>;
  const ranked: { shaft: Shaft; power: number; distance: number }[] = [];
  return {
    group,
    get names() {
      return ["network", "particles", ...(shafts && !low ? ["shafts", "dust"] : [])];
    },
    update(frame) {
      const depth = -frame.camera.z;
      const on = (zone: ZoneKey) => (frame.shown(zone) ? 1 : 0);
      const energy = frame.energy;
      const yard = on("yard") * cue(depth, 108, 116);
      const front = energiseFront(energy);

      network.set("lobby", { power: on("lobby") * cue(depth, -0.5, 3.4), speed: feedSpeed("lobby", 0) });
      // The trunk powers up ahead of the visitor as they walk into the hall.
      network.set("trunk", { power: on("hall") * cue(depth, 31.5, 38) * 0.85, reach: Math.max(0, (depth - 31.5) * 2.6), speed: feedSpeed("trunk", 0) });
      network.set("feeder", { power: on("hall") * cue(frame.panel, 0.55, 1), speed: feedSpeed("feeder", 0) });
      network.set("diagram", { power: on("control") * cue(cue(depth, 15.4, 19.4), 0.85, 1), speed: feedSpeed("diagram", 0) });
      network.set("bay", { boost: yard * 1.3 * cue(energy, 0.03, 0.15), front, speed: feedSpeed("bay", energy) });
      network.set("line", { power: yard * 0.8, boost: yard * 1.4 * cue(energy, 0.15, 0.5), front, speed: feedSpeed("line", energy) });
      network.flow(frame.delta);
      network.mesh.visible = !network.idle;

      for (const zone of ["approach", "lobby", "control", "hall", "gallery", "safety", "office", "yard"] as ZoneKey[]) power[zone] = on(zone);
      power.yard = yard * (0.75 + 0.5 * cue(energy, 0.45, 0.95));
      if (shafts) {
        shafts.setPower(power, frame.time);
        if (low) shafts.mesh.visible = false;
      }

      // Dust catches the light of the shafts nearest the camera.
      ranked.length = 0;
      if (shafts && !low)
        for (const shaft of shafts.list) {
          const level = power[shaft.zone] ?? 0;
          if (level <= 0.001) continue;
          const dx = frame.camera.x - (shaft.apex[0] + shaft.toward[0]) / 2;
          const dy = frame.camera.y - (shaft.apex[1] + shaft.toward[1]) / 2;
          const dz = frame.camera.z - (shaft.apex[2] + shaft.toward[2]) / 2;
          ranked.push({ shaft, power: level, distance: dx * dx + dy * dy + dz * dz });
        }
      ranked.sort((a, b) => a.distance - b.distance);
      const inside = depth > -7 && depth < 117 && indoor.some((zone) => frame.shown(zone)) ? 1 : 0;
      particles.update({
        time: frame.time,
        dust: low ? 0 : inside,
        corona: yard * cue(energy, 0.55, 1),
        lights: frame.lights,
        shafts: ranked.slice(0, 4),
        pixels: frame.pixels,
      });
    },
    setTier(next) {
      low = next === "low";
    },
    dispose() {
      network.dispose();
      shafts?.dispose();
      particles.dispose();
    },
  };
}
