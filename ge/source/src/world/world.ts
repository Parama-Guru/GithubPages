import {
  BufferGeometry,
  Color,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  Mesh,
  NeutralToneMapping,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Material,
  type Object3D,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { ZoneKey } from "@/routes/routes";
import { preloadAssets, type AssetName } from "./assets";
import { look } from "./look";
import { batch, type Frame, type LightSpec, type Pickable, type Zone } from "./kit";
import { createMaterials, disposeMaterials, paintMaterials, skyMaterial, type SkyMaterial } from "./materials";
import { clamp01, lerpPose, smootherstep, type Pose } from "./math";
import { palette } from "./palette";
import { evenRanges, exposureAt, sampleJourney, travelAt, zoneAt, zoneOrder, type ChapterRange } from "./path";
import type { Post } from "./post";
import { disposeTextures, fontsReady } from "./textures";
import { pause, type Tier, type ZoneBuilder } from "./zones/shared";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Resolves when the browser is idle (or after `timeout` ms), for work that is only needed later. */
const idle = (timeout = 1500) =>
  new Promise<void>((resolve) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => resolve(), { timeout }) : setTimeout(resolve, 120)));

type Drawable = Mesh & { isInstancedMesh?: boolean; isBatchedMesh?: boolean; isSkinnedMesh?: boolean; instanceColor?: unknown };

/**
 * Meshes that draw a material already seen in another variant (e.g. the switchgear row is instanced, the hero panel
 * with the same materials is not). three's compile() prepares one program per material, so these are compiled on their
 * own; otherwise their program was linked synchronously on the first frame they appeared in (a 0.4 s freeze).
 */
