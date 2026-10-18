import { BoxGeometry, BufferGeometry, MeshBasicMaterial } from "three";
import { whyUs } from "@/content";
import { box, merged, partition, placed, plane, pool, room } from "../kit";
import { label } from "../textures";
import { diagram, statScreen } from "./painters";
import { createZone, cue, type ZoneBuilder } from "./shared";

const format = (value: number, final: string) => (final.includes(",") ? Math.round(value).toLocaleString("en-US") : String(Math.round(value)));

const VIDEO_WALL = { x: 6.9, y: 2.6, z: -25.2 };

export const buildControl: ZoneBuilder = async (context) => {
  const { m } = context;
  const stats = whyUs.statistics.map((stat, index) => ({
    stat,
    target: Number(stat.value.replace(/,/g, "")),
    label: label(`stat-${index}`, 720, 420, statScreen("0", stat.label, 0)),
    shown: "",
  }));
  const line = label("diagram", 900, 440, diagram(0));
  const principles = label("principles", 900, 440, (ctx, w, h) => {
    ctx.fillStyle = "#04101a";
    ctx.fillRect(0, 0, w, h);
    ctx.font = '800 92px "Big Shoulders Display Variable", sans-serif';
    whyUs.principles.forEach((item, index) => {
      ctx.fillStyle = index === 1 ? "#f2c08f" : "#eef2f4";
      ctx.fillText(item.title.toUpperCase(), 40, 130 + index * 120);
    });
  });
  let drawnDiagram = -1;

  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, 15.4, 19.4);
    stats.forEach((entry, index) => {
      const t = cue(reveal, index * 0.08, 0.7 + index * 0.08);
      const text = t >= 1 ? entry.stat.value : format(entry.target * t, entry.stat.value);
      if (text !== entry.shown) {
        entry.shown = text;
        entry.label.redraw(statScreen(text, entry.stat.label, t));
      }
    });
    const progress = Math.round(reveal * 30) / 30;
    if (progress !== drawnDiagram) {
      drawnDiagram = progress;
      line.redraw(diagram(progress));
    }
  });
  const g = zone.group;

  g.add(room(m, { width: 14, height: 5, near: -16, far: -32, strips: 3, stripMaterial: m.lightCool, floor: m.floorDark }));
  g.add(partition(m, -32, 14, 5));

  const screens = [
    ...stats.map((entry) => entry.label),
    { texture: line.texture, aspect: line.aspect },
    { texture: principles.texture, aspect: principles.aspect },
  ];
  const sw = 2.55;
  const sh = 1.5;
  screens.forEach((screen, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const z = VIDEO_WALL.z + (col - 1) * (sw + 0.12);
    const y = VIDEO_WALL.y + 0.81 - row * (sh + 0.12);
    const material = zone.own(new MeshBasicMaterial({ map: screen.texture, toneMapped: false }));
    material.color.setScalar(1.25);
    g.add(plane(material, sw, sh, [VIDEO_WALL.x - 0.02, y, z], [0, -Math.PI / 2, 0]));
  });
  g.add(box(m.black, [0.1, 2 * (sh + 0.12) + 0.3, 3 * (sw + 0.12) + 0.3], [VIDEO_WALL.x + 0.04, VIDEO_WALL.y, VIDEO_WALL.z]));

  const desk: BufferGeometry[] = [];
  const monitors: BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i - 2) * 0.22;
    const x = VIDEO_WALL.x - 4.6 + Math.cos(angle) * 0.6;
    const z = VIDEO_WALL.z + Math.sin(angle) * 4.6;
    desk.push(placed(new BoxGeometry(0.9, 0.78, 1.7), [x, 0.39, z], [0, -angle, 0]));
    monitors.push(placed(new BoxGeometry(0.04, 0.5, 0.9), [x + 0.3, 1.08, z], [0, -angle, 0.12]));
  }
  const consoleScreen = label("console", 512, 288, (ctx, w, h) => {
    ctx.fillStyle = "#06121c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(143,216,255,0.16)";
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(143,216,255,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    [0.7, 0.55, 0.62, 0.4, 0.46, 0.3, 0.36, 0.22].forEach((y, index) => ctx.lineTo(30 + index * 64, h * y));
    ctx.stroke();
    ctx.fillStyle = "rgba(242,192,143,0.85)";
    for (let i = 0; i < 6; i++) ctx.fillRect(30 + i * 76, h - 40, 44, -(18 + ((i * 37) % 60)));
  });
  const consoleMaterial = zone.own(new MeshBasicMaterial({ map: consoleScreen.texture, toneMapped: false }));
  consoleMaterial.color.setScalar(0.85);
  g.add(merged(m.navy, desk), merged(consoleMaterial, monitors));
  g.add(box(m.copper, [0.04, 0.04, 14], [-6.94, 1.0, -24]));
  g.add(pool(m, [VIDEO_WALL.x - 3.4, 0, VIDEO_WALL.z], 8, true));
  g.add(pool(m, [0, 0, -20], 6, true), pool(m, [0, 0, -29], 5, true));

  zone.lights.push(
    { position: [3.2, 4.4, -25], color: "#9fd8ff", intensity: 34, distance: 13 },
    { position: [-3, 4.4, -20], color: "#e8f1ff", intensity: 18, distance: 12 },
  );
  return zone;
};
