import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Matrix4, PlaneGeometry, TubeGeometry, Vector3 } from "three";
import { ink } from "../ink";
import { layout } from "../layout";
import { look } from "../look";
import { clamp01, type Vec3 } from "../math";

/** The circuits of the facility; each has its own power, front and flow, so one draw call carries them all. */
export const feeds = ["lobby", "trunk", "feeder", "diagram", "bay", "line"] as const;
export type Feed = (typeof feeds)[number];

/**
 * How current shows on each feed: comets `spacing` metres apart with tails `tail` of that long over a steady `base`
 * glow, moving at `speed` metres per second (standing by, energised). Comets pass any point less than three times a
 * second (WCAG 2.3.1), tested in tests/unit/effects.test.ts.
 */
export const flows: Record<Feed, { spacing: number; base: number; tail: number; speed: [number, number] }> = {
  lobby: { spacing: 1.5, base: 0.22, tail: 0.5, speed: [0.9, 0.9] },
  trunk: { spacing: 3.2, base: 0.18, tail: 0.6, speed: [2.4, 2.4] },
  feeder: { spacing: 1.1, base: 0.25, tail: 0.5, speed: [0.8, 0.8] },
  diagram: { spacing: 0.42, base: 0, tail: 0.3, speed: [0.2, 0.2] },
  bay: { spacing: 2.2, base: 0.35, tail: 0.55, speed: [1.2, 3.6] },
  line: { spacing: 7, base: 0.3, tail: 0.6, speed: [1.8, 5.2] },
};

/** A feed's comet speed for the switchyard's energy (0 standing by, 1 energised). */
export function feedSpeed(feed: Feed, energy: number): number {
  const [idle, live] = flows[feed].speed;
  return idle + (live - idle) * clamp01(energy);
}

/** How far the switchyard's power-up has run from the breaker poles, in metres (the line is about 115 m long). */
export function energiseFront(energy: number): number {
  if (energy >= 1) return 1e4;
  const t = clamp01((energy - 0.06) / 0.94);
  return t * t * (3 - 2 * t) * 125;
}

/** Tags a route piece: its feed, distance from the feed's source at each uv.x along it, edge profile and colour. */
function tag(geometry: BufferGeometry, feed: Feed, colour: string, measure: (along: number) => number, tube: boolean): BufferGeometry {
  const uv = geometry.getAttribute("uv");
  const tint = new Color(colour);
  const route = new Float32Array(uv.count * 4);
  const colours = new Float32Array(uv.count * 3);
  const index = feeds.indexOf(feed);
  for (let i = 0; i < uv.count; i++) {
    route.set([index, measure(uv.getX(i)), tube ? 0 : uv.getY(i) * 2 - 1, tube ? 1 : 0], i * 4);
    colours.set([tint.r, tint.g, tint.b], i * 3);
  }
  geometry.setAttribute("aRoute", new BufferAttribute(route, 4));
  geometry.setAttribute("aColor", new BufferAttribute(colours, 3));
  return geometry;
}

/** A flat strip from `from` to `to` facing `facing` (uv.x along it, uv.y across), and its length. */
function ribbon(from: Vec3, to: Vec3, width: number, facing: Vec3): [BufferGeometry, number] {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const length = a.distanceTo(b);
  const along = b.clone().sub(a).normalize();
  const normal = new Vector3(...facing);
  normal.addScaledVector(along, -normal.dot(along)).normalize();
  const side = normal.clone().cross(along).normalize();
  const geometry = new PlaneGeometry(length, width);
  geometry.applyMatrix4(new Matrix4().makeBasis(along, side, normal).setPosition(a.lerp(b, 0.5)));
  return [geometry, length];
}

/** A conductor hanging between two points with the given sag (the curve of the conductors in the yard). */
export function sagged(from: Vec3, to: Vec3, sag: number): CatmullRomCurve3 {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= sag;
  return new CatmullRomCurve3([a, mid, b]);
}

function sheath(curve: CatmullRomCurve3, radius: number, segments: number): [BufferGeometry, number] {
  return [new TubeGeometry(curve, segments, radius, 6, false), curve.getLength()];
}

/** One phase of the line: the strung span between the gantries and the span out to the first tower. */
export function lineSpans(x: number): [CatmullRomCurve3, CatmullRomCurve3] {
  const { gantries, conductorY, towerTop } = layout.yard;
  return [sagged([x, conductorY, gantries[0]], [x, conductorY, gantries[1]], 0.6), sagged([x, conductorY, gantries[1]], towerTop(x), 4)];
}

