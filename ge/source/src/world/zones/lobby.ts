import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { company, timeline } from "@/content";
import { box, merged, partition, placed, plane, pool, room } from "../kit";
import { energyMaterial } from "../materials";
import { image, label } from "../textures";
import { plaque } from "./painters";
import { createZone, cue, glowMaterial, type ZoneBuilder } from "./shared";

export const buildLobby: ZoneBuilder = async (context) => {
  const { m } = context;
  const plaques = timeline.map((item, index) => ({ item, label: label(`plaque-${index}`, 640, 440, plaque(item.year, item.title, item.body, 0)), lit: -1 }));
  const energy = energyMaterial("#ffc58a", 5);

  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, -0.5, 3.4);
    plaques.forEach((entry, index) => {
      const lit = Math.round(cue(reveal, index * 0.18, index * 0.18 + 0.3) * 20) / 20;
      if (lit !== entry.lit) {
        entry.lit = lit;
        entry.label.redraw(plaque(entry.item.year, entry.item.title, entry.item.body, lit));
      }
    });
    energy.uniforms.uPower!.value = reveal;
    energy.uniforms.uTime!.value = frame.time;
  });
  zone.own(energy);
  const g = zone.group;

  g.add(room(m, { width: 12, height: 5.2, near: 0, far: -16, strips: 2 }));
  g.add(partition(m, -16, 12, 5.2));

  plaques.forEach((entry, index) => {
    const material = zone.own(new MeshBasicMaterial({ map: entry.label.texture, toneMapped: false }));
    const z = -10 - index * 2;
    g.add(box(m.darkMetal, [0.08, 1.52, 2.22], [5.94, 2.25, z]));
    g.add(plane(material, 2.1, 2.1 / entry.label.aspect, [5.88, 2.25, z], [0, -Math.PI / 2, 0]));
    g.add(box(m.lightWarm, [0.05, 0.03, 1.9], [5.82, 3.12, z]));
  });
  const bus = new Mesh(new PlaneGeometry(7.4, 0.08), energy);
  bus.position.set(5.86, 1.32, -13);
  bus.rotation.y = -Math.PI / 2;
  g.add(bus, box(m.copper, [0.03, 0.05, 7.6], [5.92, 1.32, -13]));

  g.add(box(m.wood, [1.0, 1.1, 4.6], [-3.6, 0.55, -8.5]));
  g.add(box(m.copper, [1.12, 0.05, 4.72], [-3.6, 1.12, -8.5]));
  g.add(box(m.lightWarm, [0.02, 0.03, 4.4], [-3.08, 0.12, -8.5]));
  const logo = zone.own(glowMaterial(image(`/GithubPages/ge/${company.logo.src}`), 1.4));
  g.add(box(m.wallDark, [0.1, 1.4, 6.6], [-5.94, 3.1, -8.5]));
  g.add(plane(logo, 6, 6 / (company.logo.width / company.logo.height), [-5.87, 3.1, -8.5], [0, Math.PI / 2, 0]));

  const benches: BufferGeometry[] = [placed(new BoxGeometry(0.7, 0.45, 2.4), [3.4, 0.225, -6]), placed(new BoxGeometry(0.7, 0.45, 2.4), [-1.6, 0.225, -14])];
  g.add(merged(m.fabric, benches));
  for (const z of [-4, -8.5, -13]) g.add(pool(m, [0, 0, z], 5));
  g.add(pool(m, [4.6, 0, -13], 7));

  zone.lights.push(
    { position: [3.8, 4.2, -12], color: "#ffd8aa", intensity: 30, distance: 12 },
    { position: [-3, 4.2, -7], color: "#fff1e0", intensity: 20, distance: 12 },
  );
  return zone;
};
