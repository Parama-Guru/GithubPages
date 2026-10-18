import type { ThemeId } from "@/app/theme";

export type ScenePalette = {
  background: string;
  fogInside: string;
  fogOutside: string;
  fogScale: number;
  skyTop: string;
  skyHorizon: string;
  skyGlow: string;
  stars: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  environment: number;
  lights: number;
  exposure: number;
  bloom: number;
  bloomThreshold: number;
  vignette: number;
};

export const palettes: Record<ThemeId, ScenePalette> = {
  light: {
    background: "#dfeaf5",
    fogInside: "#d6e1ec",
    fogOutside: "#dce8f4",
    fogScale: 0.7,
    skyTop: "#4f8fd4",
    skyHorizon: "#e4eef8",
    skyGlow: "#fff1d6",
    stars: 0,
    hemiSky: "#ffffff",
    hemiGround: "#7d828a",
    hemi: 2.4,
    environment: 3,
    lights: 1.2,
    exposure: 1.25,
    bloom: 0.5,
    bloomThreshold: 0.93,
    vignette: 0.2,
  },
  copper: {
    background: "#05080c",
    fogInside: "#070b12",
    fogOutside: "#141c28",
    fogScale: 1,
    skyTop: "#060b16",
    skyHorizon: "#1b2433",
    skyGlow: "#9a5636",
    stars: 1,
    hemiSky: "#a9c3dd",
    hemiGround: "#1b140f",
    hemi: 0.55,
    environment: 1,
    lights: 1,
    exposure: 1,
    bloom: 1.15,
    bloomThreshold: 0.82,
    vignette: 0.62,
  },
  signal: {
    background: "#041417",
    fogInside: "#05181b",
    fogOutside: "#0c2b2f",
    fogScale: 1,
    skyTop: "#03161a",
    skyHorizon: "#123d40",
    skyGlow: "#b58a12",
    stars: 0.7,
    hemiSky: "#a6dcd4",
    hemiGround: "#1a1608",
    hemi: 0.55,
    environment: 1,
    lights: 1,
    exposure: 1,
    bloom: 1.1,
    bloomThreshold: 0.82,
    vignette: 0.6,
  },
};
