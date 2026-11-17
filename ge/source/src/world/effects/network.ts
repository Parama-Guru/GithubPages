import { AdditiveBlending, DoubleSide, Mesh, ShaderMaterial, Vector4, type BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import fragmentShader from "../shaders/network.frag";
import vertexShader from "../shaders/network.vert";
import { feeds, flows, routes, type Feed } from "./routes";

/** power: steady level; reach: metres energised from the source; boost: extra level up to `front` (a power-up). */
export type FeedState = { power: number; reach: number; boost: number; front: number; speed: number };

const SLOTS = 8;

export type Network = {
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  set(feed: Feed, state: Partial<FeedState>): void;
  /** Advances every feed's comets by its speed (metres per second). */
  flow(delta: number): void;
  /** True when no feed is on (the mesh is then hidden). */
  readonly idle: boolean;
  dispose(): void;
};

/**
 * Every energised conductor in the facility (effects/routes.ts) as one mesh and one draw call: per feed, uniform arrays
 * hold its power, how far it is energised, a travelling power-up and its flow; the comets run in the fragment shader.
 */
export function createNetwork(): Network {
  const pieces = routes();
  const geometry = mergeGeometries(pieces, false);
  for (const piece of pieces) piece.dispose();
  const feed = Array.from({ length: SLOTS }, () => new Vector4(0, 1e4, 0, 0));
  const flow = Array.from({ length: SLOTS }, (_, index) => {
    const key = feeds[index];
    return key ? new Vector4(0, flows[key].spacing, flows[key].base, flows[key].tail) : new Vector4(0, 1, 0, 0.5);
  });
  const speeds = new Array<number>(SLOTS).fill(0);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uFeed: { value: feed }, uFlow: { value: flow } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "power-network";
  // One mesh spans the whole facility; feeds out of view are collapsed in the vertex shader instead.
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return {
    mesh,
    set(key, state) {
      const index = feeds.indexOf(key);
      const vector = feed[index] as Vector4;
      if (state.power !== undefined) vector.x = state.power;
      if (state.reach !== undefined) vector.y = state.reach;
      if (state.boost !== undefined) vector.z = state.boost;
      if (state.front !== undefined) vector.w = state.front;
      if (state.speed !== undefined) speeds[index] = state.speed;
    },
    flow(delta) {
      // Travel is integrated here rather than time × speed in the shader, so a change of speed never makes comets jump.
      flow.forEach((vector, index) => (vector.x = (vector.x + delta * (speeds[index] ?? 0)) % (vector.y * 1000)));
    },
    get idle() {
      return feed.every((vector) => vector.x + vector.z <= 0.001);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
