import { Plane, Sphere, Vector3, type Object3D } from "three";
import type { ZoneKey } from "@/routes/routes";

/** The doorways between neighbouring rooms (all centred on x = 0, standing on the floor). */
export const doorways: { z: number; between: [ZoneKey, ZoneKey]; width: number; height: number }[] = [
  { z: 0, between: ["approach", "lobby"], width: 3.2, height: 3 },
  { z: -16, between: ["lobby", "control"], width: 3.2, height: 3.2 },
  { z: -32, between: ["control", "hall"], width: 3.2, height: 3.2 },
  { z: -64, between: ["hall", "gallery"], width: 3.2, height: 3.2 },
  { z: -80, between: ["gallery", "safety"], width: 3.2, height: 3.2 },
  { z: -94, between: ["safety", "office"], width: 3.2, height: 3.2 },
  { z: -110, between: ["office", "yard"], width: 3.2, height: 3 },
];

const MARGIN = 0.25;
const corners = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const centre = new Vector3();
const inside = new Vector3();

/**
 * The four planes through the camera and the edges of a doorway (normals pointing into the view through it), or null
 * when the camera is too close to the doorway for the view to be bounded by it.
 */
export function portalPlanes(camera: Vector3, doorway: (typeof doorways)[number], planes: Plane[] = [new Plane(), new Plane(), new Plane(), new Plane()]): Plane[] | null {
  if (Math.abs(camera.z - doorway.z) < 0.6) return null;
  const half = doorway.width / 2 + MARGIN;
  const top = doorway.height + MARGIN;
  corners[0]?.set(-half, -MARGIN, doorway.z);
  corners[1]?.set(half, -MARGIN, doorway.z);
  corners[2]?.set(half, top, doorway.z);
  corners[3]?.set(-half, top, doorway.z);
  centre.set(0, doorway.height / 2, doorway.z);
  // A point well inside the view through the doorway, to orient the planes.
  inside.copy(centre).multiplyScalar(2).sub(camera);
  corners.forEach((corner, index) => {
    const plane = planes[index] as Plane;
    plane.setFromCoplanarPoints(camera, corner, corners[(index + 1) % 4] as Vector3);
    if (plane.distanceToPoint(inside) < 0) plane.negate();
  });
  return planes;
}

const sphere = new Sphere();

/** Whether a world-space bounding sphere can be seen through the doorway (it lies beyond it and inside its planes). */
export function throughDoorway(bounds: Sphere, camera: Vector3, doorway: (typeof doorways)[number], planes: Plane[]): boolean {
  // Parts that reach the doorway's own wall (partitions, frames) are left alone.
  const side = Math.sign(doorway.z - camera.z);
  if ((bounds.center.z - doorway.z) * side < bounds.radius) return true;
  return planes.every((plane) => plane.distanceToPoint(bounds.center) >= -bounds.radius);
}

/**
 * Portal culling: a neighbouring room is only seen through its doorway, so its objects outside the view through the
 * doorway are moved to layer 1, which the camera does not draw (zones toggle `visible` themselves, so it is left alone).
 * Returns the number of objects culled.
 */
export function cullThroughDoorway(root: Object3D, camera: Vector3, doorway: (typeof doorways)[number] | null, planes: Plane[]): number {
  const bounded = doorway ? portalPlanes(camera, doorway, planes) : null;
  let culled = 0;
  root.traverse((object) => {
    const drawable = object as Object3D & { geometry?: { boundingSphere: Sphere | null; computeBoundingSphere(): void }; boundingSphere?: Sphere | null; isInstancedMesh?: boolean };
    if (!drawable.geometry) return;
    let seen = true;
    if (bounded && doorway) {
      let local = drawable.isInstancedMesh ? drawable.boundingSphere : drawable.geometry.boundingSphere;
      if (!local) {
        if (drawable.isInstancedMesh) (object as unknown as { computeBoundingSphere(): void }).computeBoundingSphere();
        else drawable.geometry.computeBoundingSphere();
        local = drawable.isInstancedMesh ? drawable.boundingSphere : drawable.geometry.boundingSphere;
      }
      if (local) seen = throughDoorway(sphere.copy(local).applyMatrix4(object.matrixWorld), camera, doorway, bounded);
    }
    object.layers.set(seen ? 0 : 1);
    if (!seen) culled++;
  });
  return culled;
}

/** The doorway between two neighbouring rooms. */
export function doorwayBetween(a: ZoneKey, b: ZoneKey) {
  return doorways.find(({ between }) => between.includes(a) && between.includes(b)) ?? null;
}
