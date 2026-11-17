import { BoxGeometry, BufferGeometry, CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, TubeGeometry, Vector2, type Matrix4 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { instance } from "../assets";
import { dropper, lineSpans } from "../effects/routes";
import { box, contactShadow, cylinder, instancedCopies, merged, placed, placement, plane, pool } from "../kit";
import { layout } from "../layout";
import { look } from "../look";
import { createZone, cue, pause, type ZoneBuilder } from "./shared";

/** A shedded porcelain column (live-tank breaker pole) from `base` up to `top`, its sheds every 0.13 m. */
function column(x: number, z: number, base: number, top: number): BufferGeometry {
  const profile: Vector2[] = [new Vector2(0, 0)];
  const sheds = Math.floor((top - base) / 0.13);
  for (let i = 0; i < sheds; i++) {
    const y = i * 0.13;
    profile.push(new Vector2(0.1, y + 0.02), new Vector2(0.175, y + 0.05), new Vector2(0.17, y + 0.065), new Vector2(0.1, y + 0.09));
  }
  profile.push(new Vector2(0.1, top - base), new Vector2(0, top - base));
  return placed(new LatheGeometry(profile, 18), [x, base, z]);
}

export const buildYard: ZoneBuilder = async (context) => {
  const { m } = context;
  const { bay, phases, floodlights } = layout.yard;
  const porcelain = new MeshStandardMaterial({ color: look.models.Porcelain?.color ?? "#7e4a34", roughness: 0.32, metalness: 0, envMapIntensity: 1.1 });
  // The mechanism's lamp: red while the breaker is open, green once closed (one material, only its colour changes).
  const lampMaterial = m.lightRed.clone();
  const open = m.lightRed.color.clone();
  const closed = m.lightGreen.color.clone();
  const lamp = new Mesh(new BoxGeometry(0.16, 0.16, 0.03), lampMaterial);
  const bayGroup = new Group();
  const target = { object: bayGroup, id: "energise", label: "Energise the switchyard" };
  const lights = [
    { position: [-12, 8, -126] as [number, number, number], color: "#bfe4ff", intensity: 90, distance: 30 },
    { position: [12, 8, -140] as [number, number, number], color: "#bfe4ff", intensity: 90, distance: 30 },
    { position: [0, 3, -113] as [number, number, number], color: "#ffd8aa", intensity: 20, distance: 10 },
  ];
  // The conductors carry current in effects/network.ts (feeds "bay" and "line"); closing the bay's breaker
  // (frame.energy) turns its lamp green, brightens the floodlights and runs a power-up out along the line.
  const zone = createZone(context, (frame) => {
    lampMaterial.color.copy(frame.energy > 0.12 ? closed : open);
    target.label = frame.energy > 0.5 ? "Switch off the switchyard" : "Energise the switchyard";
    const flood = 1 + 0.35 * cue(frame.energy, 0.45, 0.95);
    for (const light of lights.slice(0, 2)) light.intensity = 90 * flood;
  });
  zone.own(porcelain);
  zone.own(lampMaterial);
  const g = zone.group;

  g.add(plane(m.gravel, 220, 420, [0, 0, -320], [-Math.PI / 2, 0, 0], 3));
  g.add(plane(m.concrete, 4, 10, [0, 0.004, -115], [-Math.PI / 2, 0, 0], 2));
  g.add(box(m.cladding, [18.4, 12, 0.6], [-10.8, 6, -110.5]), box(m.cladding, [18.4, 12, 0.6], [10.8, 6, -110.5]), box(m.cladding, [3.2, 9, 0.6], [0, 7.5, -110.5]));
  g.add(box(m.lightWarm, [3.0, 0.04, 0.05], [0, 2.95, -110.85]));

  const fence: BufferGeometry[] = [];
  for (let z = -118; z >= -190; z -= 3) for (const x of [-24, 24]) fence.push(placed(new BoxGeometry(0.08, 2.6, 0.08), [x, 1.3, z]));
  for (const x of [-24, 24]) for (const y of [0.4, 2.5]) fence.push(placed(new BoxGeometry(0.04, 0.04, 72), [x, y, -154]));
  g.add(merged(m.steel, fence));

  const transformer = await instance("transformer");
  const placements: [number, number, number][] = [
    [-7, -128, 0],
    [7, -128, 0],
    [-7, -142, 0],
    [7, -142, 0],
  ];
  // Repeated models are instanced: one draw per material for all four transformers (and the insulators and towers below).
  g.add(instancedCopies(transformer, placements.map(([x, z, r]) => placement(x, 0, z, r))));
  for (const [x, z] of placements) {
    g.add(contactShadow(m, [x, 0, z], 5, 4));
    g.add(box(m.concrete, [3.4, 0.25, 2.4], [x, 0.12, z]));
  }

  const insulator = await instance("insulator");
  const gantry: BufferGeometry[] = [];
  const conductors: BufferGeometry[] = [];
  const strings: Matrix4[] = [];
  for (const z of layout.yard.gantries) {
    for (const x of [-12, 12]) gantry.push(placed(new BoxGeometry(0.5, 11, 0.5), [x, 5.5, z]));
    gantry.push(placed(new BoxGeometry(24.5, 0.6, 0.6), [0, 11, z]));
    for (const x of phases) strings.push(placement(x, 10.7, z));
  }
  g.add(instancedCopies(insulator, strings));
  // The bay's lathed columns and conductors take a few milliseconds: built in a task of their own.
  await pause();

  // The line bay: a live-tank circuit-breaker pole under each phase, with droppers up to the conductors.
  const columns: BufferGeometry[] = [];
  const terminals: BufferGeometry[] = [];
  for (const x of phases) {
    const [span, line] = lineSpans(x);
    conductors.push(new TubeGeometry(span, 32, 0.04, 5, false), new TubeGeometry(line, 32, 0.05, 5, false), new TubeGeometry(dropper(x), 16, 0.035, 5, false));
    gantry.push(placed(new BoxGeometry(0.24, 2.3, 0.24), [x, 1.35, bay.z]), placed(new BoxGeometry(0.52, 0.06, 0.52), [x, 2.53, bay.z]));
    columns.push(column(x, bay.z, 2.56, bay.top - 0.16));
    terminals.push(placed(new CylinderGeometry(0.15, 0.15, 0.12, 18), [x, bay.top - 0.1, bay.z]), placed(new BoxGeometry(0.16, 0.08, 0.22), [x, bay.top, bay.z]));
    g.add(box(m.concrete, [0.9, 0.2, 0.9], [x, 0.1, bay.z]));
  }
  g.add(merged(m.steel, gantry), new Mesh(mergeGeometries(conductors), m.copper), merged(m.copper, terminals), merged(porcelain, columns));
  // Operating mechanism beside the middle pole, its lamp red while the breaker is open and green once closed.
  const mechanism = bay.mechanism;
  g.add(box(m.darkMetal, [0.9, 1.3, 0.55], [mechanism, 0.85, bay.z + 0.15]), box(m.concrete, [1.1, 0.2, 0.75], [mechanism, 0.1, bay.z + 0.15]));
  lamp.position.set(mechanism, 1.25, bay.z + 0.44);
  g.add(lamp);
  // Picking uses invisible stand-ins around each pole and the mechanism, so the bay's visible parts stay batched.
  const standIns: [number, number, number, number, number][] = [
    ...phases.map((x): [number, number, number, number, number] => [x, (bay.top + 0.2) / 2, bay.z, 0.9, bay.top + 0.2]),
    [mechanism, 0.8, bay.z + 0.15, 1.0, 1.6],
  ];
  for (const [x, y, z, width, height] of standIns) {
    const proxy = new Mesh(new BoxGeometry(width, height, 0.9), m.black);
    proxy.position.set(x, y, z);
    proxy.visible = false;
    bayGroup.add(proxy);
  }
  g.add(bayGroup);
  zone.pickables.push(target);

  const tower = await instance("tower");
  g.add(
    instancedCopies(tower, [
      placement(0, 0, -240),
      placement(-24, 0, -330),
      placement(30, 0, -330),
    ]),
  );

  for (const [x, z] of floodlights) {
    g.add(cylinder(m.darkMetal, 0.12, 9, [x, 4.5, z], 8));
    g.add(box(m.lightCool, [0.9, 0.12, 0.5], [x + (x < 0 ? 0.4 : -0.4), 9, z]));
    g.add(pool(m, [x * 0.7, 0, z], 16, true));
  }

  const distant: BufferGeometry[] = [];
  for (let i = 0; i < 70; i++) {
    const x = Math.sin(i * 12.9898) * 140;
    const z = -260 - ((i * 47) % 140);
    distant.push(placed(new BoxGeometry(0.5, 0.5, 0.5), [x, 0.6 + (i % 5) * 0.8, z]));
  }
  g.add(merged(m.lightWarm, distant));

  zone.lights.push(...lights);
  return zone;
};
