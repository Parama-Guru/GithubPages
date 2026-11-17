import { BoxGeometry, BufferGeometry, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Mesh, PlaneGeometry, ShaderMaterial, type Vector3 } from "three";
import { clients } from "@/content";
import { box, merged, partition, placed, pool, room } from "../kit";
import fragmentShader from "../shaders/plate.frag";
import vertexShader from "../shaders/plate.vert";
import { label } from "../textures";
import { letterbox, loadImage } from "./painters";
import { createZone, cue, pause, type ZoneBuilder } from "./shared";

const CELL = { width: 512, height: 288 };
const COLUMNS = 4;

export const buildGallery: ZoneBuilder = async (context) => {
  const { m } = context;
  const logos = clients.logos;
  const rows = Math.ceil(logos.length / COLUMNS);
  const images = await Promise.all(logos.map((logo) => loadImage(`/GithubPages/ge/${logo.src}`)));
  // Every plate is a cell of one atlas, so the twelve lightboxes are a single instanced draw.
  const atlas = label("logo-atlas", CELL.width * COLUMNS, CELL.height * rows, () => undefined);
  const painter = (atlas.texture.image as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
  for (const [index] of logos.entries()) {
    // A few plates per task: painting them all at once was a long task on a phone.
    if (index % 3 === 0) await pause();
    painter.save();
    painter.translate((index % COLUMNS) * CELL.width, Math.floor(index / COLUMNS) * CELL.height);
    letterbox(images[index] ?? null)(painter, CELL.width, CELL.height);
    painter.restore();
  }
  atlas.texture.needsUpdate = true;

  const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms: { uMap: { value: atlas.texture } }, toneMapped: false });
  const plates = new InstancedMesh(new PlaneGeometry(1.6, 0.9), material, logos.length);
  const cells = new Float32Array(logos.length * 4);
  const tint = new InstancedBufferAttribute(new Float32Array(logos.length * 3), 3).setUsage(DynamicDrawUsage);
  // Picking and the click-to-page flight use an invisible stand-in per plate; its plate follows it when drawn.
  const standIns: Mesh[] = [];
  const shown = new Array<number>(logos.length).fill(-1);

  const zone = createZone(context, (frame) => {
    const reveal = cue(-frame.camera.z, 63, 65.4);
    logos.forEach((_, index) => {
      const order = (index % 6) / 6;
      const level = 0.06 + cue(reveal, order * 0.6, order * 0.6 + 0.4) * 0.78;
      if (Math.abs(level - (shown[index] ?? -1)) < 0.002) return;
      shown[index] = level;
      tint.setXYZ(index, level, level, level);
      tint.needsUpdate = true;
    });
  });
  zone.own(material);
  const g = zone.group;
  g.add(room(m, { width: 7, height: 4.4, near: -64, far: -80, strips: 1, wall: m.wallDark, floor: m.floorDark, wainscot: 0 }));
  g.add(partition(m, -80, 7, 4.4, 3.2, 3.2));

  logos.forEach((logo, index) => {
    const sideIndex = index % 6;
    const left = index < 6;
    const z = -66.4 - sideIndex * 2.2;
    g.add(box(m.darkMetal, [0.12, 1.02, 1.74], [left ? -3.46 : 3.46, 1.9, z]));
    const standIn = new Mesh(new PlaneGeometry(1.6, 0.9), m.black);
    standIn.position.set(left ? -3.38 : 3.38, 1.9, z);
    standIn.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
    standIn.visible = false;
    standIn.updateMatrix();
    plates.setMatrixAt(index, standIn.matrix);
    standIns.push(standIn);
    g.add(standIn);
    zone.pickables.push({ object: standIn, id: "route:clients", label: logo.alt });
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    cells.set([1 / COLUMNS, 1 / rows, column / COLUMNS, 1 - (row + 1) / rows], index * 4);
    g.add(pool(m, [left ? -2.6 : 2.6, 0, z], 2));
  });
  plates.geometry.setAttribute("aCell", new InstancedBufferAttribute(cells, 4));
  plates.geometry.setAttribute("aTint", tint);
  plates.computeBoundingSphere();
  // A plate flown towards the camera (World.presentPick moves its stand-in) is drawn where its stand-in is.
  const drawn = standIns.map((standIn) => standIn.position.clone());
  plates.onBeforeRender = () => {
    standIns.forEach((standIn, index) => {
      const last = drawn[index] as Vector3;
      if (standIn.position.equals(last)) return;
      last.copy(standIn.position);
      standIn.updateMatrix();
      plates.setMatrixAt(index, standIn.matrix);
      plates.instanceMatrix.needsUpdate = true;
    });
  };
  g.add(plates);
  const rails: BufferGeometry[] = [placed(new BoxGeometry(0.04, 0.04, 15), [-3.4, 0.6, -72]), placed(new BoxGeometry(0.04, 0.04, 15), [3.4, 0.6, -72])];
  g.add(merged(m.copper, rails));

  zone.lights.push({ position: [0, 4, -72], color: "#f4f1ea", intensity: 24, distance: 12 });
  return zone;
};
