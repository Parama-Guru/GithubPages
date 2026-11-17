import { HalfFloatType, type PerspectiveCamera, type Scene, type WebGLRenderer } from "three";
import {
  BloomEffect,
  BrightnessContrastEffect,
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
  setExposure(value: number): void;
  setLook(bloom: number, threshold: number, vignette: number): void;
  setSize(width: number, height: number): void;
  dispose(): void;
};

export function createPost(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, tier: Tier): Post {
  const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.82, luminanceSmoothing: 0.18, intensity: 1.15, radius: 0.72 });
  const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.62 });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  const exposure = new BrightnessContrastEffect({ brightness: 0, contrast: 0 });
  const dof = tier === "high" ? new DepthOfFieldEffect(camera, { worldFocusRange: 6, bokehScale: 0 }) : null;
  composer.addPass(new EffectPass(camera, bloom, vignette, tone, exposure));
  const dofPass = dof ? new EffectPass(camera, dof) : null;
  if (dofPass) composer.addPass(dofPass);
  composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: tier === "high" ? SMAAPreset.HIGH : SMAAPreset.MEDIUM })));
  return {
    render(delta, focus, distance) {
      if (dof && dofPass) {
        // At a hold nothing is out of focus, so the depth-of-field passes (about a dozen draws) are skipped.
        dofPass.enabled = focus > 0.001;
        dof.bokehScale = focus * 5;
        dof.cocMaterial.worldFocusDistance = distance;
      }
      composer.render(delta);
    },
    setExposure(value) {
      exposure.brightness = (value - 1) * 0.22;
      exposure.contrast = (value - 1) * -0.1;
    },
    setLook(intensity, threshold, darkness) {
      bloom.intensity = intensity;
      bloom.luminanceMaterial.threshold = threshold;
      vignette.darkness = darkness;
    },
    setSize(width, height) {
      composer.setSize(width, height);
    },
    dispose() {
      composer.dispose();
    },
  };
}
