import data from "./look.json";

export type Finish = {
  color: string;
  tone?: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

// Canvas inks: light panels (plaques, boards), deep sign plates and control-room screens.
export type Ink = {
  panel: string;
  text: string;
  muted: string;
  brand: string;
  accent: string;
  line: string;
  sign: string;
  signText: string;
  signDim: string;
  screenTop: string;
  screenBottom: string;
  screenLine: string;
  screenValue: string;
  safety: string;
  logoGlow: string;
};

export type Look = {
  surfaces: Record<string, Finish>;
  glows: Record<"lightStrip" | "lightWarm" | "lightCool", [string, number]>;
  pools: { warm: string; cool: string; strength: number };
  lightTint: { warm: string; cool: string };
  energy: { warm: string; cool: string };
  ink: Ink;
  models: Record<string, Finish>;
};

/** The single colour palette of the 3D world; Blender reads the same file (blender/build_assets.py). */
export const look = data as unknown as Look;
