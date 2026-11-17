import { readFileSync } from "node:fs";
import { Sphere, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { energiseFront, feeds, feedSpeed, flows, routes } from "@/world/effects/routes";
import { createGovernor } from "@/world/governor";
import { layout } from "@/world/layout";
import { doorwayBetween, portalPlanes, throughDoorway } from "@/world/portals";

describe("adaptive render scale", () => {
  const options = { min: 0.6, budget: 13.5, window: 4, calm: 8, cooldown: 100, settle: 500 };

  it("steps down while frames are slow, never faster than the cooldown and never below the minimum", () => {
    const governor = createGovernor(options);
    let now = 0;
    for (let i = 0; i < 3; i++) expect(governor.sample(30, (now += 16))).toBeNull();
    expect(governor.sample(30, (now += 16))).toBe(0.85);
    for (let i = 0; i < 4; i++) expect(governor.sample(30, (now += 16))).toBeNull();
    for (let i = 0; i < 200; i++) governor.sample(30, (now += 40));
    expect(governor.scale).toBe(0.6);
  });

  it("steps back up only after settling, and only if the larger image still fits the budget", () => {
    const governor = createGovernor(options);
    let now = 0;
    for (let i = 0; i < 4; i++) governor.sample(30, (now += 16));
    expect(governor.scale).toBe(0.85);
    // Fast frames right after a step down do not undo it before `settle`.
    for (let i = 0; i < 20; i++) expect(governor.sample(5, (now += 16))).toBeNull();
    // Frames that would not fit at full size keep the lower scale (no oscillation).
    for (let i = 0; i < 40; i++) expect(governor.sample(10, (now += 40))).toBeNull();
    for (let i = 0; i < 8; i++) governor.sample(5, (now += 40));
    expect(governor.scale).toBe(1);
  });
});

describe("portal culling", () => {
  const door = doorwayBetween("control", "hall");
  const camera = new Vector3(0, 1.75, -17);

  it("bounds the view into the next room by its doorway", () => {
    expect(door?.z).toBe(-32);
    const planes = door && portalPlanes(camera, door);
    if (!door || !planes) throw new Error("no doorway");
    expect(throughDoorway(new Sphere(new Vector3(0, 1.5, -48), 0.5), camera, door, planes)).toBe(true);
    // A photo on the hall's side wall, far off the line through the doorway.
    expect(throughDoorway(new Sphere(new Vector3(5.5, 3.2, -48.7), 0.3), camera, door, planes)).toBe(false);
    // The doorway's own wall and frame always stay.
    expect(throughDoorway(new Sphere(new Vector3(4, 2, -32.2), 1), camera, door, planes)).toBe(true);
  });

  it("does not cull while the camera passes through the doorway", () => {
    expect(door && portalPlanes(new Vector3(0, 1.7, -31.8), door)).toBeNull();
  });
});

describe("energised routes", () => {
  const pieces = routes();

  it("tags every piece with its feed and distances from the feed's source", () => {
    for (const piece of pieces) {
      const route = piece.getAttribute("aRoute");
      for (let i = 0; i < route.count; i++) {
        expect(route.getX(i)).toBeGreaterThanOrEqual(0);
        expect(route.getX(i)).toBeLessThan(feeds.length);
        expect(route.getY(i)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("runs the switchyard's power-up out from the breaker poles to the first tower", () => {
    const line = feeds.indexOf("line");
    const samples: [number, number][] = [];
    for (const piece of pieces) {
      const route = piece.getAttribute("aRoute");
      const position = piece.getAttribute("position");
      for (let i = 0; i < route.count; i++) if (Math.round(route.getX(i)) === line) samples.push([position.getZ(i), route.getY(i)]);
    }
    const nearest = samples.reduce((best, sample) => (sample[1] < best[1] ? sample : best));
    const farthest = samples.reduce((best, sample) => (sample[1] > best[1] ? sample : best));
    expect(Math.abs(nearest[0] - layout.yard.bay.z)).toBeLessThan(1.5);
    expect(farthest[0]).toBeLessThan(-230);
    expect(energiseFront(0)).toBe(0);
    expect(energiseFront(0.5)).toBeGreaterThan(energiseFront(0.25));
    expect(energiseFront(1)).toBeGreaterThan(farthest[1]);
  });
});

describe("no flashing (WCAG 2.3.1)", () => {
  it("passes current comets less than three times a second at any point", () => {
    for (const feed of feeds) for (const energy of [0, 0.5, 1]) expect(feedSpeed(feed, energy) / flows[feed].spacing, feed).toBeLessThan(3);
  });

  it("keeps every time-driven change in the effect shaders below three cycles a second", () => {
    for (const name of ["particles.vert", "shaft.frag", "sky.frag", "network.frag"]) {
      const source = readFileSync(`src/world/shaders/${name}`, "utf8");
      // A product of two oscillations changes at the sum of their rates.
      for (const line of source.split("\n")) {
        const rates = [...line.matchAll(/uTime \* ([\d.]+)/g)].map((match) => Number(match[1]));
        const total = rates.reduce((sum, rate) => sum + rate, 0);
        expect(total / (2 * Math.PI), `${name}: ${line.trim()}`).toBeLessThan(3);
      }
    }
  });
});
