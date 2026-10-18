import type { RouteId, ZoneKey } from "@/routes/routes";
import type { Key, Pose, Vec3 } from "./math";
import { lerpPose, sampleKeys } from "./math";

export type ChapterRange = { start: number; end: number };

type JourneyKey = { chapter: number; t: number; position: Vec3; target: Vec3; fov?: number };

const FOV = 42;

const journey: JourneyKey[] = [
  { chapter: 0, t: 0, position: [-2.6, 3.0, 31], target: [0.2, 4.0, 0] },
  { chapter: 0, t: 0.3, position: [-1.4, 2.3, 21], target: [0.4, 3.5, 0] },
  { chapter: 0, t: 0.42, position: [-1.4, 2.3, 21], target: [0.4, 3.5, 0] },
  { chapter: 0, t: 0.8, position: [-0.4, 1.85, 9], target: [0, 1.75, 0], fov: 44 },
  { chapter: 1, t: 0, position: [0, 1.72, 2.6], target: [0, 1.7, -4], fov: 48 },
  { chapter: 1, t: 0.06, position: [0.3, 1.72, -1.2], target: [-1.5, 1.8, -9], fov: 46 },
  { chapter: 1, t: 0.14, position: [2.6, 1.75, -4.6], target: [-5.9, 2.2, -12.2] },
  { chapter: 1, t: 0.5, position: [2.6, 1.75, -4.6], target: [-5.9, 2.2, -12.2] },
  { chapter: 2, t: 0, position: [0, 1.75, -15.2], target: [0, 1.9, -24] },
  { chapter: 2, t: 0.12, position: [-3.6, 1.8, -19.6], target: [6.9, 2.5, -25.6] },
  { chapter: 2, t: 0.5, position: [-3.6, 1.8, -19.6], target: [6.9, 2.5, -25.6] },
  { chapter: 3, t: 0, position: [0, 2.0, -31.2], target: [0, 2.6, -48] },
  { chapter: 3, t: 0.12, position: [1.8, 2.0, -43.4], target: [-4.0, 1.3, -48.8] },
  { chapter: 3, t: 0.5, position: [1.8, 2.0, -43.4], target: [-4.0, 1.3, -48.8] },
  { chapter: 4, t: 0, position: [0, 1.8, -63.4], target: [0, 1.8, -72] },
  { chapter: 4, t: 0.12, position: [-1.6, 1.7, -65.8], target: [3.4, 1.9, -71.2] },
  { chapter: 4, t: 0.5, position: [-1.6, 1.7, -65.8], target: [3.4, 1.9, -71.2] },
  { chapter: 5, t: 0, position: [0, 1.75, -79.4], target: [0, 1.7, -86] },
  { chapter: 5, t: 0.12, position: [-2.4, 1.7, -82.4], target: [4.9, 1.8, -88.5] },
  { chapter: 5, t: 0.5, position: [-2.4, 1.7, -82.4], target: [4.9, 1.8, -88.5] },
  { chapter: 6, t: 0, position: [0, 1.75, -93.4], target: [0, 1.75, -100] },
  { chapter: 6, t: 0.12, position: [2.4, 1.8, -100.8], target: [-4.9, 2.0, -104.6] },
  { chapter: 6, t: 0.5, position: [2.4, 1.8, -100.8], target: [-4.9, 2.0, -104.6] },
  { chapter: 7, t: 0, position: [0, 1.75, -108.2], target: [0, 1.9, -118] },
  { chapter: 7, t: 0.12, position: [0, 3.6, -114], target: [0.5, 3.4, -140], fov: 46 },
  { chapter: 7, t: 0.3, position: [-2.0, 8.2, -116], target: [0.5, 4, -146], fov: 46 },
  { chapter: 7, t: 1, position: [-2.0, 8.2, -116], target: [0.5, 4, -146], fov: 46 },
];

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

const pose = (position: Vec3, target: Vec3, fov = FOV): Pose => ({ position, target, fov });

export const routePoses: Record<Exclude<RouteId, "home">, [Pose, Pose]> = {
  about: [pose([2.8, 1.8, -4.2], [-5.9, 2.2, -12]), pose([1.8, 1.7, -6], [-5.9, 2.1, -12.6])],
  features: [pose([-3.8, 1.8, -19.2], [6.9, 2.5, -25.2]), pose([-3.2, 1.7, -21.4], [6.9, 2.4, -25.6])],
  projects: [pose([2.4, 2.6, -39.5], [-4.0, 1.4, -48.6]), pose([1.8, 2.0, -43.6], [-4.0, 1.3, -49])],
  "projects-2013-2014": [pose([1.8, 2.2, -38.6], [-3.8, 3.0, -43]), pose([1.6, 2.0, -40], [-3.8, 2.4, -44])],
  "projects-2014-2016": [pose([1.8, 2.2, -43.6], [-3.8, 3.0, -48]), pose([1.6, 2.0, -45], [-3.8, 2.4, -49])],
  "projects-2016-2017": [pose([1.8, 2.2, -48.6], [-3.8, 3.0, -53]), pose([1.6, 2.0, -50], [-3.8, 2.4, -54])],
  "projects-2017-2018": [pose([1.8, 2.2, -53.6], [-3.8, 3.0, -58]), pose([1.6, 2.0, -55], [-3.8, 2.4, -59])],
  clients: [pose([-1.6, 1.7, -65.4], [3.4, 1.9, -70.6]), pose([-1.2, 1.7, -68], [3.4, 1.9, -73.2])],
  "quality-safety": [pose([-2.6, 1.7, -81.8], [4.9, 1.8, -88]), pose([-1.8, 1.7, -84], [4.9, 1.7, -90])],
  leadership: [pose([2.2, 1.75, -101.4], [-4.9, 2.1, -108.2]), pose([1.4, 1.7, -102.8], [-4.9, 2.0, -108.2])],
  organisation: [pose([2.0, 1.8, -99.2], [-4.9, 2.0, -104.6]), pose([1.2, 1.75, -101], [-4.9, 2.0, -104.6])],
  downloads: [pose([-2.0, 1.7, -98.6], [4.6, 1.6, -104]), pose([-1.4, 1.7, -100], [4.6, 1.5, -104])],
  contact: [pose([-2.0, 8.2, -116], [0.5, 4, -146], 46), pose([-2.6, 6.4, -120], [0.5, 3.6, -148], 46)],
  "not-found": [pose([-5, 2.2, 26], [0, 3.8, 0], 44), pose([-3.4, 2.0, 20], [0, 3.4, 0], 44)],
};

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
