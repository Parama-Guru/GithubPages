import {
  ACESFilmicToneMapping,
  AgXToneMapping,
  BufferGeometry,
  Color,
  FogExp2,
  HemisphereLight,
  Mesh,
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
  type Object3D,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import type { RouteId, ZoneKey } from "@/routes/routes";
import { configureLoaders, preloadAssets, type AssetName } from "./assets";
import { batch, type Frame, type LightSpec, type Pickable, type Zone } from "./kit";
import { createMaterials, disposeMaterials, skyMaterial } from "./materials";
import { clamp01, lerpPose, smootherstep, type Pose } from "./math";
import { evenRanges, exposureAt, sampleJourney, sampleRoute, travelAt, zoneAt, zoneOrder, type ChapterRange } from "./path";
import { createPost, type Post } from "./post";
import { disposeTextures, fontsReady } from "./textures";
import type { Tier, ZoneBuilder } from "./zones/shared";

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

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

export type Target = { kind: "journey" } | { kind: "route"; id: Exclude<RouteId, "home"> };

export type WorldOptions = {
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
  private readonly sky: Mesh;
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
  private routeProgress = 0;
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
  private present: { object: Object3D; from: Vector3; to: Vector3; start: number; duration: number; restore: boolean; done: () => void } | null = null;

  constructor(options: WorldOptions) {
    this.options = options;
    this.tier = options.tier;
    this.motion = options.motion;
    this.renderer = new WebGLRenderer({ canvas: options.canvas, antialias: options.tier === "low", powerPreference: "high-performance", alpha: false, stencil: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor("#05080c");
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.info.autoReset = false;
    configureLoaders(this.renderer);
    this.scene.background = new Color("#05080c");
    this.scene.fog = new FogExp2("#070b12", 0.014);
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environmentIntensity = 0.35;
    this.scene.add(new HemisphereLight("#a9c3dd", "#1b140f", 0.55));
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
    this.resize();
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
    await fontsReady();
    step();
    await preloadAssets(assets, step);
    for (const key of needed) {
      await this.ensure(key);
      step();
    }
    this.applyPose();
    this.compile();
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

  setRouteProgress(progress: number): void {
    this.routeProgress = clamp01(progress);
    this.dirty = true;
  }

  setPanel(value: number): void {
    this.panel = clamp01(value);
    this.dirty = true;
  }

  goTo(target: Target, duration = 1.8): void {
    const from = this.cameraPose();
    this.target = target;
    this.routeProgress = 0;
    this.transition = this.motion && duration > 0 ? { from, start: performance.now(), duration: duration * 1000 } : null;
    this.dirty = true;
  }

  setPointer(x: number, y: number): void {
    this.pointer.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
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
    if (target.kind === "journey") this.journey = progress;
    else this.routeProgress = progress;
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

  private applyTier(): void {
    this.post?.dispose();
    this.post = this.tier === "low" ? null : createPost(this.renderer, this.scene, this.camera, this.tier);
    this.renderer.toneMapping = this.post ? NoToneMapping : AgXToneMapping;
    if (!this.post && this.tier === "low") this.renderer.toneMapping = ACESFilmicToneMapping;
    this.resize();
  }

  private currentTargetPose(): Pose {
    if (this.target.kind === "journey") return sampleJourney(this.ranges, this.journey);
    return sampleRoute(this.target.id, this.routeProgress);
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
        .then((build) => build({ m: this.materials, tier: this.tier }))
        .then((zone) => {
          if (this.disposed) {
            zone.dispose();
            return zone;
          }
          const keep = new Set<Object3D>();
          for (const pickable of zone.pickables) pickable.object.traverse((object: Object3D) => keep.add(object));
          batch(zone.group, keep);
          for (const pickable of zone.pickables)
            pickable.object.traverse((object: Object3D) => {
              const mesh = object as Mesh;
              if (mesh.isMesh && !mesh.geometry.boundsTree) mesh.geometry.computeBoundsTree();
            });
          this.zones.set(key, zone);
          this.scene.add(zone.group);
          this.building.delete(key);
          this.refreshPickables();
          this.dirty = true;
          return zone;
        });
      this.building.set(key, pending);
    }
    return pending;
  }

  private stream(zone: ZoneKey): void {
    const index = zoneOrder.indexOf(zone);
    for (const offset of [0, 1, -1]) {
      const key = zoneOrder[index + offset];
      if (key) void this.ensure(key);
    }
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
  }

  private refreshPickables(): void {
    this.pickables = [...this.zones.values()].filter((zone) => zone.group.visible).flatMap((zone) => zone.pickables);
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
    const specs: LightSpec[] = [];
    for (const zone of this.zones.values()) if (zone.group.visible) specs.push(...zone.lights);
    specs.sort((a, b) => camera.distanceToSquared(new Vector3(...a.position)) - camera.distanceToSquared(new Vector3(...b.position)));
    this.pool.forEach((light, index) => {
      const spec = specs[index];
      if (!spec) {
        light.intensity = 0;
        return;
      }
      light.position.set(...spec.position);
      light.color.set(spec.color);
      light.intensity = spec.intensity;
      light.distance = spec.distance;
    });
  }

  private atmosphere(zone: ZoneKey): void {
    const outside = exterior.has(zone);
    this.sky.visible = outside || this.camera.position.z > -3 || this.camera.position.z < -104;
    const fog = this.scene.fog as FogExp2;
    fog.density = outside ? 0.016 : 0.022;
    fog.color.set(outside ? "#141c28" : "#070b12");
    this.scene.environmentIntensity = outside ? 0.24 : 0.56;
  }

  private compile(): void {
    this.renderer.compile(this.scene, this.camera);
  }

  private tick(now: number): void {
    const delta = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const transitioning = this.transition !== null;
    if (this.transition && now - this.transition.start >= this.transition.duration) this.transition = null;
    const settling = Math.abs(this.parallax.x - this.parallaxTarget.x) + Math.abs(this.parallax.y - this.parallaxTarget.y) > 0.002;
    const ambient = this.motion && document.visibilityState === "visible";
    const due = this.dirty || transitioning || settling || this.present !== null || (ambient && Math.round(now / 33) !== Math.round((now - delta * 1000) / 33));
    if (!due) return;
    if (ambient) this.clock += delta;
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
    if (this.post) this.post.setExposure(exposure);
    else this.renderer.toneMappingExposure = 1.05 * exposure;
    const distance = new Vector3(...pose.target).distanceTo(this.camera.position);
    this.renderer.info.reset();
    if (this.post) this.post.render(delta, this.focus, distance);
    else this.renderer.render(this.scene, this.camera);
    this.hover();
    this.dirty = false;
    this.frameTimes.push(performance.now() - started);
    if (this.frameTimes.length > 90) this.frameTimes.shift();
    const canvas = this.options.canvas;
    canvas.dataset.zone = zone;
    canvas.dataset.calls = String(this.renderer.info.render.calls);
    canvas.dataset.triangles = String(this.renderer.info.render.triangles);
    canvas.dataset.frames = String(Number(canvas.dataset.frames ?? 0) + 1);
    canvas.dataset.camera = this.camera.position.toArray().map((value) => value.toFixed(2)).join(",");
    canvas.dataset.panel = this.panel.toFixed(2);
    canvas.dataset.motion = String(this.motion);
    canvas.dataset.exposure = exposure.toFixed(2);
    canvas.dataset.focus = this.focus.toFixed(2);
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
    const previousProgress = this.routeProgress;
    this.target = target;
    this.routeProgress = 0;
    const pose = this.currentTargetPose();
    this.target = previous;
    this.routeProgress = previousProgress;
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
    const x = ((this.pointer.x + 1) / 2) * window.innerWidth;
    const y = ((1 - this.pointer.y) / 2) * window.innerHeight;
    this.options.onHover?.(hit?.label ?? null, x, y);
  }

  downgrade(): boolean {
    if (this.tier === "low") return false;
    this.tier = this.tier === "high" ? "medium" : "low";
    this.applyTier();
    return true;
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