function variants(root: Object3D): Object3D[] {
  const first = new Set<Material>();
  const seen = new Set<string>();
  const extra: Object3D[] = [];
  root.traverse((object) => {
    const mesh = object as Drawable;
    if (!mesh.isMesh) return;
    const flags = `${mesh.isInstancedMesh ? 1 : 0}${mesh.isBatchedMesh ? 1 : 0}${mesh.isSkinnedMesh ? 1 : 0}${mesh.instanceColor ? 1 : 0}${Object.keys(mesh.geometry.morphAttributes).length}`;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const key = `${material.uuid}|${flags}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (first.has(material)) extra.push(object);
      else first.add(material);
    }
  });
  return extra;
}

function texturesOf(root: Object3D): Set<Texture> {
  const found = new Set<Texture>();
  const add = (value: unknown) => {
    if ((value as Texture | null)?.isTexture) found.add(value as Texture);
  };
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      Object.values(material).forEach(add);
      const uniforms = (material as { uniforms?: Record<string, { value: unknown }> }).uniforms;
      if (uniforms) for (const uniform of Object.values(uniforms)) add(uniform.value);
    }
  });
  return found;
}

// Post-processing is only used above the low tier and picking acceleration only after the first frame,
// so both stay out of the critical download.
let postModule: typeof import("./post") | null = null;
const loadPost = () => import("./post").then((module) => (postModule = module));
let bvhReady = false;
const loadBvh = () =>
  import("three-mesh-bvh").then(({ acceleratedRaycast, computeBoundsTree, disposeBoundsTree }) => {
    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    Mesh.prototype.raycast = acceleratedRaycast;
    bvhReady = true;
  });

const builders: Record<ZoneKey, () => Promise<ZoneBuilder>> = {
  approach: () => import("./zones/approach").then((module) => module.buildApproach),
  lobby: () => import("./zones/lobby").then((module) => module.buildLobby),
  control: () => import("./zones/control").then((module) => module.buildControl),
  hall: () => import("./zones/hall").then((module) => module.buildHall),
  gallery: () => import("./zones/gallery").then((module) => module.buildGallery),
  safety: () => import("./zones/safety").then((module) => module.buildSafety),
  office: () => import("./zones/office").then((module) => module.buildOffice),
  yard: () => import("./zones/yard").then((module) => module.buildYard),
};

const LIGHTS = 6;
const exterior = new Set<ZoneKey>(["approach", "yard"]);
const zoneAssets: Record<ZoneKey, AssetName[]> = {
  approach: ["transformer", "tower", "entrance"],
  lobby: [],
  control: [],
  hall: ["switchgear"],
  gallery: [],
  safety: [],
  office: ["entrance"],
  yard: ["transformer", "insulator", "tower"],
};

// The world is shown on the home page only (the other pages share the 2D design), so the camera follows the journey.
export type Target = { kind: "journey" };

type WorldOptions = {
  canvas: HTMLCanvasElement;
  tier: Tier;
  motion: boolean;
  onProgress?: (value: number) => void;
  onHover?: (label: string | null, x: number, y: number) => void;
  onPick?: (id: string) => void;
};

export type Metrics = { calls: number; triangles: number; geometries: number; textures: number; zone: ZoneKey; tier: Tier; frameMs: number; zones: number };

export class World {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(42, 1, 0.1, 900);
  private readonly materials = createMaterials();
  private readonly zones = new Map<ZoneKey, Zone>();
  private readonly building = new Map<ZoneKey, Promise<Zone>>();
  private readonly pool: PointLight[] = [];
  private readonly sky: Mesh<SphereGeometry, SkyMaterial>;
  private readonly hemisphere: HemisphereLight;
  private readonly sun = new DirectionalLight();
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2(2, 2);
  private readonly parallax = new Vector2();
  private readonly parallaxTarget = new Vector2();
  private post: Post | null = null;
  private tier: Tier;
  private motion: boolean;
  private target: Target = { kind: "journey" };
  private ranges: ChapterRange[] = evenRanges(8);
  private journey = 0;
  private transition: { from: Pose; start: number; duration: number } | null = null;
  private panel = 0;
  private dirty = true;
  private running = false;
  private frame = 0;
  private last = performance.now();
  private clock = 0;
  private frameTimes: number[] = [];
  private hovered: Pickable | null = null;
  private pickables: Pickable[] = [];
  private readonly options: WorldOptions;
  private disposed = false;
  private focus = 0;
  private lastZone: ZoneKey = "approach";
  private readonly tints = { warm: new Color(look.lightTint.warm), cool: new Color(look.lightTint.cool) };
  private readonly lightColor = new Color();
  private present: { object: Object3D; from: Vector3; to: Vector3; start: number; duration: number; restore: boolean; done: () => void } | null = null;
  // Read once per resize: reading window.innerWidth/innerHeight on every pointer move or frame forces a layout.
  private viewport = { width: window.innerWidth, height: window.innerHeight };
  // Bound while compiling streamed zones under post-processing, which draws the scene into a render target.
  private readonly warmTarget = new WebGLRenderTarget(1, 1);
  private booted = false;
  private readonly uploaded = new WeakSet<Texture>();
  private pumping = false;
  private switching = false;
  private indexing = false;
  private reindex = false;
  private readonly lightSpecs: LightSpec[] = [];
  private readonly specColors = new WeakMap<LightSpec, Color>();
  private readonly aim = new Vector3();
  private readonly written = new Map<string, string>();
  private frames: number;

  constructor(options: WorldOptions) {
    this.options = options;
    this.tier = options.tier;
    this.motion = options.motion;
    this.frames = Number(options.canvas.dataset.frames ?? 0);
    this.renderer = new WebGLRenderer({ canvas: options.canvas, antialias: options.tier === "low", powerPreference: "high-performance", alpha: false, stencil: false });
    // Reading a shader's info log waits for the GPU process to finish everything queued before it; the shaders are
    // fixed, so production builds skip the check (a stall of up to half a second when a new room first appeared).
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.info.autoReset = false;
    this.scene.background = new Color();
    this.scene.fog = new FogExp2("#070b12", 0.014);
    this.scene.environmentIntensity = 0.35;
    this.hemisphere = new HemisphereLight();
    this.scene.add(this.hemisphere);
    // A low warm sun behind the camera's right shoulder lights the façade and the yard; it is off indoors.
    this.sun.position.set(40, 46, 70);
    this.sun.target.position.set(0, 0, -40);
    this.scene.add(this.sun, this.sun.target);
    for (let i = 0; i < LIGHTS; i++) {
      const light = new PointLight("#ffffff", 0, 10, 2);
      this.pool.push(light);
      this.scene.add(light);
    }
    this.sky = new Mesh(new SphereGeometry(700, 32, 16), skyMaterial());
    this.sky.renderOrder = -10;
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
    options.canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.applyTier();
    this.applyPalette();
    this.resize();
  }

  private applyPalette(): void {
    this.renderer.setClearColor(palette.background);
    (this.scene.background as Color).set(palette.background);
    this.hemisphere.color.set(palette.hemiSky);
    this.hemisphere.groundColor.set(palette.hemiGround);
    this.hemisphere.intensity = palette.hemi;
    this.sun.color.set(palette.sun);
    this.options.canvas.dataset.look = `${look.surfaces.copper?.color ?? ""}|${look.ink.accent}|${look.models.PanelEnamel?.color ?? ""}`;
  }

  async load(initial: Target): Promise<void> {
    this.target = initial;
    const pose = this.currentTargetPose();
    const zone = zoneAt(pose.position[2]);
    const index = zoneOrder.indexOf(zone);
    const needed = [zone, zoneOrder[index + 1]].filter(Boolean) as ZoneKey[];
    const assets = [...new Set(needed.flatMap((key) => zoneAssets[key]))];
    let done = 0;
    const total = assets.length + needed.length + 1;
    const step = () => this.options.onProgress?.(++done / total);
    // Request fonts, models, zone code and post-processing together instead of one after another.
    const fonts = fontsReady().then(step);
    const models = preloadAssets(assets, step);
    const modules = needed.map((key) => builders[key]());
    const post = this.tier === "low" ? null : loadPost().then(() => !this.disposed && this.applyTier());
    // Each of the next steps starts in a task of its own (the renderer's context set-up took the one before).
    await pause();
    const environment = this.environment();
    await pause();
    const surfaces = paintMaterials(this.materials, pause);
    await fonts;
    await Promise.all([...needed.map((key) => this.ensure(key).then(step)), models, ...modules, post, environment, surfaces]);
    this.applyPose();
    // Textures go up one per task and the programs link in the background; the first frame then only draws. Left to
    // that frame, uploads and links froze the poster-to-scene cross-fade half way (a washed-out double exposure).
    await this.upload(this.scene);
    await this.warm();
    await this.settle();
    this.booted = true;
    this.renderOnce(performance.now());
    // The page wires the journey up when this resolves: in a task after the first frame's, not in it.
    await pause();
    void idle(4000)
      .then(loadBvh)
      .then(() => this.indexPickables())
      .catch(() => undefined);
  }

  /**
   * The soft room reflections (PMREM of three's RoomEnvironment). Its filter shaders took about a second to compile
   * on the main thread, so a first dry run turns every internal draw into compileAsync; the real pass then only draws.
   * It must be set before warm(), because the scene's shaders are compiled for an environment map.
   */
  private async environment(): Promise<void> {
    const renderer = this.renderer;
    const room = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const pending: Promise<unknown>[] = [];
    const render = renderer.render;
    renderer.render = (scene, camera) => void pending.push(renderer.compileAsync(scene, camera));
    try {
      pmrem.fromScene(room, 0.04).dispose();
    } finally {
      renderer.render = render;
    }
    await Promise.all(pending);
    if (!this.disposed) this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.dispose();
  }

  /**
   * Compiles every shader the first frame needs without blocking the main thread: with KHR_parallel_shader_compile
   * the driver compiles in the background and compileAsync resolves once all programs are linked. Under
   * post-processing one dry run of the composer turns each internal draw into compileAsync while that pass's render
   * target is bound, so every program is built in the variant (colour space, tone mapping) it is really drawn with.
   */
  private async warm(): Promise<void> {
    const renderer = this.renderer;
    if (!this.post) {
      await Promise.all([renderer.compileAsync(this.scene, this.camera), ...variants(this.scene).map((object) => renderer.compileAsync(object, this.camera, this.scene))]);
      await this.linked();
      return;
    }
    const pending: Promise<unknown>[] = [];
    const render = renderer.render;
    renderer.render = (scene, camera) => void pending.push(renderer.compileAsync(scene, camera));
    try {
      // Non-zero focus so the depth-of-field bokeh passes are drawn (and compiled) too.
      this.post.render(0, 1, 10);
      renderer.setRenderTarget(this.warmTarget);
      for (const object of variants(this.scene)) pending.push(renderer.compileAsync(object, this.camera, this.scene));
    } finally {
      renderer.render = render;
      renderer.setRenderTarget(null);
    }
    await Promise.all(pending);
    await this.linked();
  }

  /** Waits until the driver has linked every program created so far (each compileAsync only checks the last variant). */
  private async linked(): Promise<void> {
    const programs = (this.renderer.info.programs ?? []) as unknown as { isReady(): boolean }[];
    const deadline = performance.now() + 10000;
    while (!this.disposed && programs.some((program) => !program.isReady()) && performance.now() < deadline) await sleep(12);
  }

  /**
   * Uploads the textures of a subtree one per task, photos decoded off the main thread first. Left to the first frame
   * that showed them, a room's uploads took one long task (a photo is decoded on the main thread at upload).
   */
  private async upload(root: Object3D): Promise<void> {
    for (const texture of texturesOf(root)) {
      if (this.disposed) return;
      if (this.uploaded.has(texture)) continue;
      const ready = texture.userData.ready as Promise<void> | undefined;
      if (ready) await Promise.race([ready, sleep(2500)]);
      const source = texture.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap | null | undefined;
      if (!source) continue;
      if (source instanceof HTMLImageElement && (!source.complete || !source.naturalWidth)) continue;
      this.renderer.initTexture(texture);
      this.uploaded.add(texture);
      texture.addEventListener("dispose", () => this.uploaded.delete(texture));
      await pause();
    }
  }

  /** Waits, without blocking the main thread, until the GPU has carried out everything issued so far (the uploads). */
  private async settle(): Promise<void> {
    const gl = this.renderer.getContext();
    if (!(gl instanceof WebGL2RenderingContext)) return;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) return;
    gl.flush();
    const deadline = performance.now() + 3000;
    try {
      while (!this.disposed && gl.getSyncParameter(sync, gl.SYNC_STATUS) !== gl.SIGNALED && performance.now() < deadline) await sleep(8);
    } finally {
      gl.deleteSync(sync);
    }
  }

  /**
   * Gets a room streamed in while scrolling ready before it is shown, a few objects per task: textures uploaded, every
   * program compiled in the background (KHR_parallel_shader_compile) and the GPU caught up, so the first frame that
   * shows the room only draws it.
   */
  private async warmZone(group: Object3D): Promise<void> {
    await this.upload(group);
    const renderer = this.renderer;
    const pending: Promise<unknown>[] = [];
    const parts = [...group.children, ...variants(group)];
    let slice = performance.now();
    for (const part of parts) {
      if (this.disposed) return;
      const previous = renderer.getRenderTarget();
      renderer.setRenderTarget(this.post ? this.warmTarget : null);
      // compileAsync creates the programs synchronously with the render target bound, then waits for the driver.
      pending.push(renderer.compileAsync(part, this.camera, this.scene));
      renderer.setRenderTarget(previous);
      if (performance.now() - slice > 8) {
        await pause();
        slice = performance.now();
      }
    }
    await Promise.all(pending);
    await this.linked();
    await this.settle();
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.frame = requestAnimationFrame(loop);
      this.tick(now);
    };
    this.frame = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  setMotion(motion: boolean): void {
    this.motion = motion;
    this.dirty = true;
  }

  setJourney(progress: number, ranges?: ChapterRange[]): void {
    if (ranges) this.ranges = ranges;
    this.journey = clamp01(progress);
    this.dirty = true;
  }

  setPanel(value: number): void {
    this.panel = clamp01(value);
    this.dirty = true;
  }

  goTo(target: Target, duration = 1.8): void {
    const from = this.cameraPose();
    this.target = target;
    this.transition = this.motion && duration > 0 ? { from, start: performance.now(), duration: duration * 1000 } : null;
    this.dirty = true;
  }

  setPointer(x: number, y: number): void {
    this.pointer.set((x / this.viewport.width) * 2 - 1, -(y / this.viewport.height) * 2 + 1);
    this.parallaxTarget.set(this.pointer.x, this.pointer.y);
    this.dirty = true;
  }

  clearPointer(): void {
    this.pointer.set(2, 2);
    this.parallaxTarget.set(0, 0);
    if (this.hovered) {
      this.hovered = null;
      this.options.onHover?.(null, 0, 0);
    }
  }

  pick(): string | null {
    const hit = this.intersect();
    return hit?.id ?? null;
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.viewport = { width, height };
    const ratio = Math.min(window.devicePixelRatio, this.tier === "high" ? 1.5 : this.tier === "medium" ? 1.25 : 1);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    const wide = width > 900;
    this.camera.setViewOffset(width, height, wide ? -width * 0.17 : 0, wide ? 0 : height * 0.17, width, height);
    this.camera.updateProjectionMatrix();
    this.post?.setSize(width, height);
    this.dirty = true;
  }

  metrics(): Metrics {
    const info = this.renderer.info;
    const average = this.frameTimes.length ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length : 0;
    return {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      zone: this.lastZone,
      tier: this.tier,
      frameMs: Math.round(average * 10) / 10,
      zones: this.zones.size,
    };
  }

  async renderPose(target: Target, progress: number): Promise<void> {
    this.target = target;
    this.transition = null;
    this.journey = progress;
    const pose = this.currentTargetPose();
    const zone = zoneAt(pose.position[2]);
    const index = zoneOrder.indexOf(zone);
    await Promise.all([zoneOrder[index - 1], zone, zoneOrder[index + 1]].filter(Boolean).map((key) => this.ensure(key as ZoneKey)));
    for (let i = 0; i < 3; i++) this.renderOnce(performance.now());
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    for (const zone of this.zones.values()) zone.dispose();
    this.zones.clear();
    this.post?.dispose();
    this.warmTarget.dispose();
    disposeMaterials(this.materials);
    disposeTextures();
    this.sky.geometry.dispose();
    (this.sky.material as { dispose(): void }).dispose();
    this.scene.environment?.dispose();
    this.options.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
  }

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    document.documentElement.dataset.webgl = "lost";
  };

  private applyTier(post?: Post | null): void {
    this.post?.dispose();
    this.post = post !== undefined ? post : this.tier === "low" || !postModule ? null : postModule.createPost(this.renderer, this.scene, this.camera, this.tier);
    this.post?.setLook(palette.bloom, palette.bloomThreshold, palette.vignette);
    this.renderer.toneMapping = this.post ? NoToneMapping : NeutralToneMapping;
    const sky = this.sky.material.uniforms;
    const direct = !this.post;
    sky.uTop.value.set(direct ? palette.skyTopLow : palette.skyTop);
    sky.uHorizon.value.set(direct ? palette.skyHorizonLow : palette.skyHorizon);
    this.resize();
  }

  private currentTargetPose(): Pose {
    return sampleJourney(this.ranges, this.journey);
  }

  private cameraPose(): Pose {
    const target = this.currentTargetPose();
    if (!this.transition) return target;
    const t = smootherstep((performance.now() - this.transition.start) / this.transition.duration);
    return lerpPose(this.transition.from, target, t);
  }

  private applyPose(): Pose {
    const pose = this.cameraPose();
    this.camera.position.set(...pose.position);
    const look = new Vector3(...pose.target);
    if (this.motion) {
      look.x += this.parallax.x * 0.35;
      look.y += this.parallax.y * 0.2;
    }
    if (this.camera.aspect < 0.8) {
      look.y += 1.1;
      this.camera.position.y += 0.35;
    }
    this.camera.lookAt(look);
    const minimum = (2 * Math.atan(Math.tan((40 * Math.PI) / 360) / this.camera.aspect) * 180) / Math.PI;
    const fov = Math.max(pose.fov, Math.min(minimum, 78));
    if (this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    return pose;
  }

  private async ensure(key: ZoneKey): Promise<Zone> {
    const existing = this.zones.get(key);
    if (existing) return existing;
    let pending = this.building.get(key);
    if (!pending) {
      pending = builders[key]()
        .then(async (build) => {
          // Start in a task of its own, not in the frame (or other work) that asked for the room.
          await pause();
          return build({ m: this.materials, tier: this.tier });
        })
        .then(async (zone) => {
          if (this.disposed) {
            zone.dispose();
            return zone;
          }
          await pause();
          const keep = new Set<Object3D>();
          for (const pickable of zone.pickables) pickable.object.traverse((object: Object3D) => keep.add(object));
          batch(zone.group, keep);
          // The first zones are uploaded and compiled together in load(); later ones on their own.
          if (this.booted) {
            await pause();
            await this.warmZone(zone.group).catch(() => undefined);
          }
          if (this.disposed) {
            zone.dispose();
            return zone;
          }
          this.zones.set(key, zone);
          this.scene.add(zone.group);
          this.building.delete(key);
          this.refreshPickables();
          void this.indexPickables();
          this.dirty = true;
          return zone;
        });
      this.building.set(key, pending);
    }
    return pending;
  }

  private stream(zone: ZoneKey): void {
    const index = zoneOrder.indexOf(zone);
    for (const [key, built] of this.zones) {
      const distance = Math.abs(zoneOrder.indexOf(key) - index);
      built.group.visible = distance <= 1;
      if (distance > 2) {
        this.scene.remove(built.group);
        built.dispose();
        this.zones.delete(key);
        this.refreshPickables();
      }
    }
    if (!this.pumping && this.missing(index, 2)) void this.pump();
  }

  private missing(index: number, reach: number): ZoneKey | undefined {
    for (const offset of [0, 1, -1, 2, -2]) {
      if (Math.abs(offset) > reach) continue;
      const key = zoneOrder[index + offset];
      if (key && !this.zones.has(key) && !this.building.has(key)) return key;
    }
    return undefined;
  }

  /**
   * Builds the rooms around the camera one at a time, outside the frame that noticed them: the room in view and its
   * neighbours first, then (when the browser is idle) the next ones, so a room is ready well before its doorway.
   */
  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;
    try {
      for (;;) {
        await pause();
        if (this.disposed) return;
        const index = zoneOrder.indexOf(this.lastZone);
        let key = this.missing(index, 1);
        if (!key) {
          if (!this.missing(index, 2)) return;
          await idle();
          if (this.disposed) return;
          key = this.missing(zoneOrder.indexOf(this.lastZone), 2);
          if (!key) continue;
        }
        await this.ensure(key).catch(() => undefined);
      }
    } finally {
      this.pumping = false;
    }
  }

  private refreshPickables(): void {
    this.pickables = [...this.zones.values()].filter((zone) => zone.group.visible).flatMap((zone) => zone.pickables);
  }

  /** Builds the picking index (three-mesh-bvh) of new pickable meshes in short slices. */
  private async indexPickables(): Promise<void> {
    if (!bvhReady || this.disposed) return;
    if (this.indexing) {
      this.reindex = true;
      return;
    }
    this.indexing = true;
    try {
      do {
        this.reindex = false;
        let slice = performance.now();
        for (const zone of [...this.zones.values()])
          for (const pickable of zone.pickables) {
            const meshes: Mesh[] = [];
            pickable.object.traverse((object: Object3D) => {
              const mesh = object as Mesh;
              if (mesh.isMesh && !mesh.geometry.boundsTree) meshes.push(mesh);
            });
            for (const mesh of meshes) {
              if (this.disposed) return;
              if (!mesh.geometry.boundsTree) mesh.geometry.computeBoundsTree();
              if (performance.now() - slice > 8) {
                await pause();
                slice = performance.now();
              }
            }
          }
      } while (this.reindex && !this.disposed);
    } finally {
      this.indexing = false;
    }
  }

  private intersect(): Pickable | null {
    if (this.pointer.x > 1 || !this.pickables.length) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.far = 40;
    let best: { pickable: Pickable; distance: number } | null = null;
    for (const pickable of this.pickables) {
      const hits = this.raycaster.intersectObject(pickable.object, true);
      const hit = hits[0];
      if (hit && (!best || hit.distance < best.distance)) best = { pickable, distance: hit.distance };
    }
    return best?.pickable ?? null;
  }

  private assignLights(): void {
    const camera = this.camera.position;
    const specs = this.lightSpecs;
    specs.length = 0;
    for (const zone of this.zones.values()) if (zone.group.visible) for (const spec of zone.lights) specs.push(spec);
    // Runs every frame: sorted without allocating vectors, colours parsed once per light.
    const distance = (spec: LightSpec) => {
      const dx = camera.x - spec.position[0];
      const dy = camera.y - spec.position[1];
      const dz = camera.z - spec.position[2];
      return dx * dx + dy * dy + dz * dz;
    };
    specs.sort((a, b) => distance(a) - distance(b));
    this.pool.forEach((light, index) => {
      const spec = specs[index];
      if (!spec) {
        light.intensity = 0;
        return;
      }
      light.position.set(...spec.position);
      let color = this.specColors.get(spec);
      if (!color) {
        color = new Color(spec.color);
        this.specColors.set(spec, color);
      }
      this.lightColor.copy(color);
      light.color.copy(this.lightColor).lerp(this.lightColor.r >= this.lightColor.b ? this.tints.warm : this.tints.cool, 0.8);
      light.intensity = spec.intensity * palette.lights;
      light.distance = spec.distance;
    });
  }

  private atmosphere(zone: ZoneKey): void {
    const outside = exterior.has(zone);
    this.sky.visible = outside || this.camera.position.z > -3 || this.camera.position.z < -104;
    const fog = this.scene.fog as FogExp2;
    fog.density = (outside ? 0.016 : 0.022) * palette.fogScale;
    fog.color.set(outside ? palette.fogOutside : palette.fogInside);
    this.scene.environmentIntensity = (outside ? 0.24 : 0.56) * palette.environment;
    this.sun.intensity = outside ? palette.sunIntensity : 0;
  }

  private tick(now: number): void {
    const delta = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const transitioning = this.transition !== null;
    if (this.transition && now - this.transition.start >= this.transition.duration) this.transition = null;
    const settling = Math.abs(this.parallax.x - this.parallaxTarget.x) + Math.abs(this.parallax.y - this.parallaxTarget.y) > 0.002;
    const ambient = this.motion && document.visibilityState === "visible";
    if (ambient) this.clock += delta;
    const due = this.dirty || transitioning || settling || this.present !== null || (ambient && Math.round(now / 33) !== Math.round((now - delta * 1000) / 33));
    if (!due) return;
    this.parallax.lerp(this.parallaxTarget, 1 - Math.exp(-delta * 3));
    this.renderOnce(now, delta, transitioning);
  }

  private renderOnce(now: number, delta = 0.016, transitioning = false): void {
    const started = performance.now();
    const pose = this.applyPose();
    const zone = zoneAt(pose.position[2]);
    if (zone !== this.lastZone) this.lastZone = zone;
    this.stream(zone);
    this.atmosphere(zone);
    this.assignLights();
    const frame: Frame = { time: this.motion ? this.clock : 0, delta, camera: this.camera.position, panel: this.panel, motion: this.motion };
    for (const built of this.zones.values()) if (built.group.visible) built.update(frame);
    if (transitioning && this.transition) {
      const t = (now - this.transition.start) / this.transition.duration;
      this.focus = Math.sin(Math.PI * clamp01(t));
    } else this.focus = this.target.kind === "journey" ? travelAt(this.ranges, this.journey) * 0.75 : 0;
    this.animatePresent(now);
    const exposure = exposureAt(this.camera.position.z);
    const output = exposure * palette.exposure;
    if (this.post) this.post.setExposure(output);
    else this.renderer.toneMappingExposure = 1.05 * output;
    const distance = this.aim.set(...pose.target).distanceTo(this.camera.position);
    this.renderer.info.reset();
    if (this.post) this.post.render(delta, this.focus, distance);
    else this.renderer.render(this.scene, this.camera);
    this.hover();
    this.dirty = false;
    this.frameTimes.push(performance.now() - started);
    if (this.frameTimes.length > 90) this.frameTimes.shift();
    // Tests and tools read these; attributes are only written when their value changes.
    this.frames++;
    this.options.canvas.dataset.frames = String(this.frames);
    this.write("zone", zone);
    this.write("calls", String(this.renderer.info.render.calls));
    this.write("triangles", String(this.renderer.info.render.triangles));
    const position = this.camera.position;
    this.write("camera", `${position.x.toFixed(2)},${position.y.toFixed(2)},${position.z.toFixed(2)}`);
    this.write("panel", this.panel.toFixed(2));
    this.write("motion", String(this.motion));
    this.write("exposure", exposure.toFixed(2));
    this.write("focus", this.focus.toFixed(2));
    const subject = this.aim.set(...pose.target).project(this.camera);
    this.write("subject", `${Math.round(((subject.x + 1) / 2) * this.viewport.width)},${Math.round(((1 - subject.y) / 2) * this.viewport.height)}`);
  }

  private write(key: string, value: string): void {
    if (this.written.get(key) === value) return;
    this.written.set(key, value);
    this.options.canvas.dataset[key] = value;
  }

  private animatePresent(now: number): void {
    const present = this.present;
    if (!present) return;
    const t = smootherstep((now - present.start) / present.duration);
    present.object.position.lerpVectors(present.from, present.to, present.restore ? 1 - t : t);
    if (t >= 1) {
      if (present.restore) present.object.position.copy(present.from);
      this.present = null;
      present.done();
    }
  }

  presentPick(): Promise<void> {
    const hit = this.hovered ?? this.intersect();
    if (!hit || !this.motion) return Promise.resolve();
    const object = hit.object;
    const from = object.position.clone();
    const world = object.getWorldPosition(new Vector3());
    const toward = this.camera.position.clone().sub(world).multiplyScalar(0.45);
    const destination = world.clone().add(toward);
    const to = object.parent ? object.parent.worldToLocal(destination) : destination;
    return new Promise((resolve) => {
      this.present = {
        object,
        from,
        to,
        start: performance.now(),
        duration: 650,
        restore: false,
        done: () => {
          resolve();
          setTimeout(() => {
            this.present = { object, from, to, start: performance.now(), duration: 10, restore: true, done: () => undefined };
            this.dirty = true;
          }, 2200);
        },
      };
      this.dirty = true;
    });
  }

  async prepare(target: Target): Promise<void> {
    const previous = this.target;
    this.target = target;
    const pose = this.currentTargetPose();
    this.target = previous;
    const zone = zoneAt(pose.position[2]);
    const index = zoneOrder.indexOf(zone);
    const assets = [zoneOrder[index - 1], zone, zoneOrder[index + 1]].filter(Boolean).flatMap((key) => zoneAssets[key as ZoneKey]);
    await preloadAssets([...new Set(assets)], () => undefined);
    await this.ensure(zone);
  }

  private hover(): void {
    if (this.pointer.x > 1) return;
    const hit = this.intersect();
    if (hit !== this.hovered) {
      this.hovered = hit;
      document.documentElement.classList.toggle("is-pointer-target", Boolean(hit));
    }
    const x = ((this.pointer.x + 1) / 2) * this.viewport.width;
    const y = ((1 - this.pointer.y) / 2) * this.viewport.height;
    this.options.onHover?.(hit?.label ?? null, x, y);
  }

  downgrade(): boolean {
    if (this.tier === "low" || this.switching) return false;
    this.tier = this.tier === "high" ? "medium" : "low";
    this.switching = true;
    void this.switchTier()
      .catch(() => this.applyTier())
      .finally(() => (this.switching = false));
    return true;
  }

  /**
   * Moves to the lower tier once everything it draws with is compiled. Switched at once, every program of the scene
   * (another tone mapping and output) and of the new effects linked synchronously in the next frame: a freeze of
   * seconds on exactly the slow devices that get downgraded. Meanwhile the current tier keeps rendering.
   */
  private async switchTier(): Promise<void> {
    const renderer = this.renderer;
    if (this.tier !== "low" && postModule) {
      const next = postModule.createPost(renderer, this.scene, this.camera, this.tier);
      next.setSize(this.viewport.width, this.viewport.height);
      const pending: Promise<unknown>[] = [];
      const render = renderer.render;
      const target = renderer.getRenderTarget();
      renderer.render = (scene, camera) => void pending.push(renderer.compileAsync(scene, camera));
      try {
        next.render(0, 1, 10);
      } finally {
        renderer.render = render;
        renderer.setRenderTarget(target);
      }
      await Promise.all(pending);
      await this.linked();
      if (this.disposed) {
        next.dispose();
        return;
      }
      next.setLook(palette.bloom, palette.bloomThreshold, palette.vignette);
      this.applyTier(next);
      return;
    }
    const tone = renderer.toneMapping;
    const target = renderer.getRenderTarget();
    renderer.toneMapping = NeutralToneMapping;
    renderer.setRenderTarget(null);
    const pending = [renderer.compileAsync(this.scene, this.camera), ...variants(this.scene).map((object) => renderer.compileAsync(object, this.camera, this.scene))];
    renderer.toneMapping = tone;
    renderer.setRenderTarget(target);
    await Promise.all(pending);
    await this.linked();
    if (!this.disposed) this.applyTier(null);
  }

  get averageFrame(): number {
    return this.frameTimes.length ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length : 0;
  }

  get currentTier(): Tier {
    return this.tier;
  }

  get animating(): boolean {
    return this.motion;
  }
}
