import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial, Vector3, Vector4, type PointLight } from "three";
import { layout } from "../layout";
import { look } from "../look";
import fragmentShader from "../shaders/particles.frag";
import vertexShader from "../shaders/particles.vert";
import type { Shaft } from "./shafts";

const MOTES = 48;
const EMITTERS = 6;
const SHAFTS = 4;

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Where the corona glows: the foot of each insulator string, where it holds its conductor. */
export function emitters(): Vector3[] {
  const { phases, gantries, conductorY } = layout.yard;
  return gantries.flatMap((z) => phases.map((x) => new Vector3(x, conductorY + 0.06, z)));
}

export type ParticleState = {
  time: number;
  /** 0–1: dust shows only inside the building. */
  dust: number;
  /** 0–1: corona and ionised motes on the yard's insulators. */
  corona: number;
  lights: readonly PointLight[];
  shafts: readonly { shaft: Shaft; power: number }[];
  /** Pixels per metre at one metre: drawing-buffer height / (2 tan(fov / 2)). */
  pixels: number;
};

export type Particles = { points: Points<BufferGeometry, ShaderMaterial>; update(state: ParticleState): void; dispose(): void };

export function createParticles(dustCount: number): Particles {
  const random = seeded(1997);
  const count = dustCount + MOTES + EMITTERS;
  const seeds = new Float32Array(count * 3);
  const kinds = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    if (i < dustCount) {
      seeds.set([random(), random(), random()], i * 3);
      kinds.set([0, random()], i * 2);
    } else if (i < dustCount + MOTES) {
      const index = i - dustCount;
      seeds.set([((index % EMITTERS) + 0.5) / EMITTERS, random(), random()], i * 3);
      kinds.set([1, random()], i * 2);
    } else {
      const index = i - dustCount - MOTES;
      seeds.set([(index + 0.5) / EMITTERS, random(), 0], i * 3);
      kinds.set([2, 0], i * 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(seeds, 3));
  geometry.setAttribute("aKind", new BufferAttribute(kinds, 2));
  const uniforms = {
    uTime: { value: 0 },
    uBox: { value: new Vector3(13, 5.5, 15) },
    uDust: { value: 0 },
    uLightPosition: { value: Array.from({ length: 6 }, () => new Vector3()) },
    uLightColor: { value: Array.from({ length: 6 }, () => new Color(0, 0, 0)) },
    uShaftApex: { value: Array.from({ length: SHAFTS }, () => new Vector4()) },
    uShaftAxis: { value: Array.from({ length: SHAFTS }, () => new Vector4(0, -1, 0, 0)) },
    uShaftColor: { value: Array.from({ length: SHAFTS }, () => new Color(0, 0, 0)) },
    uEmitters: { value: emitters() },
    uCorona: { value: 0 },
    uPixels: { value: 800 },
    uDustTint: { value: new Color(look.glows.lightStrip[0]) },
    uMoteTint: { value: new Color(look.lightTint.cool) },
  };
  const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
  const points = new Points(geometry, material);
  points.name = "particles";
  // The motes are placed in the vertex shader, so the seeds' bounds mean nothing.
  points.frustumCulled = false;
  points.renderOrder = 5;
  const axis = new Vector3();
  return {
    points,
    update(state) {
      uniforms.uTime.value = state.time;
      uniforms.uDust.value = dustCount ? state.dust : 0;
      uniforms.uCorona.value = state.corona;
      uniforms.uPixels.value = state.pixels;
      state.lights.forEach((light, index) => {
        if (index >= 6) return;
        uniforms.uLightPosition.value[index]?.copy(light.position);
        uniforms.uLightColor.value[index]?.copy(light.color).multiplyScalar(light.intensity / 60);
      });
      for (let index = 0; index < SHAFTS; index++) {
        const entry = state.shafts[index];
        const apex = uniforms.uShaftApex.value[index] as Vector4;
        const colour = uniforms.uShaftColor.value[index] as Color;
        if (!entry) {
          colour.setRGB(0, 0, 0);
          continue;
        }
        const { shaft, power } = entry;
        axis.set(shaft.toward[0] - shaft.apex[0], shaft.toward[1] - shaft.apex[1], shaft.toward[2] - shaft.apex[2]);
        const length = axis.length();
        axis.normalize();
        apex.set(shaft.apex[0], shaft.apex[1], shaft.apex[2], length);
        uniforms.uShaftAxis.value[index]?.set(axis.x, axis.y, axis.z, shaft.radius / length);
        colour.set(shaft.colour).multiplyScalar(shaft.strength * power * 7);
      }
      points.visible = uniforms.uDust.value > 0.001 || state.corona > 0.001;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
