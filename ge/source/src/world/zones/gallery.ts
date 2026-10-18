import { BoxGeometry, BufferGeometry, MeshBasicMaterial } from "three";
import { clients } from "@/content";
import { box, merged, partition, placed, plane, pool, room } from "../kit";
import { label } from "../textures";
import { letterbox, loadImage } from "./painters";
import { createZone, cue, type ZoneBuilder } from "./shared";

export const buildGallery: ZoneBuilder = async (context) => {
  const { m } = context;
  const images = await Promise.all(clients.logos.map((logo) => loadImage(`/GithubPages/ge/${logo.src}`)));
  const boxes = clients.logos.map((logo, index) => {
    const plate = label(`logo-${index}`, 512, 288, letterbox(images[index] ?? null));
    const material = new MeshBasicMaterial({ map: plate.texture, toneMapped: false });
    return { logo, material };
  });

  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, 63, 65.4);
    boxes.forEach((entry, index) => {
      const order = (index % 6) / 6;
      entry.material.color.setScalar(0.06 + cue(reveal, order * 0.6, order * 0.6 + 0.4) * 0.78);
    });
  });
  const g = zone.group;
  g.add(room(m, { width: 7, height: 4.4, near: -64, far: -80, strips: 1, wall: m.wallDark, floor: m.floorDark }));
  g.add(partition(m, -80, 7, 4.4, 3.2, 3.2));

  boxes.forEach((entry, index) => {
    zone.own(entry.material);
    const sideIndex = index % 6;
    const left = index < 6;
    const x = left ? -3.38 : 3.38;
    const z = -66.4 - sideIndex * 2.2;
    g.add(box(m.darkMetal, [0.12, 1.02, 1.74], [left ? -3.46 : 3.46, 1.9, z]));
    const face = plane(entry.material, 1.6, 0.9, [x, 1.9, z], [0, left ? Math.PI / 2 : -Math.PI / 2, 0]);
    g.add(face);
    zone.pickables.push({ object: face, id: "route:clients", label: entry.logo.alt });
    g.add(pool(m, [left ? -2.6 : 2.6, 0, z], 2));
  });
  const rails: BufferGeometry[] = [placed(new BoxGeometry(0.04, 0.04, 15), [-3.4, 0.6, -72]), placed(new BoxGeometry(0.04, 0.04, 15), [3.4, 0.6, -72])];
  g.add(merged(m.copper, rails));

  zone.lights.push({ position: [0, 4, -72], color: "#f4f1ea", intensity: 24, distance: 12 });
  return zone;
};
