import { AnimationMixer, type AnimationClip, type Group, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { looks, type Finish, type Look } from "./look";

export type AssetName = "switchgear" | "transformer" | "insulator" | "tower" | "entrance";

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const scenes = new Map<AssetName, Promise<{ scene: Group; clips: AnimationClip[] }>>();
const finishes = new Map<string, Set<MeshStandardMaterial>>();
let modelLook: Look["models"] = looks.copper.models;

function finish(material: MeshStandardMaterial, value: Finish | undefined): void {
  if (!value) return;
  material.color.set(value.color);
  if (value.metalness !== undefined) material.metalness = value.metalness;
  if (value.roughness !== undefined) material.roughness = value.roughness;
}

export function applyModelLook(look: Look): void {
  modelLook = look.models;
  for (const [name, materials] of finishes) for (const material of materials) finish(material, modelLook[name]);
}


function prepare(scene: Group): void {
  scene.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    object.userData.shared = true;
    const material = mesh.material as MeshStandardMaterial;
    if (material.emissiveIntensity > 0 && material.emissive.getHex() !== 0) {
      material.emissiveIntensity = 2.4;
      material.toneMapped = false;
    }
    material.envMapIntensity = 1.1;
    if (material.name) {
      const group = finishes.get(material.name) ?? new Set<MeshStandardMaterial>();
      group.add(material);
      finishes.set(material.name, group);
      finish(material, modelLook[material.name]);
    }
    if (material.transparent) material.depthWrite = false;
  });
}

function load(name: AssetName, onLoaded?: () => void) {
  let pending = scenes.get(name);
  if (!pending) {
    pending = loader.loadAsync(`/GithubPages/ge/models/${name}.glb`).then((gltf) => {
      prepare(gltf.scene);
      onLoaded?.();
      return { scene: gltf.scene, clips: gltf.animations };
    });
    scenes.set(name, pending);
  }
  return pending;
}

async function loadAsset(name: AssetName, onLoaded?: () => void): Promise<Group> {
  return (await load(name, onLoaded)).scene;
}

export async function instance(name: AssetName): Promise<Group> {
  const { scene } = await load(name);
  const copy = scene.clone(true);
  copy.traverse((object: Object3D) => {
    if ((object as Mesh).isMesh) object.userData.shared = true;
  });
  return copy;
}

type Rig = { root: Group; scrub(progress: number): void; dispose(): void };

export async function animated(name: AssetName): Promise<Rig> {
  const { clips } = await load(name);
  const root = await instance(name);
  const mixer = new AnimationMixer(root);
  const duration = Math.max(...clips.map((clip) => clip.duration), 0.001);
  for (const clip of clips) {
    const action = mixer.clipAction(clip);
    action.clampWhenFinished = true;
    action.play();
  }
  mixer.setTime(0);
  let last = -1;
  return {
    root,
    scrub(progress) {
      const time = Math.max(0, Math.min(1, progress)) * duration * 0.9999;
      if (time === last) return;
      last = time;
      mixer.setTime(time);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(root);
    },
  };
}

export function preloadAssets(names: AssetName[], onEach: () => void): Promise<Group[]> {
  return Promise.all(names.map((name) => loadAsset(name, onEach)));
}
