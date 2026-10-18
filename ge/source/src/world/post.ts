import { HalfFloatType, type PerspectiveCamera, type Scene, type WebGLRenderer } from "three";
import {
  BloomEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import type { Tier } from "./zones/shared";

export type Post = {
  render(delta: number, focus: number, distance: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
};

export function createPost(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, tier: Tier): Post {
  const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.82, luminanceSmoothing: 0.18, intensity: 1.15, radius: 0.72 });
  const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.62 });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
  const dof = tier === "high" ? new DepthOfFieldEffect(camera, { worldFocusRange: 6, bokehScale: 0 }) : null;
  composer.addPass(new EffectPass(camera, bloom, vignette, tone));
  if (dof) composer.addPass(new EffectPass(camera, dof));
  composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: tier === "high" ? SMAAPreset.HIGH : SMAAPreset.MEDIUM })));
  return {
    render(delta, focus, distance) {
      if (dof) {
        dof.bokehScale = focus * 5;
        dof.cocMaterial.worldFocusDistance = distance;
      }
      composer.render(delta);
    },
    setSize(width, height) {
      composer.setSize(width, height);
    },
    dispose() {
      composer.dispose();
    },
  };
}
