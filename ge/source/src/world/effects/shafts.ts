import { AdditiveBlending, Color, CylinderGeometry, DoubleSide, InstancedBufferAttribute, InstancedMesh, Matrix4, Quaternion, ShaderMaterial, Vector3 } from "three";
import type { ZoneKey } from "@/routes/routes";
import { layout } from "../layout";
import { look } from "../look";
import type { Vec3 } from "../math";
import { zoneOrder } from "../path";
import fragmentShader from "../shaders/shaft.frag";
import vertexShader from "../shaders/shaft.vert";

/**
 * A cone of light from a fixture (apex) towards where it lands; `top` is the fixture's radius as a share of `radius`;
 * `falloff` shapes how quickly it fades along its length (lower keeps the far end brighter).
 */
export type Shaft = { zone: ZoneKey; apex: Vec3; toward: Vec3; radius: number; top: number; colour: string; strength: number; falloff?: number };

export function shaftList(): Shaft[] {
  const warm = look.lightTint.warm;
  const cool = look.lightTint.cool;
  const list: Shaft[] = [];
  const { canopy } = layout.approach;
  for (const x of canopy.xs) for (const z of canopy.zs) list.push({ zone: "approach", apex: [x, canopy.y - 0.02, z], toward: [x, 0, z], radius: 0.82, top: 0.22, colour: warm, strength: 0.13 });
  // A spot over the walkway on the hero panel; only its lower part is in view at the hold, so it fades slowly.
  const [hx, , hz] = layout.hall.heroPanel;
  list.push({ zone: "hall", apex: [hx + 2.2, 7.9, hz], toward: [hx + 0.55, 0.3, hz], radius: 1.25, top: 0.08, colour: warm, strength: 0.16, falloff: 0.45 });
  list.push({ zone: "safety", apex: [3.6, 4.46, -88], toward: [3.6, 0, -88], radius: 1.45, top: 0.12, colour: warm, strength: 0.2 });
  for (const [x, z] of layout.yard.floodlights) {
    const head = x + (x < 0 ? 0.4 : -0.4);
    list.push({ zone: "yard", apex: [head, 8.92, z], toward: [x * 0.7, 0, z], radius: 4.2, top: 0.08, colour: cool, strength: 0.2 });
  }
  return list;
}

export type Shafts = { mesh: InstancedMesh<CylinderGeometry, ShaderMaterial>; list: Shaft[]; setPower(power: Record<ZoneKey, number>, time: number): void; dispose(): void };

export function createShafts(): Shafts {
  const list = shaftList();
  const geometry = new CylinderGeometry(1, 1, 1, 28, 6, true).translate(0, -0.5, 0);
  const groups = new Array<number>(8).fill(0);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uGroup: { value: groups }, uTime: { value: 0 } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
  const mesh = new InstancedMesh(geometry, material, list.length);
  mesh.name = "light-shafts";
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  const shaft = new Float32Array(list.length * 4);
  const colours = new Float32Array(list.length * 3);
  const matrix = new Matrix4();
  const down = new Vector3(0, -1, 0);
  list.forEach((entry, index) => {
    const apex = new Vector3(...entry.apex);
    const direction = new Vector3(...entry.toward).sub(apex);
    const length = direction.length();
    matrix.compose(apex, new Quaternion().setFromUnitVectors(down, direction.normalize()), new Vector3(entry.radius, length, entry.radius));
    mesh.setMatrixAt(index, matrix);
    shaft.set([zoneOrder.indexOf(entry.zone), entry.top, entry.falloff ?? 1.3, 0], index * 4);
    const colour = new Color(entry.colour).multiplyScalar(entry.strength);
    colours.set([colour.r, colour.g, colour.b], index * 3);
  });
  geometry.setAttribute("aShaft", new InstancedBufferAttribute(shaft, 4));
  geometry.setAttribute("aColor", new InstancedBufferAttribute(colours, 3));
  return {
    mesh,
    list,
    setPower(power, time) {
      zoneOrder.forEach((key, index) => (groups[index] = power[key] ?? 0));
      material.uniforms.uTime!.value = time;
      mesh.visible = groups.some((value) => value > 0.001);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      mesh.dispose();
    },
  };
}
