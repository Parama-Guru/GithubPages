import { BoxGeometry, BufferGeometry, CatmullRomCurve3, Group, Mesh, TubeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { company } from "@/content";
import { instance } from "../assets";
import { box, contactShadow, cylinder, merged, placed, plane, pool } from "../kit";
import { label } from "../textures";
import { createZone, cue, glowMaterial, type ZoneBuilder } from "./shared";

function wire(from: Vector3, to: Vector3, sag: number, radius = 0.025): BufferGeometry {
  const mid = from.clone().lerp(to, 0.5);
  mid.y -= sag;
  return new TubeGeometry(new CatmullRomCurve3([from, mid, to]), 24, radius, 4, false);
}

export const buildApproach: ZoneBuilder = async (context) => {
  const { m } = context;
  const logo = await new Promise<HTMLImageElement>((resolve) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => resolve(element);
    element.src = `/GithubPages/ge/${company.logo.src}`;
  });
  const signLabel = label("approach-sign", 2048, 264, () => undefined);
  let signDrawn = -1;
  const drawSign = (progress: number) => {
    const step = Math.round(progress * 60) / 60;
    if (step === signDrawn) return;
    signDrawn = step;
    signLabel.redraw((ctx, w, h) => {
      if (!logo.naturalWidth) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * step, h);
      ctx.clip();
      ctx.shadowColor = "rgba(255,210,160,0.9)";
      ctx.shadowBlur = 18;
      ctx.drawImage(logo, 0, 0, w, h);
      ctx.restore();
    });
  };

  const doors = { left: new Group(), right: new Group() };
  const zone = createZone(context, (frame) => {
    drawSign(frame.motion ? Math.min(1, frame.time / 1.2) : 1);
    const open = cue(-frame.camera.z, -9.5, -2.5);
    doors.left.rotation.y = open * 1.42;
    doors.right.rotation.y = -open * 1.42;
  });
  const g = zone.group;

  g.add(plane(m.asphalt, 90, 64, [0, 0, 32], [-Math.PI / 2, 0, 0], 4));
  const kerbs: BufferGeometry[] = [placed(new BoxGeometry(36, 0.18, 0.4), [0, 0.09, 10.5]), placed(new BoxGeometry(36, 0.18, 0.4), [0, 0.09, 26])];
  g.add(merged(m.concrete, kerbs));
  g.add(plane(m.concrete, 36, 10.2, [0, 0.005, 5.3], [-Math.PI / 2, 0, 0], 2));
  const lines: BufferGeometry[] = [];
  for (let z = 30; z < 58; z += 4) lines.push(placed(new BoxGeometry(0.16, 0.01, 2), [0, 0.01, z]));
  for (let x = -16; x <= 16; x += 2.6) if (Math.abs(x) > 3) lines.push(placed(new BoxGeometry(0.08, 0.01, 4.4), [x, 0.01, 18.4]));
  g.add(merged(m.amber, lines));

  const W = 36;
  const H = 10;
  const opening = 3.2;
  const doorHeight = 3.0;
  const side = (W - opening) / 2;
  const facade: BufferGeometry[] = [
    placed(new BoxGeometry(side, H, 0.6), [-(opening / 2 + side / 2), H / 2, -0.3]),
    placed(new BoxGeometry(side, H, 0.6), [opening / 2 + side / 2, H / 2, -0.3]),
    placed(new BoxGeometry(opening, H - doorHeight, 0.6), [0, doorHeight + (H - doorHeight) / 2, -0.3]),
  ];
  g.add(merged(m.cladding, facade));
  for (const x of [-10.2, 10.2]) g.add(box(m.glassWarm, [12.6, 1.9, 0.05], [x, 4.6, 0.04]));
  const fins: BufferGeometry[] = [];
  for (let x = -17; x <= 17; x += 1.7) if (Math.abs(x) > 2.6) fins.push(placed(new BoxGeometry(0.08, 2.3, 0.3), [x, 4.6, 0.15]));
  fins.push(placed(new BoxGeometry(W, 0.12, 0.4), [0, H - 0.06, 0.1]));
  g.add(merged(m.copper, fins));
  g.add(box(m.lightWarm, [W - 0.4, 0.05, 0.05], [0, H - 0.2, 0.32]));

  g.add(box(m.darkMetal, [7, 0.28, 3.4], [0, 3.62, 1.7]));
  const downlights: BufferGeometry[] = [];
  for (const x of [-2.4, 0, 2.4]) for (const z of [0.9, 2.6]) downlights.push(placed(new BoxGeometry(0.34, 0.02, 0.34), [x, 3.47, z]));
  g.add(merged(m.lightWarm, downlights));
  g.add(pool(m, [0, 0, 2.2], 7));

  const signMaterial = zone.own(glowMaterial(signLabel.texture, 2.2));
  const signPlate = plane(signMaterial, 11, 11 / signLabel.aspect, [0, 6.6, 0.06]);
  g.add(box(m.darkMetal, [12.7, 2.1, 0.12], [0, 6.6, 0.0]));
  g.add(signPlate);
  drawSign(0);

  const frameParts = (sign: number): BufferGeometry[] => [
    placed(new BoxGeometry(0.06, doorHeight - 0.04, 0.06), [sign * 0.03, doorHeight / 2, 0]),
    placed(new BoxGeometry(0.06, doorHeight - 0.04, 0.06), [sign * 1.55, doorHeight / 2, 0]),
    placed(new BoxGeometry(1.58, 0.06, 0.06), [sign * 0.79, doorHeight - 0.03, 0]),
    placed(new BoxGeometry(1.58, 0.12, 0.06), [sign * 0.79, 0.06, 0]),
  ];
  for (const [door, sign] of [
    [doors.left, 1],
    [doors.right, -1],
  ] as const) {
    door.add(merged(m.steel, frameParts(sign)));
    door.add(box(m.glass, [1.5, doorHeight - 0.18, 0.02], [sign * 0.79, doorHeight / 2 + 0.03, 0]));
    door.add(box(m.copper, [0.04, 1.1, 0.06], [sign * 1.32, 1.15, 0.08]));
    door.position.set(-sign * 1.6, 0, -0.05);
    g.add(door);
    zone.pickables.push({ object: door, id: "doors", label: "Enter the facility" });
  }

  for (const x of [-2.6, 2.6]) {
    for (let z = 4; z <= 20; z += 4) {
      g.add(cylinder(m.darkMetal, 0.09, 0.9, [x, 0.45, z], 10));
      g.add(cylinder(m.lightWarm, 0.075, 0.08, [x, 0.92, z], 10));
      g.add(pool(m, [x, 0, z], 2.2));
    }
  }

  const transformer = await instance("transformer");
  transformer.position.set(-12.5, 0, 6.5);
  transformer.rotation.y = 0.4;
  transformer.scale.setScalar(1.05);
  g.add(transformer, contactShadow(m, [-12.5, 0, 6.5], 5, 4));
  const fence: BufferGeometry[] = [];
  for (let i = 0; i <= 8; i++) fence.push(placed(new BoxGeometry(0.06, 2.4, 0.06), [-16.5 + i * 1.1, 1.2, 10]));
  fence.push(placed(new BoxGeometry(8.8, 0.05, 0.05), [-12.1, 2.3, 10]), placed(new BoxGeometry(8.8, 0.05, 0.05), [-12.1, 0.3, 10]));
  g.add(merged(m.steel, fence));

  const tower = await instance("tower");
  const towers: [number, number, number][] = [
    [-34, -60, 0.2],
    [30, -45, -0.3],
    [-62, -150, 0.2],
    [60, -140, -0.3],
  ];
  const wires: BufferGeometry[] = [];
  towers.forEach(([x, z, r], index) => {
    const copy = index === 0 ? tower : tower.clone(true);
    copy.position.set(x, 0, z);
    copy.rotation.y = r;
    g.add(copy);
  });
  for (const [a, b] of [
    [0, 2],
    [1, 3],
  ] as const) {
    const ta = towers[a] as [number, number, number];
    const tb = towers[b] as [number, number, number];
    for (const [dx, y] of [
      [-6.2, 18],
      [6.2, 18],
      [-4.8, 21.5],
      [4.8, 21.5],
    ] as const) {
      wires.push(wire(new Vector3(ta[0] + dx, y, ta[1]), new Vector3(tb[0] + dx, y, tb[1]), 3.2));
    }
  }
  g.add(new Mesh(mergeGeometries(wires), m.black));

  zone.lights.push(
    { position: [0, 3.1, 2.4], color: "#ffcf96", intensity: 26, distance: 14 },
    { position: [0, 2.2, -3], color: "#ffd8aa", intensity: 18, distance: 12 },
    { position: [-12, 5, 12], color: "#9fc4ff", intensity: 14, distance: 22 },
  );
  return zone;
};
