import type { ThemeId } from "@/app/theme";
import data from "./themes.json";

export type Finish = { color: string; tone?: number; metalness?: number; roughness?: number; emissive?: string; emissiveIntensity?: number };

export type Ink = {
  panel: string;
  sign: string;
  accent: string;
  accentStrong: string;
  text: string;
  muted: string;
  dim: string;
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
  lightTint: { warm: string; cool: string } | null;
  energy: { warm: string; cool: string };
  ink: Ink;
  models: Record<string, Finish>;
};

export const looks = data as unknown as Record<ThemeId, Look>;
