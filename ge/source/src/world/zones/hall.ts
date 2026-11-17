import { BoxGeometry, BufferGeometry, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from "three";
import { projectGroups, projectImages } from "@/content";
import { animated, instance } from "../assets";
import { box, contactShadow, cylinder, framed, instancedCopies, merged, partition, placed, pool, room } from "../kit";
import { layout } from "../layout";
import { energyMaterial } from "../materials";
import { image, label } from "../textures";
import { sign } from "./painters";
import { createZone, cue, pause, type ZoneBuilder } from "./shared";

/** Parts inside a cabinet, which only the hero panel ever shows: the row's doors stay shut (9 draws instead of 16). */
const INSIDE = new Set(["Breaker", "Busbars", "Interior"]);

const HERO_PANEL = new Vector3(...layout.hall.heroPanel);

export const buildHall: ZoneBuilder = async (context) => {
  const { m } = context;
  const heroEnergy = energyMaterial("warm", 3);
  const rig = await animated("switchgear");
  const hero = rig.root;

  // The trunk, the trays and the hero panel's feeder carry current in effects/network.ts (feeds "trunk" and "feeder").
  const zone = createZone(context, (frame) => {
    rig.scrub(frame.panel);
    heroEnergy.uniforms.uPower!.value = cue(frame.panel, 0.55, 1);
    heroEnergy.uniforms.uTime!.value = frame.time;
  });
  zone.own(heroEnergy);
  const dispose = zone.dispose;
  zone.dispose = () => {
    rig.dispose();
    dispose();
  };
  const g = zone.group;

  g.add(room(m, { width: 12, height: 8, near: -32, far: -64, strips: 2, stripMaterial: m.lightCool }));
  g.add(partition(m, -64, 12, 8));

  const columns: BufferGeometry[] = [];
  for (let z = -35; z >= -62; z -= 6) for (const x of [-5.75, 5.75]) columns.push(placed(new BoxGeometry(0.5, 8, 0.5), [x, 4, z]));
  g.add(merged(m.wallDark, columns));
  const walkway: BufferGeometry[] = [placed(new BoxGeometry(0.1, 0.01, 31), [-3.1, 0.006, -48]), placed(new BoxGeometry(0.1, 0.01, 31), [3.1, 0.006, -48])];
  g.add(merged(m.amber, walkway));

  const transforms: Matrix4[] = [];
  const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
  for (let z = -35.6; z >= -61.6; z -= 0.82) {
    if (Math.abs(z - HERO_PANEL.z) < 0.5) continue;
    transforms.push(new Matrix4().compose(new Vector3(-4.2, 0, z), rotation, new Vector3(1, 1, 1)));
  }
  const rowSource = await instance("switchgear");
  g.add(instancedCopies(rowSource, transforms, INSIDE));
  g.add(contactShadow(m, [-4.2, 0, -48.6], 1.8, 27));

  hero.position.copy(HERO_PANEL);
  hero.rotation.y = Math.PI / 2;
  g.add(hero);
  zone.pickables.push({ object: hero, id: "panel", label: "Open the panel" });
  const heroGlow = new Mesh(new PlaneGeometry(0.62, 1.7), heroEnergy);
  heroGlow.position.set(-4.18 + 0.33, 1.25, HERO_PANEL.z);
  heroGlow.rotation.y = Math.PI / 2;
  g.add(heroGlow, pool(m, [-3.2, 0, HERO_PANEL.z], 3.2));
  // The ceiling spot whose beam falls on the hero panel (effects/shafts.ts).
  g.add(cylinder(m.darkMetal, 0.17, 0.26, [HERO_PANEL.x + 2.2, 7.87, HERO_PANEL.z], 16), cylinder(m.lightWarm, 0.13, 0.02, [HERO_PANEL.x + 2.2, 7.73, HERO_PANEL.z], 16));

  // The project-group signs share one texture (a band each), so the four are a single draw.
  const bands = projectGroups.length;
  const signs = label("year-signs", 900, 180 * bands, () => undefined);
  const painter = (signs.texture.image as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
  const faces: BufferGeometry[] = [];
  for (const [index, group] of projectGroups.entries()) {
    // One sign per task: painting them all at once was a long task on a phone.
    await pause();
    painter.save();
    painter.translate(0, index * 180);
    sign(group.label, "Projects")(painter, 900, 180);
    painter.restore();
    const z = -43 - index * 5;
    const face = new PlaneGeometry(2.6, 2.6 / 5);
    const uv = face.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setY(i, (uv.getY(i) + bands - 1 - index) / bands);
    faces.push(placed(face, [-3.55, 4.6, z], [0, Math.PI / 2, 0]));
    g.add(box(m.darkMetal, [0.02, 0.02, 0.02], [-3.6, 5.6, z]));
    g.add(box(m.steel, [0.02, 1.2, 0.02], [-3.56, 5.6, z - 1.1]), box(m.steel, [0.02, 1.2, 0.02], [-3.56, 5.6, z + 1.1]));
  }
  signs.texture.needsUpdate = true;
  g.add(merged(zone.own(new MeshBasicMaterial({ map: signs.texture, toneMapped: false })), faces));
  await pause();

  projectImages.forEach((photo, index) => {
    const z = -37.5 - index * 5.6;
    const frame = framed(m, image(`/GithubPages/ge/${photo.src}`), 3.8, 3.8 / (photo.width / photo.height), [5.62, 3.2, z], -Math.PI / 2, true);
    for (const material of frame.userData.ownedMaterials as MeshBasicMaterial[]) {
      material.color.setScalar(1.05);
      zone.own(material);
    }
    frame.userData.ownedMaterials = [];
    g.add(frame);
    zone.pickables.push({ object: frame, id: "route:projects", label: photo.label });
    g.add(pool(m, [4.6, 0, z], 3.4));
  });

  const trays: BufferGeometry[] = [];
  for (const x of [-4.6, 4.6]) {
    trays.push(placed(new BoxGeometry(0.04, 0.1, 31), [x - 0.3, 6, -48]), placed(new BoxGeometry(0.04, 0.1, 31), [x + 0.3, 6, -48]));
    for (let z = -33; z >= -63; z -= 0.6) trays.push(placed(new BoxGeometry(0.6, 0.03, 0.04), [x, 5.96, z]));
  }
  g.add(merged(m.steel, trays));
  const cables: BufferGeometry[] = [];
  for (const x of [-4.6, 4.6]) for (let k = 0; k < 4; k++) cables.push(placed(new BoxGeometry(0.06, 0.06, 31), [x - 0.2 + k * 0.13, 6.06, -48]));
  // The hero panel's feeder leaves the tray and drops onto the panel's roof.
  const drop = HERO_PANEL.x - 0.15;
  cables.push(placed(new BoxGeometry(0.05, layout.hall.trays.y - 2.36, 0.05), [drop, (layout.hall.trays.y + 2.36) / 2, HERO_PANEL.z]));
  g.add(merged(m.black, cables));

  g.add(box(m.darkMetal, [0.7, 0.42, 31], [0, 6.8, -48]));

  zone.lights.push(
    { position: [-2.2, 3.4, -48.5], color: "#ffe3c0", intensity: 12, distance: 9 },
    { position: [2, 6.5, -40], color: "#cfe9ff", intensity: 40, distance: 18 },
    { position: [2, 6.5, -57], color: "#cfe9ff", intensity: 40, distance: 18 },
  );
  return zone;
};
