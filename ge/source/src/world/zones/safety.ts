import { BoxGeometry, BufferGeometry, CylinderGeometry, Group, MeshBasicMaterial, SphereGeometry } from "three";
import { box, merged, partition, placed, plane, pool, room } from "../kit";
import { label } from "../textures";
import { hazard } from "./painters";
import { ink } from "../ink";
import { createZone, cue, type ZoneBuilder } from "./shared";

export const buildSafety: ZoneBuilder = async (context) => {
  const { m } = context;
  const isolator = new Group();
  const tag = new Group();
  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, 79.4, 81.4);
    isolator.rotation.z = -cue(reveal, 0.2, 0.7) * Math.PI / 2;
    tag.visible = reveal > 0.7;
    tag.rotation.z = Math.sin(frame.time * 1.6) * 0.06 * cue(reveal, 0.7, 1);
  });
  const g = zone.group;
  g.add(room(m, { width: 10, height: 4.5, near: -80, far: -94, strips: 2 }));
  g.add(partition(m, -94, 10, 4.5));

  const stripes: BufferGeometry[] = [];
  for (let z = -81; z > -93; z -= 0.5) stripes.push(placed(new BoxGeometry(0.22, 0.012, 0.22), [3.3, 0.006, z], [0, Math.PI / 4, 0]));
  g.add(merged(m.amber, stripes));
  g.add(box(m.black, [0.6, 0.01, 12], [3.3, 0.004, -87]));

  g.add(box(m.wallDark, [0.08, 2.4, 6.4], [4.94, 1.8, -88.5]));
  const helmets: BufferGeometry[] = [];
  const brims: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const z = -86 - i * 0.9;
    helmets.push(placed(new SphereGeometry(0.17, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), [4.62, 2.5, z]));
    brims.push(placed(new CylinderGeometry(0.21, 0.21, 0.02, 20), [4.62, 2.5, z]));
  }
  g.add(merged(m.amber, helmets), merged(m.enamel, brims));
  const vests: BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) vests.push(placed(new BoxGeometry(0.04, 0.7, 0.55), [4.84, 1.35, -86.4 - i * 1.25]));
  g.add(merged(m.hazard, vests));
  const reflective: BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) reflective.push(placed(new BoxGeometry(0.05, 0.05, 0.56), [4.82, 1.25, -86.4 - i * 1.25]));
  g.add(merged(m.steel, reflective));

  const warning = label("hazard", 512, 460, hazard());
  const warningMaterial = zone.own(new MeshBasicMaterial({ map: warning.texture, toneMapped: false }));
  warningMaterial.color.setScalar(1.1);
  g.add(plane(warningMaterial, 0.9, 0.8, [4.9, 3.5, -88.5], [0, -Math.PI / 2, 0]));

  g.add(box(m.navy, [0.3, 0.9, 0.7], [4.78, 1.55, -91.8]));
  isolator.add(box(m.lightRed, [0.06, 0.38, 0.08], [0, 0.17, 0]));
  isolator.position.set(4.6, 1.6, -91.8);
  g.add(isolator);
  tag.add(box(m.amber, [0.02, 0.22, 0.14], [0, -0.16, 0]));
  tag.position.set(4.58, 1.42, -91.62);
  g.add(tag);
  g.add(box(m.lightRed, [0.24, 0.6, 0.24], [4.7, 0.3, -93.2]));
  g.add(box(m.steel, [0.08, 0.05, 5.2], [4.84, 2.4, -88.25]));

  const board = label("quality-board", 1024, 600, (ctx, w, h) => {
    ctx.fillStyle = ink.panel;
    ctx.fillRect(0, 0, w, h);
    ctx.font = '800 96px "Big Shoulders Display Variable", sans-serif';
    ["Quality Policy", "Quality Standards", "EHS Policy"].forEach((title, index) => {
      ctx.fillStyle = index === 2 ? ink.safety : ink.text;
      ctx.fillText(title.toUpperCase(), 60, 160 + index * 160);
      ctx.fillStyle = ink.accent;
      ctx.fillRect(60, 180 + index * 160, 120, 4);
    });
  });
  const boardMaterial = zone.own(new MeshBasicMaterial({ map: board.texture, toneMapped: false }));
  g.add(box(m.darkMetal, [0.08, 2.0, 3.4], [-4.95, 2.1, -87.5]));
  g.add(plane(boardMaterial, 3.2, 3.2 / board.aspect, [-4.9, 2.1, -87.5], [0, Math.PI / 2, 0]));
  g.add(pool(m, [3.6, 0, -88], 6), pool(m, [-3.6, 0, -87.5], 4));

  zone.lights.push({ position: [3, 4, -88.5], color: "#fff0d6", intensity: 30, distance: 10 }, { position: [-3, 4, -87], color: "#e9f2ff", intensity: 14, distance: 9 });
  return zone;
};
