import { BoxGeometry, BufferGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Material, type Object3D, type Texture, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Materials } from "./materials";

export type Vec = [number, number, number];

export type LightSpec = { position: Vec; color: string; intensity: number; distance: number };

export type Pickable = { object: Object3D; id: string; label: string };

export type Frame = { time: number; delta: number; camera: Vector3; panel: number; motion: boolean };

export type Zone = {
  group: Group;
  lights: LightSpec[];
  pickables: Pickable[];
  update(frame: Frame): void;
  dispose(): void;
};

export function scaleUv(geometry: BufferGeometry, u: number, v: number): BufferGeometry {
  const uv = geometry.getAttribute("uv");
  if (!uv) return geometry;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  uv.needsUpdate = true;
  return geometry;
}

export function boxGeometry(w: number, h: number, d: number, tile = 2): BufferGeometry {
  const geometry = new BoxGeometry(w, h, d);
  const uv = geometry.getAttribute("uv");
  const normal = geometry.getAttribute("normal");
  if (!uv || !normal) return geometry;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const [su, sv] = nx > 0.5 ? [d, h] : ny > 0.5 ? [w, d] : [w, h];
    uv.setXY(i, (uv.getX(i) * su) / tile, (uv.getY(i) * sv) / tile);
  }
  uv.needsUpdate = true;
  return geometry;
}

export function box(material: Material, size: Vec, position: Vec, tile = 2): Mesh {
  const mesh = new Mesh(boxGeometry(size[0], size[1], size[2], tile), material);
  mesh.position.set(...position);
  return mesh;
}

export function plane(material: Material, width: number, height: number, position: Vec, rotation: Vec = [0, 0, 0], tile = 0): Mesh {
  const geometry = new PlaneGeometry(width, height);
  if (tile > 0) scaleUv(geometry, width / tile, height / tile);
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
}

export function cylinder(material: Material, radius: number, height: number, position: Vec, segments = 24, radiusBottom = radius): Mesh {
  const mesh = new Mesh(new CylinderGeometry(radius, radiusBottom, height, segments), material);
  mesh.position.set(...position);
  return mesh;
}

export function merged(material: Material, parts: BufferGeometry[]): Mesh {
  const geometry = mergeGeometries(parts, false);
  for (const part of parts) part.dispose();
  return new Mesh(geometry, material);
}

export function placed(geometry: BufferGeometry, position: Vec, rotation: Vec = [0, 0, 0]): BufferGeometry {
  const holder = new Mesh(geometry);
  holder.position.set(...position);
  holder.rotation.set(...rotation);
  holder.updateMatrix();
  return geometry.applyMatrix4(holder.matrix);
}

export type Room = { width: number; height: number; near: number; far: number; floor?: Material; wall?: Material; ceiling?: Material; strips?: number; stripMaterial?: Material };

export function room(m: Materials, spec: Room): Group {
  const group = new Group();
  const depth = spec.near - spec.far;
  const centre = (spec.near + spec.far) / 2;
  const floor = plane(spec.floor ?? m.floor, spec.width, depth, [0, 0, centre], [-Math.PI / 2, 0, 0], 2);
  const ceiling = plane(spec.ceiling ?? m.ceiling, spec.width, depth, [0, spec.height, centre], [Math.PI / 2, 0, 0], 2);
  const left = plane(spec.wall ?? m.wall, depth, spec.height, [-spec.width / 2, spec.height / 2, centre], [0, Math.PI / 2, 0], 3);
  const right = plane(spec.wall ?? m.wall, depth, spec.height, [spec.width / 2, spec.height / 2, centre], [0, -Math.PI / 2, 0], 3);
  group.add(floor, ceiling, left, right);
  const strips = spec.strips ?? 2;
  const stripParts: BufferGeometry[] = [];
  for (let i = 0; i < strips; i++) {
    const x = strips === 1 ? 0 : -spec.width / 4 + (i * (spec.width / 2)) / (strips - 1);
    stripParts.push(placed(new BoxGeometry(0.12, 0.04, depth - 1.6), [x, spec.height - 0.03, centre]));
  }
  if (stripParts.length) group.add(merged(spec.stripMaterial ?? m.lightStrip, stripParts));
  const shade = 1.1;
  for (const side of [-1, 1]) {
    const floorShade = plane(m.corner, shade, depth, [side * (spec.width / 2 - shade / 2), 0.008, centre], [-Math.PI / 2, 0, 0]);
    floorShade.scale.x = -side;
    floorShade.renderOrder = 1;
    const wallShade = plane(m.corner, shade, depth, [side * (spec.width / 2 - 0.01), shade / 2, centre], [0, side * -Math.PI / 2, Math.PI / 2]);
    wallShade.renderOrder = 1;
    const ceilingShade = plane(m.corner, shade * 0.8, depth, [side * (spec.width / 2 - shade * 0.4), spec.height - 0.01, centre], [Math.PI / 2, 0, 0]);
    ceilingShade.scale.x = -side;
    group.add(floorShade, wallShade, ceilingShade);
  }
  return group;
}

