import { BoxGeometry, BufferGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Vector3 } from "three";
import { projectImages, projectYears } from "@/content";
import { animated, instance } from "../assets";
import { box, contactShadow, framed, merged, partition, placed, plane, pool, room } from "../kit";
import { energyMaterial } from "../materials";
import { image, label } from "../textures";
import { sign } from "./painters";
import { createZone, cue, type ZoneBuilder } from "./shared";

function instancedRow(source: Group, transforms: Matrix4[]): Group {
  const row = new Group();
  source.updateMatrixWorld(true);
  source.traverse((object: Object3D) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const local = mesh.matrixWorld.clone();
    const instanced = new InstancedMesh(mesh.geometry, mesh.material, transforms.length);
    transforms.forEach((transform, index) => instanced.setMatrixAt(index, transform.clone().multiply(local)));
    instanced.userData.shared = true;
    instanced.computeBoundingSphere();
    row.add(instanced);
  });
  return row;
}

const HERO_PANEL = new Vector3(-4.2, 0, -48.5);

export const buildHall: ZoneBuilder = async (context) => {
  const { m } = context;
  const energy = energyMaterial("cool", 14);
  const heroEnergy = energyMaterial("warm", 3);
  const rig = await animated("switchgear");
  const hero = rig.root;

  const zone = createZone(context, (frame) => {
    const power = cue(-frame.camera.z, 31.5, 38);
    energy.uniforms.uPower!.value = power * 0.85;
    energy.uniforms.uTime!.value = frame.time;
    rig.scrub(frame.panel);
    heroEnergy.uniforms.uPower!.value = cue(frame.panel, 0.55, 1);
    heroEnergy.uniforms.uTime!.value = frame.time;
  });
  zone.own(energy);
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
  g.add(instancedRow(rowSource, transforms));
  g.add(contactShadow(m, [-4.2, 0, -48.6], 1.8, 27));

  hero.position.copy(HERO_PANEL);
  hero.rotation.y = Math.PI / 2;
  g.add(hero);
  zone.pickables.push({ object: hero, id: "panel", label: "Open the panel" });
  const heroGlow = new Mesh(new PlaneGeometry(0.62, 1.7), heroEnergy);
  heroGlow.position.set(-4.18 + 0.33, 1.25, HERO_PANEL.z);
  heroGlow.rotation.y = Math.PI / 2;
  g.add(heroGlow, pool(m, [-3.2, 0, HERO_PANEL.z], 3.2));

  projectYears.forEach((year, index) => {
    const z = -43 - index * 5;
    const plate = label(`year-${year.slug}`, 900, 180, sign(year.years, "PROJECTS"));
    const material = zone.own(new MeshBasicMaterial({ map: plate.texture, toneMapped: false }));
    g.add(box(m.darkMetal, [0.02, 0.02, 0.02], [-3.6, 5.6, z]));
    g.add(plane(material, 2.6, 2.6 / plate.aspect, [-3.55, 4.6, z], [0, Math.PI / 2, 0]));
    g.add(box(m.steel, [0.02, 1.2, 0.02], [-3.56, 5.6, z - 1.1]), box(m.steel, [0.02, 1.2, 0.02], [-3.56, 5.6, z + 1.1]));
  });

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
  g.add(merged(m.black, cables));

  g.add(box(m.darkMetal, [0.7, 0.42, 31], [0, 6.8, -48]));
  const flow = new Mesh(new PlaneGeometry(31, 0.22), energy);
  flow.position.set(0, 6.58, -48);
  flow.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  g.add(flow);

  zone.lights.push(
    { position: [-2.2, 3.4, -48.5], color: "#ffe3c0", intensity: 12, distance: 9 },
    { position: [2, 6.5, -40], color: "#cfe9ff", intensity: 40, distance: 18 },
    { position: [2, 6.5, -57], color: "#cfe9ff", intensity: 40, distance: 18 },
  );
  return zone;
};
