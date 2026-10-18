export type Vec3 = readonly [number, number, number];
export type Pose = { position: Vec3; target: Vec3; fov: number };

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function phaseAt(time: number, start: number, duration: number): number {
  if (duration <= 0) return time >= start ? 1 : 0;
  return clamp01((time - start) / duration);
}

export function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function smootherstep(value: number): number {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return { position: lerpVec(a.position, b.position, t), target: lerpVec(a.target, b.target, t), fov: lerp(a.fov, b.fov, t) };
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function catmullVec(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return [catmull(p0[0], p1[0], p2[0], p3[0], t), catmull(p0[1], p1[1], p2[1], p3[1], t), catmull(p0[2], p1[2], p2[2], p3[2], t)];
}

export type Key = Pose & { at: number };

export function sampleKeys(keys: Key[], progress: number): Pose {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) throw new Error("Camera path needs keys");
  if (progress <= first.at) return first;
  if (progress >= last.at) return last;
  let index = 0;
  while (index < keys.length - 2 && (keys[index + 1]?.at ?? 1) <= progress) index++;
  const a = keys[index] as Key;
  const b = keys[index + 1] as Key;
  const before = keys[index - 1] ?? a;
  const after = keys[index + 2] ?? b;
  const t = smootherstep(phaseAt(progress, a.at, b.at - a.at));
  const still = a.position.every((value, axis) => value === b.position[axis]) && a.target.every((value, axis) => value === b.target[axis]);
  if (still) return { position: a.position, target: a.target, fov: lerp(a.fov, b.fov, t) };
  const p0 = before.position;
  const p3 = after.position;
  return {
    position: catmullVec(p0, a.position, b.position, p3, t),
    target: lerpVec(a.target, b.target, t),
    fov: lerp(a.fov, b.fov, t),
  };
}