export function partition(m: Materials, z: number, width: number, height: number, opening = 3.2, openingHeight = 3.2, material?: Material): Group {
  const group = new Group();
  const wall = material ?? m.wallDark;
  const side = (width - opening) / 2;
  group.add(box(wall, [side, height, 0.3], [-(opening / 2 + side / 2), height / 2, z]));
  group.add(box(wall, [side, height, 0.3], [opening / 2 + side / 2, height / 2, z]));
  group.add(box(wall, [opening, height - openingHeight, 0.3], [0, openingHeight + (height - openingHeight) / 2, z]));
  const frame: BufferGeometry[] = [
    placed(new BoxGeometry(0.08, openingHeight, 0.36), [-opening / 2, openingHeight / 2, z]),
    placed(new BoxGeometry(0.08, openingHeight, 0.36), [opening / 2, openingHeight / 2, z]),
    placed(new BoxGeometry(opening + 0.08, 0.08, 0.36), [0, openingHeight, z]),
  ];
  group.add(merged(m.copper, frame));
  group.add(box(m.lightWarm, [opening - 0.4, 0.03, 0.05], [0, openingHeight - 0.08, z - 0.2]));
  return group;
}

export function pool(m: Materials, position: Vec, size: number, cool = false): Mesh {
  const mesh = plane(cool ? m.poolCool : m.pool, size, size, [position[0], position[1] + 0.012, position[2]], [-Math.PI / 2, 0, 0]);
  mesh.renderOrder = 2;
  return mesh;
}

export function contactShadow(m: Materials, position: Vec, width: number, depth: number): Mesh {
  const mesh = plane(m.shadow, width, depth, [position[0], position[1] + 0.006, position[2]], [-Math.PI / 2, 0, 0]);
  mesh.renderOrder = 1;
  return mesh;
}

export function framed(m: Materials, texture: Texture, width: number, height: number, position: Vec, rotationY = 0, backlit = false): Group {
  const group = new Group();
  group.add(box(m.darkMetal, [width + 0.12, height + 0.12, 0.06], [0, 0, -0.03]));
  const faceMaterial = backlit
    ? new MeshBasicMaterial({ map: texture, toneMapped: false })
    : Object.assign(m.enamel.clone(), { map: texture, color: m.enamel.color.clone().set("#ffffff"), roughness: 0.55, metalness: 0 });
  group.add(plane(faceMaterial, width, height, [0, 0, 0.005]));
  group.position.set(...position);
  group.rotation.y = rotationY;
  group.userData.ownedMaterials = [faceMaterial];
  return group;
}

export function batch(group: Group, keep: Set<Object3D>): number {
  const buckets = new Map<Material, Mesh[]>();
  for (const child of [...group.children]) {
    const mesh = child as Mesh;
    if (!mesh.isMesh || (mesh as unknown as { isInstancedMesh?: boolean }).isInstancedMesh || keep.has(mesh) || child.userData.shared || Array.isArray(mesh.material)) continue;
    const list = buckets.get(mesh.material as Material) ?? [];
    list.push(mesh);
    buckets.set(mesh.material as Material, list);
  }
  let removed = 0;
  for (const [material, meshes] of buckets) {
    if (meshes.length < 2) continue;
    const parts = meshes.map((mesh) => {
      mesh.updateMatrix();
      const geometry = mesh.geometry.clone();
      return geometry.applyMatrix4(mesh.matrix);
    });
    if (new Set(parts.map((part) => Boolean(part.index))).size > 1) continue;
    const combined = new Mesh(mergeGeometries(parts, false), material);
    combined.renderOrder = meshes[0]?.renderOrder ?? 0;
    for (const part of parts) part.dispose();
    for (const mesh of meshes) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    group.add(combined);
    removed += meshes.length - 1;
  }
  return removed;
}

export function disposeGroup(group: Object3D, shared: Set<Material>): void {
  group.traverse((object) => {
    const mesh = object as Mesh;
    if (mesh.geometry && !object.userData.shared) mesh.geometry.dispose();
    for (const material of (object.userData.ownedMaterials as Material[] | undefined) ?? []) if (!shared.has(material)) material.dispose();
  });
}
