import { BoxGeometry, BufferGeometry, CatmullRomCurve3, Mesh, TubeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { instance } from "../assets";
import { box, contactShadow, cylinder, merged, placed, plane, pool } from "../kit";
import { energyMaterial } from "../materials";
import { createZone, cue, type ZoneBuilder } from "./shared";

function span(from: Vector3, to: Vector3, sag: number, radius: number): TubeGeometry {
  const mid = from.clone().lerp(to, 0.5);
  mid.y -= sag;
  return new TubeGeometry(new CatmullRomCurve3([from, mid, to]), 32, radius, 5, false);
}

export const buildYard: ZoneBuilder = async (context) => {
  const { m } = context;
  const energy = energyMaterial("cool", 4);
  const zone = createZone(context, (frame) => {
    energy.uniforms.uPower!.value = cue(-frame.camera.z, 108, 116) * 0.6;
    energy.uniforms.uTime!.value = frame.time;
  });
  zone.own(energy);
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
  placements.forEach(([x, z, r], index) => {
    const copy = index === 0 ? transformer : transformer.clone(true);
    copy.position.set(x, 0, z);
    copy.rotation.y = r;
    g.add(copy, contactShadow(m, [x, 0, z], 5, 4));
    g.add(box(m.concrete, [3.4, 0.25, 2.4], [x, 0.12, z]));
  });

  const insulator = await instance("insulator");
  const gantry: BufferGeometry[] = [];
  const conductors: BufferGeometry[] = [];
  const glows: BufferGeometry[] = [];
  for (const z of [-134, -150]) {
    for (const x of [-12, 12]) gantry.push(placed(new BoxGeometry(0.5, 11, 0.5), [x, 5.5, z]));
    gantry.push(placed(new BoxGeometry(24.5, 0.6, 0.6), [0, 11, z]));
    for (const x of [-6, 0, 6]) {
      const string = insulator.clone(true);
      string.position.set(x, 10.7, z);
      g.add(string);
    }
  }
  g.add(merged(m.steel, gantry));
  for (const x of [-6, 0, 6]) {
    const runs: [Vector3, Vector3, number, number][] = [
      [new Vector3(x, 9.2, -134), new Vector3(x, 9.2, -150), 0.6, 0.04],
      [new Vector3(x, 9.2, -150), new Vector3(x * 1.6, 20, -240), 4, 0.05],

    ];
    for (const [from, to, sag, radius] of runs) {
      conductors.push(span(from, to, sag, radius));
      glows.push(span(from, to, sag, radius * 1.7));
    }
  }
  g.add(new Mesh(mergeGeometries(conductors), m.copper), new Mesh(mergeGeometries(glows), energy));

  const tower = await instance("tower");
  for (const [x, z] of [
    [0, -240],
    [-24, -330],
    [30, -330],
  ] as const) {
    const copy = tower.clone(true);
    copy.position.set(x, 0, z);
    g.add(copy);
  }

  for (const [x, z] of [
    [-16, -122],
    [16, -122],
    [-16, -160],
    [16, -160],
  ] as const) {
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

  zone.lights.push(
    { position: [-12, 8, -126], color: "#bfe4ff", intensity: 90, distance: 30 },
    { position: [12, 8, -140], color: "#bfe4ff", intensity: 90, distance: 30 },
    { position: [0, 3, -113], color: "#ffd8aa", intensity: 20, distance: 10 },
  );
  return zone;
};
