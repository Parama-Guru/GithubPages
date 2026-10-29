import { BoxGeometry, BufferGeometry, MeshBasicMaterial } from "three";
import { downloads, leadership } from "@/content";
import { countNodes, organisation } from "@/content/organisation";
import { animated } from "../assets";
import { box, framed, merged, placed, plane, pool, room } from "../kit";
import { image, label } from "../textures";
import { orgBoard } from "./painters";
import { ink } from "../ink";
import { createZone, cue, type ZoneBuilder } from "./shared";

export const buildOffice: ZoneBuilder = async (context) => {
  const { m } = context;
  const total = countNodes(organisation);
  const board = label("org-board", 2048, 1024, orgBoard(0));
  let shown = -1;
  const exits = await animated("entrance");

  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, 93.4, 95.4);
    const count = Math.round(reveal * total) / total;
    if (count !== shown) {
      shown = count;
      board.redraw(orgBoard(count));
    }
    exits.scrub(cue(-frame.camera.z, 104.5, 108.8));
  });
  const dispose = zone.dispose;
  zone.dispose = () => {
    exits.dispose();
    dispose();
  };
  const g = zone.group;
  g.add(room(m, { width: 10, height: 4.2, near: -94, far: -110, strips: 2, stripMaterial: m.lightWarm, floor: m.floorDark }));

  const W = 10;
  const H = 4.2;
  const opening = 3.2;
  const side = (W - opening) / 2;
  g.add(box(m.wallDark, [side, H, 0.3], [-(opening / 2 + side / 2), H / 2, -110]), box(m.wallDark, [side, H, 0.3], [opening / 2 + side / 2, H / 2, -110]));
  g.add(box(m.wallDark, [opening, H - 3, 0.3], [0, 3 + (H - 3) / 2, -110]));
  exits.root.position.z = -110.05;
  g.add(exits.root);

  const boardMaterial = zone.own(new MeshBasicMaterial({ map: board.texture, toneMapped: false }));
  boardMaterial.color.setScalar(0.62);
  g.add(box(m.steel, [0.1, 2.0, 3.9], [-4.94, 2.0, -104.6]));
  g.add(plane(boardMaterial, 3.7, 1.85, [-4.88, 2.0, -104.6], [0, Math.PI / 2, 0]));
  zone.pickables.push({ object: g.children[g.children.length - 1]!, id: "route:organisation", label: "Organisation chart" });

  const portrait = framed(m, image(`/GithubPages/ge/${leadership.photo.src}`), 2.4, 2.4 / (leadership.photo.width / leadership.photo.height), [-4.9, 2.1, -108.2], Math.PI / 2);
  for (const material of portrait.userData.ownedMaterials) zone.own(material);
  portrait.userData.ownedMaterials = [];
  g.add(portrait);
  zone.pickables.push({ object: portrait, id: "route:leadership", label: "Leadership" });

  g.add(box(m.wood, [1.8, 0.06, 0.9], [0.4, 0.76, -101]));
  g.add(box(m.darkMetal, [1.7, 0.72, 0.06], [0.4, 0.38, -100.6]));
  g.add(box(m.fabric, [0.55, 0.5, 0.55], [0.4, 0.25, -101.9]));

  const shelf: BufferGeometry[] = [];
  for (const y of [0.4, 1.1, 1.8, 2.5]) shelf.push(placed(new BoxGeometry(0.4, 0.04, 3.2), [4.78, y, -104]));
  shelf.push(placed(new BoxGeometry(0.4, 2.3, 0.04), [4.78, 1.45, -102.4]), placed(new BoxGeometry(0.4, 2.3, 0.04), [4.78, 1.45, -105.6]));
  g.add(merged(m.wood, shelf));
  const binders: BufferGeometry[] = [];
  const colours = [m.navy, m.copper, m.amber];
  const spines = colours.map(() => [] as BufferGeometry[]);
  for (let shelfIndex = 0; shelfIndex < 3; shelfIndex++) {
    for (let i = 0; i < 9; i++) {
      const geometry = placed(new BoxGeometry(0.3, 0.5, 0.08), [4.74, 0.67 + shelfIndex * 0.7, -102.8 - i * 0.28]);
      (spines[(i + shelfIndex) % 3] ?? binders).push(geometry);
    }
  }
  spines.forEach((parts, index) => g.add(merged(colours[index] ?? m.navy, parts)));
  const plate = label("downloads-plate", 900, 180, (ctx, w, h) => {
    ctx.fillStyle = ink.sign;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = ink.accent;
    ctx.font = '500 34px "IBM Plex Mono", monospace';
    ctx.fillText("BROCHURES", 30, 60);
    ctx.fillStyle = ink.text;
    ctx.font = '600 30px "IBM Plex Sans", sans-serif';
    ctx.fillText(downloads.documents.join("  ·  "), 30, 130);
  });
  const plateMaterial = zone.own(new MeshBasicMaterial({ map: plate.texture, toneMapped: false }));
  g.add(plane(plateMaterial, 3, 0.6, [4.55, 3.05, -104], [0, -Math.PI / 2, 0]));
  zone.pickables.push({ object: g.children[g.children.length - 1]!, id: "route:downloads", label: "Downloads" });

  g.add(pool(m, [-3.6, 0, -104.6], 5), pool(m, [0.4, 0, -101], 4), pool(m, [3.8, 0, -104], 4));
  zone.lights.push({ position: [-2.4, 3.8, -104], color: "#ffe2bd", intensity: 28, distance: 10 }, { position: [2, 3.8, -99], color: "#ffd7a8", intensity: 18, distance: 10 });
  return zone;
};