/** Where a bay dropper meets its phase conductor (just behind the pole), and how far along the span that is. */
export function junction(x: number): { point: Vector3; along: number } {
  const span = lineSpans(x)[0];
  const { bay, gantries } = layout.yard;
  const share = (gantries[0] - (bay.z - 0.45)) / (gantries[0] - gantries[1]);
  return { point: span.getPointAt(share), along: span.getLength() * share };
}

/** A bay dropper: from a breaker pole's top terminal up to its phase conductor. */
export function dropper(x: number): CatmullRomCurve3 {
  const { bay } = layout.yard;
  const end = junction(x).point;
  return new CatmullRomCurve3([new Vector3(x, bay.top + 0.08, bay.z), new Vector3(x, (bay.top + end.y) / 2, bay.z - 0.32), end.clone().setY(end.y - 0.04)]);
}

/**
 * Every energised route in the facility as pieces of geometry tagged with their feed, the distance (metres) from the
 * feed's source along them, an edge profile and a colour (aRoute, aColor): ribbons on flat busbars and screens,
 * sheaths around conductors.
 */
export function routes(): BufferGeometry[] {
  const pieces: BufferGeometry[] = [];
  /** Adds a piece whose distance runs from `start` at its beginning (or as `measure` says); returns its far end's. */
  const add = (feed: Feed, colour: string, start: number, [geometry, length]: [BufferGeometry, number], tube = false, measure = (along: number) => start + along * length) => {
    pieces.push(tag(geometry, feed, colour, measure, tube));
    return start + length;
  };
  const { warm, cool } = look.energy;

  const bus = layout.lobby.bus;
  add("lobby", warm, 0, ribbon([bus.x, bus.y, bus.from], [bus.x, bus.y, bus.to], 0.08, [-1, 0, 0]));

  const { trunk, trays, heroPanel } = layout.hall;
  add("trunk", cool, 0, ribbon([0, trunk.y, trunk.from], [0, trunk.y, trunk.to], 0.22, [0, -1, 0]));
  for (const x of trays.xs) add("trunk", cool, 0.5, ribbon([x, trays.y, trunk.from - 0.5], [x, trays.y, trunk.to + 0.5], 0.46, [0, -1, 0]));
  // The hero panel's feeder drops from the cable tray onto its roof (the cable itself is part of the hall).
  const drop = heroPanel[0] - 0.15;
  add("feeder", warm, 0, sheath(new CatmullRomCurve3([new Vector3(drop, trays.y - 0.05, heroPanel[2]), new Vector3(drop, 2.37, heroPanel[2])]), 0.04, 12), true);

  // Current on the control room's single-line diagram (zones/painters.ts diagram(): 900 × 440 px on the middle lower screen).
  const { videoWall, screen } = layout.control;
  const at = (px: number, py: number): Vec3 => [
    videoWall.x - 0.026,
    videoWall.y + 0.81 - (screen.height + screen.gap) + (0.5 - py / 440) * screen.height,
    videoWall.z + (px / 900 - 0.5) * screen.width,
  ];
  const diagram = (from: [number, number], to: [number, number], start: number) => add("diagram", ink.accent, start, ribbon(at(...from), at(...to), 0.024, [-1, 0, 0]));
  const incomer = diagram([80, 70], [80, 150], 0);
  diagram([80, 150], [40, 150], incomer);
  const busEnd = diagram([80, 150], [860, 150], incomer);
  for (const x of [140, 340, 540, 740]) diagram([x, 150], [x, 380], incomer + ((busEnd - incomer) * (x - 80)) / 780);

  // The yard: from each breaker pole up to its conductor, then out both ways along the strung span and on to the first
  // tower (distances run from the poles, so a power-up spreads out from the bay).
  for (const x of layout.yard.phases) {
    const up = add("bay", cool, 0, sheath(dropper(x), 0.075, 16), true);
    const [span, line] = lineSpans(x);
    const { along } = junction(x);
    const length = span.getLength();
    add("line", cool, up, sheath(span, 0.11, 32), true, (share) => up + Math.abs(share * length - along));
    add("line", cool, up + length - along, sheath(line, 0.13, 48), true);
  }
  return pieces;
}
