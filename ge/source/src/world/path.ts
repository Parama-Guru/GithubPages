import type { RouteId, ZoneKey } from "@/routes/routes";
import cameraPath from "./camera-path.json";
import type { Key, Pose, Vec3 } from "./math";
import { lerpPose, sampleKeys } from "./math";

export type ChapterRange = { start: number; end: number };

type JourneyKey = { chapter: number; t: number; position: Vec3; target: Vec3; fov?: number };

const FOV = 42;

const journey = cameraPath.journey as unknown as JourneyKey[];

export function journeyKeys(ranges: ChapterRange[]): Key[] {
  return journey.map((key) => {
    const range = ranges[key.chapter] ?? { start: key.chapter / ranges.length, end: (key.chapter + 1) / ranges.length };
    return { at: range.start + (range.end - range.start) * key.t, position: key.position, target: key.target, fov: key.fov ?? FOV };
  });
}

export function sampleJourney(ranges: ChapterRange[], progress: number): Pose {
  return sampleKeys(journeyKeys(ranges), progress);
}

export function evenRanges(count: number): ChapterRange[] {
  return Array.from({ length: count }, (_, index) => ({ start: index / count, end: (index + 1) / count }));
}

export const routePoses = Object.fromEntries(
  Object.entries(cameraPath.routes).map(([id, poses]) => [id, poses.map((entry) => ({ position: entry.position as unknown as Vec3, target: entry.target as unknown as Vec3, fov: entry.fov }))]),
) as unknown as Record<Exclude<RouteId, "home">, [Pose, Pose]>;

export function sampleRoute(id: Exclude<RouteId, "home">, progress: number): Pose {
  const [from, to] = routePoses[id];
  return lerpPose(from, to, progress);
}

export const zoneExtents: Record<ZoneKey, [number, number]> = {
  approach: [0, 60],
  lobby: [-16, 0],
  control: [-32, -16],
  hall: [-64, -32],
  gallery: [-80, -64],
  safety: [-94, -80],
  office: [-110, -94],
  yard: [-200, -110],
};

export const zoneOrder: ZoneKey[] = ["approach", "lobby", "control", "hall", "gallery", "safety", "office", "yard"];

export function zoneAt(z: number): ZoneKey {
  return zoneOrder.find((key) => z <= zoneExtents[key][1] && z >= zoneExtents[key][0]) ?? (z > 0 ? "approach" : "yard");
}

function bump(value: number, from: number, to: number): number {
  if (value <= from || value >= to) return 0;
  return Math.sin(((value - from) / (to - from)) * Math.PI);
}

export function exposureAt(z: number): number {
  return 1 + 0.42 * bump(z, -3, 3.5) - 0.3 * bump(z, -116, -107);
}

export function travelAt(ranges: ChapterRange[], progress: number): number {
  for (let index = 0; index < ranges.length - 1; index++) {
    const range = ranges[index] as ChapterRange;
    const next = ranges[index + 1] as ChapterRange;
    const start = range.start + (range.end - range.start) * 0.5;
    const end = next.start + (next.end - next.start) * 0.12;
    if (progress > start && progress < end) return bump(progress, start, end);
  }
  return 0;
}
