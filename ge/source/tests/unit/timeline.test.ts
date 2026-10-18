import { describe, expect, it } from "vitest";
import { phaseAt, sampleKeys, smootherstep, type Key } from "@/world/math";
import { evenRanges, journeyKeys, routePoses, sampleJourney, zoneAt, zoneExtents, zoneOrder } from "@/world/path";

const close = (a: readonly number[], b: readonly number[]) => a.forEach((value, index) => expect(value).toBeCloseTo(b[index] ?? NaN, 6));

describe("phaseAt", () => {
  it("is clamped and linear inside its window", () => {
    expect(phaseAt(-1, 0, 2)).toBe(0);
    expect(phaseAt(0, 0, 2)).toBe(0);
    expect(phaseAt(1, 0, 2)).toBe(0.5);
    expect(phaseAt(2, 0, 2)).toBe(1);
    expect(phaseAt(9, 0, 2)).toBe(1);
  });
  it("handles zero-length beats", () => {
    expect(phaseAt(0.99, 1, 0)).toBe(0);
    expect(phaseAt(1, 1, 0)).toBe(1);
  });
  it("eases from rest to rest", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5);
  });
});

describe("camera keys", () => {
  const keys: Key[] = [
    { at: 0, position: [0, 0, 0], target: [0, 0, -1], fov: 40 },
    { at: 0.4, position: [0, 0, -10], target: [0, 0, -11], fov: 40 },
    { at: 0.6, position: [0, 0, -10], target: [0, 0, -11], fov: 40 },
    { at: 1, position: [5, 0, -20], target: [5, 0, -21], fov: 50 },
  ];
  it("returns the end poses outside the range", () => {
    close(sampleKeys(keys, -1).position, [0, 0, 0]);
    close(sampleKeys(keys, 2).position, [5, 0, -20]);
  });
  it("holds still between identical keys", () => {
    close(sampleKeys(keys, 0.45).position, [0, 0, -10]);
    close(sampleKeys(keys, 0.55).position, [0, 0, -10]);
  });
  it("is the same pose whichever way it is reached", () => {
    const random = [0.13, 0.71, 0.33, 0.98, 0.5, 0.02];
    const forward = random.map((p) => sampleKeys(keys, p));
    const backward = [...random].reverse().map((p) => sampleKeys(keys, p)).reverse();
    forward.forEach((pose, index) => close(pose.position, backward[index]?.position ?? []));
  });
});

describe("journey", () => {
  const ranges = evenRanges(8);
  it("has ordered keys inside 0..1", () => {
    const keys = journeyKeys(ranges);
    for (let i = 1; i < keys.length; i++) expect(keys[i]!.at).toBeGreaterThanOrEqual(keys[i - 1]!.at);
    expect(keys[0]!.at).toBe(0);
    expect(keys[keys.length - 1]!.at).toBe(1);
  });
  it("rests at each chapter's hold", () => {
    for (let chapter = 1; chapter < 7; chapter++) {
      const range = ranges[chapter]!;
      const a = sampleJourney(ranges, range.start + (range.end - range.start) * 0.2);
      const b = sampleJourney(ranges, range.start + (range.end - range.start) * 0.45);
      close(a.position, b.position);
    }
  });
  it("visits the zones in order", () => {
    const zones = Array.from({ length: 8 }, (_, chapter) => {
      const range = ranges[chapter]!;
      return zoneAt(sampleJourney(ranges, range.start + (range.end - range.start) * 0.32).position[2]);
    });
    expect(zones).toEqual(zoneOrder);
  });
  it("defines two poses for every dedicated page", () => {
    for (const [id, poses] of Object.entries(routePoses)) {
      expect(poses, id).toHaveLength(2);
      const zone = zoneAt(poses[0].position[2]);
      expect(zoneOrder).toContain(zone);
    }
  });
  it("covers the world without gaps", () => {
    for (let i = 1; i < zoneOrder.length; i++) expect(zoneExtents[zoneOrder[i - 1]!][0]).toBe(zoneExtents[zoneOrder[i]!][1]);
  });
});
