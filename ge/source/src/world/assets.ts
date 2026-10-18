import { type Group, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

export type AssetName = "switchgear" | "transformer" | "insulator" | "tower";

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const scenes = new Map<AssetName, Promise<Group>>();

export function loadAsset(name: AssetName, onLoaded?: () => void): Promise<Group> {
  let pending = scenes.get(name);
  if (!pending) {
    pending = loader.loadAsync(`/GithubPages/ge/models/${name}.glb`).then((gltf) => {
      gltf.scene.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        object.userData.shared = true;
        const material = mesh.material as MeshStandardMaterial;
        if (material.emissiveIntensity > 0 && material.emissive.getHex() !== 0) {
          material.emissiveIntensity = 2.4;
          material.toneMapped = false;
        }
        material.envMapIntensity = 1.1;
        if (material.name === "PanelEnamel") {
          material.color.setRGB(0.3, 0.33, 0.35);
          material.roughness = 0.58;
        }
      });
      onLoaded?.();
      return gltf.scene;
    });
    scenes.set(name, pending);
  }
  return pending;
}

export async function instance(name: AssetName): Promise<Group> {
  const scene = await loadAsset(name);
  const copy = scene.clone(true);
  copy.traverse((object: Object3D) => {
    if ((object as Mesh).isMesh) object.userData.shared = true;
  });
  return copy;
}

export function preloadAssets(names: AssetName[], onEach: () => void): Promise<Group[]> {
  return Promise.all(names.map((name) => loadAsset(name, onEach)));
}
